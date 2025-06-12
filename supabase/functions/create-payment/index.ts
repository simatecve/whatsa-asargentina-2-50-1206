
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== CREATE PAYMENT FUNCTION START ===');
    console.log('Request method:', req.method);
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Retrieve authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error('No authorization header found');
      return new Response(JSON.stringify({ error: 'Authorization header is required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      console.error('User authentication failed:', userError);
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const user = userData.user;
    console.log('Authenticated user:', user.id, user.email);

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { planId, redirectMode = 'redirect' } = requestBody;
    console.log('Request data:', { planId, redirectMode });

    if (!planId) {
      return new Response(JSON.stringify({ error: 'Plan ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get MercadoPago configuration
    console.log('Fetching MercadoPago configuration...');
    const { data: mpConfig, error: mpConfigError } = await supabaseClient
      .from('mercadopago_config')
      .select('*')
      .single();

    if (mpConfigError || !mpConfig) {
      console.error('MercadoPago config error:', mpConfigError);
      return new Response(JSON.stringify({ 
        error: 'MercadoPago no está configurado. Por favor configure MercadoPago en el panel de administración.',
        details: mpConfigError
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!mpConfig.access_token) {
      console.error('Invalid MercadoPago config:', mpConfig);
      return new Response(JSON.stringify({ 
        error: 'Token de acceso de MercadoPago no configurado. Configure MercadoPago en el panel de administración.',
        details: 'Missing access_token in configuration'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('MercadoPago config found:', { 
      environment: mpConfig.environment,
      hasAccessToken: !!mpConfig.access_token 
    });

    // Get plan details
    console.log('Fetching plan with ID:', planId);
    const { data: plan, error: planError } = await supabaseClient
      .from('planes')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      console.error('Plan error:', planError);
      return new Response(JSON.stringify({ 
        error: 'Plan no encontrado', 
        details: planError 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Plan found:', plan);

    // Get user details from usuarios table
    const { data: usuarioData, error: usuarioError } = await supabaseClient
      .from('usuarios')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (usuarioError || !usuarioData) {
      console.error('Usuario data error:', usuarioError);
      return new Response(JSON.stringify({ 
        error: 'Perfil de usuario no encontrado. Complete su perfil primero.',
        details: usuarioError
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Usuario data found:', { 
      id: usuarioData.id, 
      nombre: usuarioData.nombre 
    });

    // Create MercadoPago preference
    const mpUrl = 'https://api.mercadopago.com/checkout/preferences';
      
    const baseUrl = req.headers.get('origin') || req.headers.get('referer') || 'https://whatsaasargentina-43.lovable.app';
    
    const preferenceData = {
      items: [
        {
          title: `${plan.nombre} - WhatsApp Marketing`,
          description: plan.descripcion || `Plan ${plan.nombre}`,
          quantity: 1,
          currency_id: plan.moneda === 'MXN' ? 'MXN' : 'ARS',
          unit_price: Number(plan.precio)
        }
      ],
      payer: {
        email: user.email,
        name: usuarioData.nombre || 'Usuario'
      },
      back_urls: {
        success: `${baseUrl}/dashboard/planes?payment=success`,
        failure: `${baseUrl}/dashboard/planes?payment=failure`,
        pending: `${baseUrl}/dashboard/planes?payment=pending`
      },
      auto_return: 'approved',
      external_reference: `${user.id}-${planId}-${Date.now()}`,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/webhook-mercadopago`,
      // Configure for modal integration if requested
      ...(redirectMode === 'modal' && {
        purpose: 'wallet_purchase'
      })
    };

    console.log('Creating MercadoPago preference with data:', preferenceData);

    const mpResponse = await fetch(mpUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mpConfig.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferenceData)
    });

    const mpData = await mpResponse.json();
    console.log('MercadoPago response status:', mpResponse.status);
    console.log('MercadoPago response data:', mpData);

    if (!mpResponse.ok) {
      console.error('MercadoPago API error:', mpData);
      
      let errorMessage = 'Error al crear la preferencia de pago en MercadoPago';
      if (mpData.message && mpData.message.includes('Invalid users parameter')) {
        errorMessage = 'Las credenciales de MercadoPago no son válidas. Contacte al administrador.';
      } else if (mpData.message) {
        errorMessage = `Error de MercadoPago: ${mpData.message}`;
      }
      
      return new Response(JSON.stringify({ 
        error: errorMessage, 
        details: mpData,
        status: mpResponse.status
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create payment record
    console.log('Creating payment record...');
    const { data: payment, error: paymentError } = await supabaseClient
      .from('pagos')
      .insert({
        user_id: user.id,
        plan_id: planId,
        monto: plan.precio,
        moneda: plan.moneda || "ARS",
        metodo_pago: 'mercadopago',
        mercadopago_preferencia_id: mpData.id,
        estado: 'pendiente'
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment record error:', paymentError);
      return new Response(JSON.stringify({ 
        error: 'Error al crear el registro de pago', 
        details: paymentError 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Payment record created successfully:', payment.id);

    const responseData = { 
      payment_id: payment.id,
      preference_id: mpData.id,
      init_point: mpData.init_point,
      sandbox_init_point: mpData.sandbox_init_point,
      success: true,
      redirect_mode: redirectMode
    };

    console.log('Sending response:', responseData);

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error in create-payment function:', error);
    return new Response(JSON.stringify({ 
      error: 'Error interno del servidor',
      message: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
