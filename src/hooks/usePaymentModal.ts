
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Plan {
  id: string;
  nombre: string;
  precio: number;
  moneda: string;
  descripcion?: string;
  periodo?: string;
}

interface User {
  id: string;
  nombre: string;
  email: string;
}

export const usePaymentModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'mercadopago' | 'paypal' | null>(null);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);

  const activatePlanAfterPayment = async (plan: Plan, userId: string) => {
    try {
      console.log('Activando plan después del pago exitoso:', { planId: plan.id, userId });

      // Calculate end date
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
          plan_id: plan.id,
          fecha_inicio: fechaInicio.toISOString(),
          fecha_fin: fechaFin.toISOString(),
          estado: 'activa',
        })
        .select()
        .single();

      if (subscriptionError) {
        console.error('Error creating subscription:', subscriptionError);
        throw new Error('Error al crear la suscripción');
      }

      console.log('Subscription created successfully:', subscription.id);
      return subscription.id;

    } catch (error) {
      console.error('Error activating plan after payment:', error);
      throw error;
    }
  };

  const openPaymentModal = async (plan: Plan) => {
    setIsProcessing(true);
    setSelectedPlan(plan);
    setIsModalOpen(true);
    setIsProcessing(false);
  };

  const processPayment = async (paymentMethod: 'mercadopago' | 'paypal') => {
    setIsProcessing(true);
    setSelectedPaymentMethod(paymentMethod);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error('No hay sesión activa');
      }

      console.log('Usuario autenticado:', session.user.id);

      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (userError || !userData) {
        console.error('Error obteniendo datos de usuario:', userError);
        throw new Error('Perfil de usuario no encontrado');
      }

      console.log('Datos de usuario obtenidos:', userData.nombre);

      if (paymentMethod === 'mercadopago') {
        await processMercadoPagoPayment(session);
      } else if (paymentMethod === 'paypal') {
        await processPayPalPayment(session, userData);
      }

    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast.error(error.message || "Error al procesar el pago");
    } finally {
      setIsProcessing(false);
    }
  };

  const processMercadoPagoPayment = async (session: any) => {
    try {
      console.log('Iniciando proceso de pago con MercadoPago usando edge function');

      // Usar la edge function create-payment
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          planId: selectedPlan?.id,
          redirectMode: 'modal'
        }
      });

      if (error) {
        console.error('Error en edge function:', error);
        throw new Error(error.message || 'Error al crear la preferencia de pago');
      }

      if (!data || !data.success) {
        console.error('Respuesta inválida de edge function:', data);
        throw new Error('Error al procesar el pago');
      }

      console.log('Preferencia creada exitosamente:', data);
      setPreferenceId(data.preference_id);

    } catch (error) {
      console.error('Error en processMercadoPagoPayment:', error);
      throw error;
    }
  };

  const processPayPalPayment = async (session: any, userData: any) => {
    try {
      console.log('Iniciando proceso de pago PayPal');

      // Obtener configuración de PayPal
      const { data: ppConfigData, error: ppError } = await supabase
        .from('api_config')
        .select('*')
        .eq('config_type', 'paypal')
        .single();

      if (ppError || !ppConfigData || !ppConfigData.config_data) {
        console.error('Error obteniendo configuración PayPal:', ppError);
        toast.error('PayPal no está configurado. Contacte al administrador.');
        throw new Error('Configuración de PayPal no encontrada');
      }

      let ppConfig;
      try {
        ppConfig = JSON.parse(ppConfigData.config_data);
        console.log('Configuración PayPal parseada:', { 
          enabled: ppConfig.enabled, 
          environment: ppConfig.environment,
          hasClientId: !!ppConfig.client_id,
          hasClientSecret: !!ppConfig.client_secret
        });
      } catch (error) {
        console.error('Error parsing PayPal config:', error);
        toast.error('Configuración de PayPal inválida. Contacte al administrador.');
        throw new Error('Configuración de PayPal inválida');
      }

      if (!ppConfig.enabled) {
        toast.error('PayPal está deshabilitado. Contacte al administrador.');
        throw new Error('PayPal está deshabilitado');
      }

      if (!ppConfig.client_id || !ppConfig.client_secret) {
        console.error('Credenciales PayPal faltantes:', { 
          hasClientId: !!ppConfig.client_id, 
          hasClientSecret: !!ppConfig.client_secret 
        });
        toast.error('Configuración de PayPal incompleta. Contacte al administrador.');
        throw new Error('Configuración de PayPal incompleta');
      }

      // Crear orden de PayPal usando edge function (si existe) o directamente
      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: selectedPlan?.moneda === 'MXN' ? 'MXN' : 'USD',
            value: selectedPlan?.precio.toString()
          },
          description: `${selectedPlan?.nombre} - WhatsApp Marketing`
        }],
        application_context: {
          return_url: `${window.location.origin}/dashboard/planes?payment=success&method=paypal`,
          cancel_url: `${window.location.origin}/dashboard/planes?payment=cancelled&method=paypal`
        }
      };

      console.log('Datos de la orden PayPal:', orderData);

      // Configurar URL base según ambiente
      const baseUrl = ppConfig.environment === 'sandbox' ? 'https://api.sandbox.paypal.com' : 'https://api.paypal.com';
      console.log('URL base PayPal:', baseUrl);

      // Obtener token de acceso de PayPal
      const credentials = btoa(`${ppConfig.client_id}:${ppConfig.client_secret}`);
      console.log('Obteniendo token de PayPal...');

      const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: 'grant_type=client_credentials'
      });

      if (!tokenResponse.ok) {
        const tokenError = await tokenResponse.text();
        console.error('Error obteniendo token PayPal:', {
          status: tokenResponse.status,
          statusText: tokenResponse.statusText,
          error: tokenError,
          environment: ppConfig.environment,
          baseUrl: baseUrl
        });
        
        if (tokenResponse.status === 401) {
          toast.error('Las credenciales de PayPal no son válidas. Verifique Client ID y Client Secret.');
        } else {
          toast.error(`Error al conectar con PayPal (${tokenResponse.status}). Contacte al administrador.`);
        }
        throw new Error('Error al obtener token de PayPal');
      }

      const tokenData = await tokenResponse.json();
      console.log('Token de PayPal obtenido exitosamente');

      // Crear orden de PayPal
      console.log('Creando orden PayPal...');
      const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!orderResponse.ok) {
        const orderError = await orderResponse.text();
        console.error('Error creando orden PayPal:', {
          status: orderResponse.status,
          statusText: orderResponse.statusText,
          error: orderError
        });
        toast.error(`Error al crear orden de PayPal (${orderResponse.status}). Contacte al administrador.`);
        throw new Error('Error al crear orden de PayPal');
      }

      const orderResult = await orderResponse.json();
      console.log('Orden de PayPal creada exitosamente:', orderResult.id);

      await createPaymentRecord(session.user.id, 'paypal', orderResult.id, orderData);
      
      setPaypalOrderId(orderResult.id);

      // Redirigir a PayPal
      const approveUrl = orderResult.links.find((link: any) => link.rel === 'approve')?.href;
      if (approveUrl) {
        console.log('Redirigiendo a PayPal:', approveUrl);
        window.open(approveUrl, '_blank');
      } else {
        console.error('No se encontró URL de aprobación en la respuesta de PayPal');
        toast.error('Error al obtener enlace de pago de PayPal');
        throw new Error('No se pudo obtener enlace de pago');
      }

    } catch (error) {
      console.error('Error en processPayPalPayment:', error);
      throw error;
    }
  };

  const createPaymentRecord = async (userId: string, method: string, externalId: string, paymentData: any) => {
    console.log('Creando registro de pago con datos:', {
      user_id: userId,
      plan_id: selectedPlan?.id,
      monto: selectedPlan?.precio,
      moneda: selectedPlan?.moneda || "ARS",
      metodo_pago: method,
      external_id: externalId
    });

    const { data: payment, error: paymentError } = await supabase
      .from('pagos')
      .insert([
        {
          user_id: userId,
          plan_id: selectedPlan?.id,
          monto: Number(selectedPlan?.precio),
          moneda: selectedPlan?.moneda || "ARS",
          metodo_pago: method,
          [method === 'mercadopago' ? 'mercadopago_preferencia_id' : 'paypal_order_id']: externalId,
          estado: 'pendiente',
          datos_pago: paymentData
        }
      ])
      .select()
      .single();

    if (paymentError) {
      console.error('Error creando registro de pago:', paymentError);
      throw new Error(`Error al registrar el pago: ${paymentError.message}`);
    }

    console.log('Registro de pago creado exitosamente:', payment.id);
    return payment;
  };

  const closePaymentModal = () => {
    setIsModalOpen(false);
    setPreferenceId(null);
    setSelectedPlan(null);
    setSelectedPaymentMethod(null);
    setPaypalOrderId(null);
  };

  const handlePaymentSuccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user || !selectedPlan) {
        toast.error("Error al procesar el plan");
        return;
      }

      // Activar plan después del pago exitoso
      await activatePlanAfterPayment(selectedPlan, session.user.id);
      
      toast.success("¡Plan activado exitosamente!");
      closePaymentModal();
    } catch (error) {
      console.error('Error activating plan after payment:', error);
      toast.error("Plan pagado pero hubo un error al activarlo. Contacte soporte.");
    }
  };

  const handlePaymentFailure = () => {
    toast.error("El pago no pudo completarse.");
  };

  return {
    isModalOpen,
    preferenceId,
    selectedPlan,
    isProcessing,
    selectedPaymentMethod,
    paypalOrderId,
    openPaymentModal,
    processPayment,
    closePaymentModal,
    handlePaymentSuccess,
    handlePaymentFailure
  };
};
