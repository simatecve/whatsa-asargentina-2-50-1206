
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Admin login as user request started')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No autorizado - falta token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verificar que quien hace la petición es admin
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      console.error('Error de autenticación:', authError)
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Usuario autenticado:', user.email)

    // Verificar permisos de admin
    const { data: adminUser } = await supabaseClient
      .from('usuarios')
      .select('perfil')
      .eq('user_id', user.id)
      .single()

    if (!adminUser || adminUser.perfil !== 'administrador') {
      console.error('Usuario sin permisos de admin')
      return new Response(
        JSON.stringify({ error: 'Sin permisos de administrador' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { targetUserEmail } = await req.json()

    if (!targetUserEmail) {
      return new Response(
        JSON.stringify({ error: 'Email de usuario requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Generando acceso para usuario:', targetUserEmail)

    // Verificar que el usuario objetivo existe
    const { data: targetUserAuth, error: userError } = await supabaseClient.auth.admin.listUsers()
    
    if (userError) {
      console.error('Error listando usuarios:', userError)
      return new Response(
        JSON.stringify({ error: 'Error al buscar usuario' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const targetAuthUser = targetUserAuth.users.find(u => u.email === targetUserEmail)
    
    if (!targetAuthUser) {
      return new Response(
        JSON.stringify({ error: 'Usuario no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar datos del usuario en la tabla usuarios
    const { data: targetUser } = await supabaseClient
      .from('usuarios')
      .select('*')
      .eq('user_id', targetAuthUser.id)
      .single()

    if (!targetUser) {
      return new Response(
        JSON.stringify({ error: 'Usuario no encontrado en sistema' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // No permitir login como admin
    if (targetUser.perfil === 'administrador') {
      return new Response(
        JSON.stringify({ error: 'No se puede hacer login como otro administrador' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Generando link mágico para usuario:', targetAuthUser.id)

    // Generar link mágico para el usuario objetivo
    const { data: linkData, error: linkError } = await supabaseClient.auth.admin.generateLink({
      type: 'magiclink',
      email: targetUserEmail,
      options: {
        redirectTo: `${req.headers.get('origin') || 'http://localhost:3000'}/dashboard`
      }
    })

    if (linkError || !linkData) {
      console.error('Error generando link:', linkError)
      return new Response(
        JSON.stringify({ error: 'Error generando tokens de acceso' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Link generado exitosamente')

    // Extraer tokens del action_link
    const actionLink = linkData.properties?.action_link
    if (!actionLink) {
      return new Response(
        JSON.stringify({ error: 'No se pudo generar enlace de acceso' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extraer tokens de la URL
    const url = new URL(actionLink)
    const fragment = url.hash.substring(1) // Remover el #
    const params = new URLSearchParams(fragment)
    
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    if (!accessToken || !refreshToken) {
      return new Response(
        JSON.stringify({ error: 'No se pudieron extraer los tokens' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Tokens extraídos correctamente')

    return new Response(
      JSON.stringify({
        success: true,
        session: {
          access_token: accessToken,
          refresh_token: refreshToken
        },
        user: {
          id: targetAuthUser.id,
          email: targetAuthUser.email,
          user_metadata: targetAuthUser.user_metadata || {}
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error en admin-login-as-user:', error)
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
