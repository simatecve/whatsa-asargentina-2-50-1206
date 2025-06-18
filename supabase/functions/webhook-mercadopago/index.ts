
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

    const webhookData = await req.json();
    console.log('Webhook data received:', JSON.stringify(webhookData, null, 2));

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

      // Find payment by preference_id OR mercadopago_id
      let payment = null;
      let paymentError = null;

      // Try to find by preference_id first
      if (paymentData.preference_id) {
        const { data: paymentsByPreference, error: prefError } = await supabaseClient
          .from('pagos')
          .select('*')
          .eq('mercadopago_preferencia_id', paymentData.preference_id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (!prefError && paymentsByPreference && paymentsByPreference.length > 0) {
          payment = paymentsByPreference[0];
        } else {
          paymentError = prefError;
        }
      }

      // If not found by preference_id, try by mercadopago_id
      if (!payment && paymentData.id) {
        const { data: paymentsById, error: idError } = await supabaseClient
          .from('pagos')
          .select('*')
          .eq('mercadopago_id', paymentData.id.toString())
          .order('created_at', { ascending: false })
          .limit(1);

        if (!idError && paymentsById && paymentsById.length > 0) {
          payment = paymentsById[0];
        } else {
          paymentError = idError;
        }
      }

      if (!payment) {
        console.error('Payment not found in database for preference_id:', paymentData.preference_id, 'or payment_id:', paymentData.id);
        console.error('Search error:', paymentError);
        return new Response(JSON.stringify({ error: 'Payment not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('Found payment in database:', payment.id);

      // Map status
      let newStatus = 'pendiente';
      switch (paymentData.status) {
        case 'approved':
          newStatus = 'completado';
          break;
        case 'rejected':
          newStatus = 'rechazado';
          break;
        case 'cancelled':
          newStatus = 'cancelado';
          break;
        case 'pending':
        case 'in_process':
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

      // If payment approved, create subscription
      if (newStatus === 'completado' && payment.plan_id && !payment.suscripcion_id) {
        console.log('Payment approved, creating subscription');
        
        // Get plan details
        const { data: plan, error: planError } = await supabaseClient
          .from('planes')
          .select('*')
          .eq('id', payment.plan_id)
          .single();

        if (planError || !plan) {
          console.error('Error fetching plan:', planError);
          return new Response(JSON.stringify({ error: 'Plan not found' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Calculate subscription dates
        const fechaInicio = new Date();
        const fechaFin = new Date(fechaInicio);
        
        if (plan.periodo === 'trial') {
          fechaFin.setDate(fechaFin.getDate() + 3);
        } else if (plan.periodo === 'mensual') {
          fechaFin.setMonth(fechaFin.getMonth() + 1);
        } else if (plan.periodo === 'trimestral') {
          fechaFin.setMonth(fechaFin.getMonth() + 3);
        } else if (plan.periodo === 'anual') {
          fechaFin.setFullYear(fechaFin.getFullYear() + 1);
        } else {
          fechaFin.setMonth(fechaFin.getMonth() + 1);
        }

        // Deactivate existing subscriptions
        const { error: deactivateError } = await supabaseClient
          .from('suscripciones')
          .update({ 
            estado: 'inactiva',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', payment.user_id)
          .eq('estado', 'activa');

        if (deactivateError) {
          console.error('Error deactivating existing subscriptions:', deactivateError);
        }

        // Create new subscription
        const { data: subscription, error: subError } = await supabaseClient
          .from('suscripciones')
          .insert({
            user_id: payment.user_id,
            plan_id: payment.plan_id,
            fecha_inicio: fechaInicio.toISOString(),
            fecha_fin: fechaFin.toISOString(),
            estado: 'activa',
            pago_id: payment.id
          })
          .select()
          .single();

        if (subError) {
          console.error('Error creating subscription:', subError);
        } else {
          console.log('Subscription created successfully:', subscription.id);
          
          // Link payment to subscription
          await supabaseClient
            .from('pagos')
            .update({
              suscripcion_id: subscription.id,
              updated_at: new Date().toISOString()
            })
            .eq('id', payment.id);
        }
      }
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
