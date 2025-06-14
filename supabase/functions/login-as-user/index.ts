
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`[${new Date().toISOString()}] Login as user request received. Method: ${req.method}`)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    console.log('Admin client created.')

    const body = await req.json()
    console.log('Request body:', JSON.stringify(body, null, 2))

    const { userEmail, redirectTo } = body

    if (!userEmail || !redirectTo) {
      console.log('Missing userEmail or redirectTo')
      return new Response(
        JSON.stringify({ success: false, error: 'El email de usuario y la URL de redirección son requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Generating magic link for: ${userEmail} with redirect to: ${redirectTo}`)

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: userEmail,
      options: {
        redirectTo: redirectTo
      }
    })

    if (linkError) {
      console.error('Error generating magic link:', JSON.stringify(linkError, null, 2))
      return new Response(
        JSON.stringify({ success: false, error: linkError.message || 'Error generando enlace de acceso' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!linkData) {
      console.error('No data returned from generateLink')
      return new Response(
        JSON.stringify({ success: false, error: 'No se pudo generar el enlace de acceso' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Magic link generated successfully:', JSON.stringify(linkData, null, 2))

    return new Response(
      JSON.stringify({
        success: true,
        magicLink: linkData.properties?.action_link,
        message: 'Enlace mágico generado exitosamente'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in login-as-user:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    return new Response(
      JSON.stringify({ success: false, error: 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
