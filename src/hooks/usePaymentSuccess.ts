
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePaymentSuccess = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processPaymentSuccess = async (paymentMethod: 'mercadopago' | 'paypal') => {
    setIsProcessing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      console.log('Procesando éxito de pago para usuario:', user.id, 'método:', paymentMethod);

      // Verificar pagos recientes que necesiten procesamiento
      const { data: pendingPayments, error: paymentError } = await supabase
        .from('pagos')
        .select('*')
        .eq('user_id', user.id)
        .eq('metodo_pago', paymentMethod)
        .in('estado', ['pendiente', 'aprobado'])
        .order('created_at', { ascending: false })
        .limit(5);

      if (paymentError) {
        console.error('Error fetching payments:', paymentError);
        throw new Error('Error al verificar el pago');
      }

      if (!pendingPayments || pendingPayments.length === 0) {
        console.log('No hay pagos pendientes para procesar');
        return false;
      }

      // Procesar cada pago pendiente
      for (const payment of pendingPayments) {
        console.log('Procesando pago:', payment.id);
        
        // Verificar el estado del pago con el proveedor
        const isVerified = await verifyPaymentWithProvider(payment, paymentMethod);
        
        if (isVerified) {
          console.log('Pago verificado exitosamente:', payment.id);
          
          // Actualizar estado del pago
          const { error: updateError } = await supabase
            .from('pagos')
            .update({ 
              estado: 'completado',
              updated_at: new Date().toISOString()
            })
            .eq('id', payment.id);

          if (updateError) {
            console.error('Error updating payment:', updateError);
            continue;
          }

          // Crear o actualizar suscripción
          const subscriptionCreated = await createSubscriptionForPayment(payment);
          
          if (subscriptionCreated) {
            toast.success('¡Pago procesado y plan activado exitosamente!');
            return true;
          }
        }
      }

      return false;

    } catch (error) {
      console.error('Error processing payment success:', error);
      toast.error('Error al procesar el pago');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyPaymentWithProvider = async (payment: any, method: 'mercadopago' | 'paypal'): Promise<boolean> => {
    try {
      if (method === 'mercadopago') {
        // Verificar con MercadoPago
        const { data: mpConfig } = await supabase
          .from('mercadopago_config')
          .select('access_token')
          .single();

        if (!mpConfig?.access_token) {
          console.error('MercadoPago access token not found');
          return false;
        }

        // Verificar por preference_id
        if (payment.mercadopago_preferencia_id) {
          const response = await fetch(`https://api.mercadopago.com/v1/payments/search?preference_id=${payment.mercadopago_preferencia_id}`, {
            headers: { 'Authorization': `Bearer ${mpConfig.access_token}` }
          });

          if (response.ok) {
            const searchResult = await response.json();
            const approvedPayment = searchResult.results?.find((p: any) => p.status === 'approved');
            
            if (approvedPayment) {
              // Actualizar con el ID de MercadoPago
              await supabase
                .from('pagos')
                .update({ mercadopago_id: approvedPayment.id.toString() })
                .eq('id', payment.id);
              
              return true;
            }
          }
        }

        // Verificar por mercadopago_id si existe
        if (payment.mercadopago_id) {
          const response = await fetch(`https://api.mercadopago.com/v1/payments/${payment.mercadopago_id}`, {
            headers: { 'Authorization': `Bearer ${mpConfig.access_token}` }
          });

          if (response.ok) {
            const paymentData = await response.json();
            return paymentData.status === 'approved';
          }
        }

      } else if (method === 'paypal' && payment.paypal_order_id) {
        // Verificar con PayPal
        const { data: ppConfigData } = await supabase
          .from('api_config')
          .select('config_data')
          .eq('config_type', 'paypal')
          .single();

        if (!ppConfigData?.config_data) {
          console.error('PayPal config not found');
          return false;
        }

        const ppConfig = JSON.parse(ppConfigData.config_data);
        const baseUrl = ppConfig.environment === 'sandbox' ? 'https://api.sandbox.paypal.com' : 'https://api.paypal.com';

        // Obtener token de acceso
        const credentials = btoa(`${ppConfig.client_id}:${ppConfig.client_secret}`);
        const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials'
        });

        if (tokenResponse.ok) {
          const { access_token } = await tokenResponse.json();
          
          // Verificar estado de la orden
          const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders/${payment.paypal_order_id}`, {
            headers: { 'Authorization': `Bearer ${access_token}` }
          });

          if (orderResponse.ok) {
            const order = await orderResponse.json();
            return order.status === 'COMPLETED' || order.status === 'APPROVED';
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error verifying with provider:', error);
      return false;
    }
  };

  const createSubscriptionForPayment = async (payment: any) => {
    try {
      console.log('Creating subscription for payment:', payment.id);
      
      // Obtener información del plan
      const { data: plan, error: planError } = await supabase
        .from('planes')
        .select('*')
        .eq('id', payment.plan_id)
        .single();

      if (planError || !plan) {
        console.error('Error fetching plan:', planError);
        throw new Error('Plan no encontrado');
      }

      // Calcular fechas de suscripción
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
        fechaFin.setMonth(fechaFin.getMonth() + 1); // Default a 1 mes
      }

      // Desactivar suscripciones existentes
      const { error: deactivateError } = await supabase
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

      // Crear nueva suscripción
      const { data: subscription, error: subscriptionError } = await supabase
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

      if (subscriptionError) {
        console.error('Error creating subscription:', subscriptionError);
        throw new Error('Error al crear la suscripción');
      }

      console.log('Subscription created successfully:', subscription.id);

      // Vincular pago con suscripción
      const { error: linkError } = await supabase
        .from('pagos')
        .update({
          suscripcion_id: subscription.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.id);

      if (linkError) {
        console.error('Error linking payment to subscription:', linkError);
      }

      return true;

    } catch (error) {
      console.error('Error creating subscription:', error);
      return false;
    }
  };

  return {
    processPaymentSuccess,
    isProcessing
  };
};
