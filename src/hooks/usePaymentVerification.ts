import { useState, useEffect } from "react";
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

      // Get the most recent payment for this user and method
      const { data: pendingPayment, error: paymentError } = await supabase
        .from('pagos')
        .select('*')
        .eq('user_id', user.id)
        .eq('metodo_pago', paymentMethod)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (paymentError) {
        console.error('Error fetching payment:', paymentError);
        throw new Error('Error al verificar el pago');
      }

      if (!pendingPayment) {
        console.log('No se encontró pago para verificar');
        return { success: false, planAssigned: false, error: 'No se encontró un pago reciente' };
      }

      console.log('Pago encontrado:', {
        id: pendingPayment.id,
        estado: pendingPayment.estado,
        metodo: pendingPayment.metodo_pago,
        monto: pendingPayment.monto
      });

      // If payment is already completed and has a subscription, just return success
      if (pendingPayment.estado === 'completado' && pendingPayment.suscripcion_id) {
        console.log('Pago ya completado con suscripción:', pendingPayment.suscripcion_id);
        return { success: true, planAssigned: true };
      }

      // Verify payment status with provider
      let paymentVerified = false;

      if (paymentMethod === 'mercadopago') {
        paymentVerified = await verifyMercadoPagoPayment(pendingPayment);
      } else if (paymentMethod === 'paypal') {
        paymentVerified = await verifyPayPalPayment(pendingPayment.paypal_order_id);
      }

      console.log('Verificación con proveedor:', paymentVerified);

      if (paymentVerified || pendingPayment.estado === 'completado') {
        // Update payment status to completed if not already
        if (pendingPayment.estado !== 'completado') {
          console.log('Actualizando estado del pago a completado');
          const { error: updateError } = await supabase
            .from('pagos')
            .update({ 
              estado: 'completado',
              updated_at: new Date().toISOString()
            })
            .eq('id', pendingPayment.id);

          if (updateError) {
            console.error('Error updating payment status:', updateError);
            throw new Error('Error al actualizar el estado del pago');
          }
        }

        // Assign plan to user if not already assigned
        if (!pendingPayment.suscripcion_id) {
          console.log('Asignando plan al usuario');
          const planAssigned = await assignPlanToUser(user.id, pendingPayment.plan_id, pendingPayment.id);
          return { success: true, planAssigned };
        } else {
          return { success: true, planAssigned: true };
        }
      } else {
        // Check if it's a trial plan (precio = 0) - auto-approve
        const { data: plan } = await supabase
          .from('planes')
          .select('precio, periodo')
          .eq('id', pendingPayment.plan_id)
          .single();

        if (plan && (plan.precio === 0 || plan.periodo === 'trial')) {
          console.log('Plan gratuito/trial detectado, aprobando automáticamente');
          
          // Update payment status to completed
          const { error: updateError } = await supabase
            .from('pagos')
            .update({ 
              estado: 'completado',
              updated_at: new Date().toISOString()
            })
            .eq('id', pendingPayment.id);

          if (updateError) {
            console.error('Error updating trial payment status:', updateError);
            throw new Error('Error al procesar el plan gratuito');
          }

          // Assign plan to user
          const planAssigned = await assignPlanToUser(user.id, pendingPayment.plan_id, pendingPayment.id);
          return { success: true, planAssigned };
        }

        return { success: false, planAssigned: false, error: 'El pago no ha sido confirmado por el proveedor' };
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

  const verifyMercadoPagoPayment = async (payment: any): Promise<boolean> => {
    if (!payment.mercadopago_preferencia_id && !payment.mercadopago_id) {
      console.log('No hay ID de MercadoPago para verificar');
      return false;
    }

    try {
      console.log('Verificando pago de MercadoPago');

      const { data: mpConfig, error: mpError } = await supabase
        .from('mercadopago_config')
        .select('*')
        .single();

      if (mpError || !mpConfig) {
        console.error('MercadoPago config not found');
        return false;
      }

      // If we have a direct payment ID, check it
      if (payment.mercadopago_id) {
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${payment.mercadopago_id}`, {
          headers: {
            'Authorization': `Bearer ${mpConfig.access_token}`,
          }
        });

        if (response.ok) {
          const paymentData = await response.json();
          console.log('Estado del pago MercadoPago:', paymentData.status);
          return paymentData.status === 'approved';
        }
      }

      // Check for payments associated with this preference
      if (payment.mercadopago_preferencia_id) {
        const response = await fetch(`https://api.mercadopago.com/v1/payments/search?external_reference=${payment.mercadopago_preferencia_id}`, {
          headers: {
            'Authorization': `Bearer ${mpConfig.access_token}`,
          }
        });

        if (response.ok) {
          const searchResult = await response.json();
          console.log('Resultado búsqueda MercadoPago:', searchResult);
          
          // Check if any payment is approved
          const hasApprovedPayment = searchResult.results && searchResult.results.some((p: any) => p.status === 'approved');
          return hasApprovedPayment;
        }
      }
      
      return false;
      
    } catch (error) {
      console.error('Error verifying MercadoPago payment:', error);
      return false;
    }
  };

  const verifyPayPalPayment = async (orderId: string | null): Promise<boolean> => {
    if (!orderId) return false;

    try {
      const { data: ppConfigData, error: ppError } = await supabase
        .from('api_config')
        .select('*')
        .eq('config_type', 'paypal')
        .single();

      if (ppError || !ppConfigData) {
        console.error('PayPal config not found');
        return false;
      }

      const ppConfig = JSON.parse(ppConfigData.config_data);
      const baseUrl = ppConfig.environment === 'sandbox' ? 'https://api.sandbox.paypal.com' : 'https://api.paypal.com';

      // Get access token
      const credentials = btoa(`${ppConfig.client_id}:${ppConfig.client_secret}`);
      const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials'
      });

      if (!tokenResponse.ok) {
        console.error('Error getting PayPal token');
        return false;
      }

      const { access_token } = await tokenResponse.json();

      // Get order details
      const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        }
      });

      if (!orderResponse.ok) {
        console.error('Error fetching PayPal order');
        return false;
      }

      const order = await orderResponse.json();
      return order.status === 'COMPLETED' || order.status === 'APPROVED';

    } catch (error) {
      console.error('Error verifying PayPal payment:', error);
      return false;
    }
  };

  const assignPlanToUser = async (userId: string, planId: string, paymentId: string): Promise<boolean> => {
    try {
      console.log('Asignando plan al usuario:', { userId, planId, paymentId });

      // Get the plan information
      const { data: plan, error: planError } = await supabase
        .from('planes')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError || !plan) {
        console.error('Error fetching plan:', planError);
        throw new Error('Plan no encontrado');
      }

      console.log('Plan encontrado:', plan.nombre, 'Periodo:', plan.periodo);

      // Calculate end date
      const fechaInicio = new Date();
      const fechaFin = new Date(fechaInicio);
      
      if (plan.periodo === 'trial') {
        // Para planes de prueba, dar exactamente 3 días
        fechaFin.setDate(fechaFin.getDate() + 3);
      } else if (plan.periodo === 'mensual') {
        fechaFin.setMonth(fechaFin.getMonth() + 1);
      } else if (plan.periodo === 'trimestral') {
        fechaFin.setMonth(fechaFin.getMonth() + 3);
      } else if (plan.periodo === 'anual') {
        fechaFin.setFullYear(fechaFin.getFullYear() + 1);
      } else {
        fechaFin.setMonth(fechaFin.getMonth() + 1); // Default to 1 month
      }

      console.log('Fechas de suscripción:', { 
        fechaInicio: fechaInicio.toISOString(), 
        fechaFin: fechaFin.toISOString() 
      });

      // Deactivate existing subscriptions
      const { error: deactivateError } = await supabase
        .from('suscripciones')
        .update({ 
          estado: 'inactiva',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('estado', 'activa');

      if (deactivateError) {
        console.error('Error deactivating existing subscriptions:', deactivateError);
      } else {
        console.log('Suscripciones anteriores desactivadas');
      }

      // Create new subscription
      const { data: subscription, error: subscriptionError } = await supabase
        .from('suscripciones')
        .insert({
          user_id: userId,
          plan_id: planId,
          fecha_inicio: fechaInicio.toISOString(),
          fecha_fin: fechaFin.toISOString(),
          estado: 'activa',
          pago_id: paymentId
        })
        .select()
        .single();

      if (subscriptionError) {
        console.error('Error creating subscription:', subscriptionError);
        throw new Error('Error al crear la suscripción');
      }

      console.log('Subscription created successfully:', subscription.id);

      // Update payment with subscription_id
      const { error: linkError } = await supabase
        .from('pagos')
        .update({
          suscripcion_id: subscription.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (linkError) {
        console.error('Error linking payment to subscription:', linkError);
      } else {
        console.log('Pago vinculado a suscripción exitosamente');
      }

      return true;

    } catch (error) {
      console.error('Error assigning plan to user:', error);
      return false;
    }
  };

  return {
    verifyAndProcessPayment,
    isVerifying
  };
};
