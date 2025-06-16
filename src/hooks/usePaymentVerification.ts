
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentVerificationResult {
  success: boolean;
  planAssigned: boolean;
  error?: string;
}

export const usePaymentVerification = () => {
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyAndProcessPayment = async (paymentMethod: 'mercadopago' | 'paypal'): Promise<PaymentVerificationResult> => {
    setIsVerifying(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      console.log('Verificando pago para usuario:', user.id, 'método:', paymentMethod);

      // Get recent completed payments
      const { data: completedPayments, error: paymentError } = await supabase
        .from('pagos')
        .select(`
          *,
          suscripciones!inner(*)
        `)
        .eq('user_id', user.id)
        .eq('metodo_pago', paymentMethod)
        .eq('estado', 'completado')
        .is('suscripcion_id', null)
        .order('created_at', { ascending: false })
        .limit(3);

      if (paymentError) {
        console.error('Error fetching payments:', paymentError);
        throw new Error('Error al verificar el pago');
      }

      if (!completedPayments || completedPayments.length === 0) {
        // Check for pending payments that might have been processed
        const { data: pendingPayments } = await supabase
          .from('pagos')
          .select('*')
          .eq('user_id', user.id)
          .eq('metodo_pago', paymentMethod)
          .in('estado', ['pendiente', 'aprobado'])
          .order('created_at', { ascending: false })
          .limit(1);

        if (pendingPayments && pendingPayments.length > 0) {
          const pendingPayment = pendingPayments[0];
          
          // Verify with provider
          const isVerified = await verifyPaymentWithProvider(pendingPayment, paymentMethod);
          
          if (isVerified) {
            // Update payment status
            await supabase
              .from('pagos')
              .update({ 
                estado: 'completado',
                updated_at: new Date().toISOString()
              })
              .eq('id', pendingPayment.id);

            // Create subscription
            const subscription = await createSubscriptionForPayment(pendingPayment);
            return { success: true, planAssigned: !!subscription };
          }
        }
        
        return { success: false, planAssigned: false, error: 'No se encontró un pago completado reciente' };
      }

      // Process the most recent completed payment without subscription
      const payment = completedPayments[0];
      console.log('Procesando pago completado:', payment.id);

      const subscription = await createSubscriptionForPayment(payment);
      
      if (subscription) {
        return { success: true, planAssigned: true };
      } else {
        return { success: false, planAssigned: false, error: 'Error al crear la suscripción' };
      }

    } catch (error) {
      console.error('Error verifying payment:', error);
      return { 
        success: false, 
        planAssigned: false, 
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyPaymentWithProvider = async (payment: any, method: 'mercadopago' | 'paypal'): Promise<boolean> => {
    try {
      if (method === 'mercadopago') {
        const { data: mpConfig } = await supabase
          .from('mercadopago_config')
          .select('access_token')
          .single();

        if (!mpConfig?.access_token) return false;

        if (payment.mercadopago_id) {
          const response = await fetch(`https://api.mercadopago.com/v1/payments/${payment.mercadopago_id}`, {
            headers: { 'Authorization': `Bearer ${mpConfig.access_token}` }
          });

          if (response.ok) {
            const paymentData = await response.json();
            return paymentData.status === 'approved';
          }
        }

        if (payment.mercadopago_preferencia_id) {
          const response = await fetch(`https://api.mercadopago.com/v1/payments/search?preference_id=${payment.mercadopago_preferencia_id}`, {
            headers: { 'Authorization': `Bearer ${mpConfig.access_token}` }
          });

          if (response.ok) {
            const searchResult = await response.json();
            return searchResult.results?.some((p: any) => p.status === 'approved');
          }
        }
      } else if (method === 'paypal' && payment.paypal_order_id) {
        const { data: ppConfigData } = await supabase
          .from('api_config')
          .select('config_data')
          .eq('config_type', 'paypal')
          .single();

        if (!ppConfigData?.config_data) return false;

        const ppConfig = JSON.parse(ppConfigData.config_data);
        const baseUrl = ppConfig.environment === 'sandbox' ? 'https://api.sandbox.paypal.com' : 'https://api.paypal.com';

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
      const { data: plan } = await supabase
        .from('planes')
        .select('*')
        .eq('id', payment.plan_id)
        .single();

      if (!plan) {
        throw new Error('Plan no encontrado');
      }

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
      await supabase
        .from('suscripciones')
        .update({ 
          estado: 'inactiva',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', payment.user_id)
        .eq('estado', 'activa');

      // Create new subscription
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

      // Link payment to subscription
      await supabase
        .from('pagos')
        .update({
          suscripcion_id: subscription.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.id);

      return subscription;

    } catch (error) {
      console.error('Error creating subscription:', error);
      return null;
    }
  };

  return {
    verifyAndProcessPayment,
    isVerifying
  };
};
