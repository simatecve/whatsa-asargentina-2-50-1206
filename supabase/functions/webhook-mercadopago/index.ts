
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== WEBHOOK MERCADOPAGO START ===');
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse the webhook data
    const webhookData = await req.json();
    console.log('Webhook data received:', JSON.stringify(webhookData, null, 2));

    // MercadoPago sends different types of notifications
    if (webhookData.type === 'payment') {
      const paymentId = webhookData.data?.id;
      
      if (!paymentId) {
        console.log('No payment ID found in webhook');
        return new Response(JSON.stringify({ status: 'ok' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('Processing payment notification for ID:', paymentId);

      // Get MercadoPago configuration
      const { data: mpConfig } = await supabaseClient
        .from('mercadopago_config')
        .select('access_token')
        .single();

      if (!mpConfig?.access_token) {
        console.error('MercadoPago access token not found');
        return new Response(JSON.stringify({ error: 'Configuration error' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get payment details from MercadoPago API
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${mpConfig.access_token}`
        }
      });

      if (!mpResponse.ok) {
        console.error('Error fetching payment from MercadoPago:', await mpResponse.text());
        return new Response(JSON.stringify({ error: 'Failed to fetch payment' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const paymentData = await mpResponse.json();
      console.log('Payment data from MercadoPago:', JSON.stringify(paymentData, null, 2));

      // Find the payment in our database using preference_id
      const { data: payments, error: paymentError } = await supabaseClient
        .from('pagos')
        .select('*')
        .eq('mercadopago_preferencia_id', paymentData.preference_id);

      if (paymentError || !payments || payments.length === 0) {
        console.error('Payment not found in database:', paymentError);
        return new Response(JSON.stringify({ error: 'Payment not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const payment = payments[0];
      console.log('Found payment in database:', payment.id);

      // Map MercadoPago status to our status
      let newStatus = 'pendiente';
      switch (paymentData.status) {
        case 'approved':
          newStatus = 'aprobado';
          break;
        case 'rejected':
          newStatus = 'rechazado';
          break;
        case 'cancelled':
          newStatus = 'cancelado';
          break;
        case 'in_process':
        case 'pending':
          newStatus = 'pendiente';
          break;
        default:
          newStatus = 'pendiente';
      }

      console.log(`Updating payment status from ${payment.estado} to ${newStatus}`);

      // Update payment status
      const { error: updateError } = await supabaseClient
        .from('pagos')
        .update({
          estado: newStatus,
          mercadopago_id: paymentData.id.toString(),
          datos_pago: paymentData,
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.id);

      if (updateError) {
        console.error('Error updating payment:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to update payment' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // If payment is approved, create or update subscription
      if (newStatus === 'aprobado' && payment.plan_id) {
        console.log('Payment approved, creating/updating subscription');
        
        // Calculate subscription dates
        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + 1); // Add 1 month

        // Check if user already has an active subscription
        const { data: existingSub } = await supabaseClient
          .from('suscripciones')
          .select('*')
          .eq('user_id', payment.user_id)
          .eq('estado', 'activa')
          .single();

        if (existingSub) {
          // Update existing subscription
          const { error: subError } = await supabaseClient
            .from('suscripciones')
            .update({
              plan_id: payment.plan_id,
              fecha_fin: endDate.toISOString(),
              pago_id: payment.id,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingSub.id);

          if (subError) {
            console.error('Error updating subscription:', subError);
          } else {
            console.log('Subscription updated successfully');
          }
        } else {
          // Create new subscription
          const { error: subError } = await supabaseClient
            .from('suscripciones')
            .insert({
              user_id: payment.user_id,
              plan_id: payment.plan_id,
              fecha_inicio: now.toISOString(),
              fecha_fin: endDate.toISOString(),
              estado: 'activa',
              pago_id: payment.id
            });

          if (subError) {
            console.error('Error creating subscription:', subError);
          } else {
            console.log('Subscription created successfully');
          }
        }
      }

      console.log('Payment webhook processed successfully');
    }

    return new Response(JSON.stringify({ status: 'ok' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
