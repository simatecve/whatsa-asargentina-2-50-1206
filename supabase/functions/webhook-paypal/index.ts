
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== WEBHOOK PAYPAL START ===')
    console.log('Request method:', req.method)
    console.log('Request headers:', Object.fromEntries(req.headers))
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Parse request
    const webhookData = await req.json()
    console.log('PayPal webhook data received:', webhookData)
    
    if (webhookData.event_type && webhookData.resource) {
      const eventType = webhookData.event_type
      const resource = webhookData.resource
      
      console.log('Processing PayPal event:', eventType)
      
      // Handle different PayPal webhook events
      if (eventType === 'CHECKOUT.ORDER.APPROVED' || eventType === 'PAYMENT.CAPTURE.COMPLETED') {
        const orderId = resource.id || resource.supplementary_data?.related_ids?.order_id
        console.log('Processing PayPal order ID:', orderId)
        
        // Find the payment with this PayPal order ID
        const { data: payment, error: paymentError } = await supabase
          .from('pagos')
          .select('*')
          .eq('paypal_order_id', orderId)
          .single()
        
        if (paymentError || !payment) {
          console.error('Payment not found in database for PayPal order ID:', orderId)
          return new Response(JSON.stringify({ error: 'Payment not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        
        console.log('Payment found in database:', payment.id)
        
        // Update payment status
        const paymentStatus = eventType === 'PAYMENT.CAPTURE.COMPLETED' ? 'completado' : 'completado'
        
        console.log('Updating payment status to:', paymentStatus)
        
        const { error: updateError } = await supabase
          .from('pagos')
          .update({
            estado: paymentStatus,
            datos_pago: webhookData,
            updated_at: new Date().toISOString()
          })
          .eq('id', payment.id)
        
        if (updateError) {
          console.error('Error updating payment:', updateError)
          return new Response(JSON.stringify({ error: 'Error updating payment', details: updateError }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        
        console.log('Payment updated successfully')
        
        // If payment is completed, create or update subscription
        if (paymentStatus === 'completado' && payment.plan_id && !payment.suscripcion_id) {
          console.log('Payment completed, creating subscription...')
          
          // Get the plan information
          const { data: plan, error: planError } = await supabase
            .from('planes')
            .select('*')
            .eq('id', payment.plan_id)
            .single()
          
          if (planError || !plan) {
            console.error('Error fetching plan:', planError)
            return new Response(JSON.stringify({ error: 'Plan not found', details: planError }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
          }
          
          console.log('Plan found:', plan.nombre)
          
          // Calculate end date
          const fechaInicio = new Date()
          const fechaFin = new Date(fechaInicio)
          
          if (plan.periodo === 'trial') {
            fechaFin.setDate(fechaFin.getDate() + 3)
          } else if (plan.periodo === 'mensual') {
            fechaFin.setMonth(fechaFin.getMonth() + 1)
          } else if (plan.periodo === 'trimestral') {
            fechaFin.setMonth(fechaFin.getMonth() + 3)
          } else if (plan.periodo === 'anual') {
            fechaFin.setFullYear(fechaFin.getFullYear() + 1)
          } else {
            fechaFin.setMonth(fechaFin.getMonth() + 1) // Default to 1 month
          }
          
          console.log('Creating subscription from', fechaInicio.toISOString(), 'to', fechaFin.toISOString())
          
          // Deactivate existing subscriptions
          const { error: deactivateError } = await supabase
            .from('suscripciones')
            .update({ 
              estado: 'inactiva',
              updated_at: new Date().toISOString()
            })
            .eq('user_id', payment.user_id)
            .eq('estado', 'activa')
          
          if (deactivateError) {
            console.error('Error deactivating existing subscriptions:', deactivateError)
          }
          
          // Create new subscription
          const { data: subscription, error: subscriptionError } = await supabase
            .from('suscripciones')
            .insert({
              user_id: payment.user_id,
              plan_id: plan.id,
              fecha_inicio: fechaInicio.toISOString(),
              fecha_fin: fechaFin.toISOString(),
              estado: 'activa',
              pago_id: payment.id
            })
            .select()
            .single()
          
          if (subscriptionError) {
            console.error('Error creating subscription:', subscriptionError)
            return new Response(JSON.stringify({ error: 'Error creating subscription', details: subscriptionError }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
          }
          
          console.log('Subscription created successfully:', subscription.id)
          
          // Update payment with subscription_id
          const { error: linkError } = await supabase
            .from('pagos')
            .update({
              suscripcion_id: subscription.id,
              updated_at: new Date().toISOString()
            })
            .eq('id', payment.id)
          
          if (linkError) {
            console.error('Error linking payment to subscription:', linkError)
          } else {
            console.log('Payment linked to subscription successfully')
          }
        }
        
        return new Response(JSON.stringify({ 
          success: true, 
          payment_status: paymentStatus,
          message: 'PayPal webhook processed successfully' 
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }
    
    console.log('PayPal webhook received but not a payment notification')
    return new Response(JSON.stringify({ message: 'Not a payment webhook' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
    
  } catch (error) {
    console.error('PayPal webhook error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
