
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Admin login as user request started')
  
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

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No authorization header')
      return new Response(
        JSON.stringify({ success: false, error: 'No autorizado - falta token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verificar que quien hace la petición es admin
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      console.error('Error de autenticación:', authError)
      return new Response(
        JSON.stringify({ success: false, error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Usuario autenticado:', user.email)

    // Verificar permisos de admin
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('usuarios')
      .select('perfil')
      .eq('user_id', user.id)
      .single()

    if (adminError || !adminUser || adminUser.perfil !== 'administrador') {
      console.error('Usuario sin permisos de admin:', adminError)
      return new Response(
        JSON.stringify({ success: false, error: 'Sin permisos de administrador' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { targetUserEmail } = await req.json()

    if (!targetUserEmail) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email de usuario requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Generando acceso para usuario:', targetUserEmail)

    // Buscar el usuario objetivo en auth.users
    const { data: targetUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error listando usuarios:', listError)
      return new Response(
        JSON.stringify({ success: false, error: 'Error al buscar usuario' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const targetUser = targetUsers.users.find(u => u.email === targetUserEmail)
    
    if (!targetUser) {
      console.error('Usuario no encontrado:', targetUserEmail)
      return new Response(
        JSON.stringify({ success: false, error: 'Usuario no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar que no es admin
    const { data: targetUserData } = await supabaseAdmin
      .from('usuarios')
      .select('perfil')
      .eq('user_id', targetUser.id)
      .single()

    if (targetUserData?.perfil === 'administrador') {
      return new Response(
        JSON.stringify({ success: false, error: 'No se puede hacer login como otro administrador' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Generando enlace mágico para:', targetUser.id)

    // Generar enlace mágico
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: targetUserEmail,
      options: {
        redirectTo: `${new URL(req.url).origin}/dashboard`
      }
    })

    if (linkError || !linkData?.properties?.action_link) {
      console.error('Error generando enlace:', linkError)
      return new Response(
        JSON.stringify({ success: false, error: 'Error generando enlace de acceso' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Enlace generado exitosamente')

    // En lugar de intentar procesar tokens, simplemente redirigir al enlace mágico
    return new Response(
      JSON.stringify({
        success: true,
        redirectUrl: linkData.properties.action_link,
        message: 'Enlace de acceso generado exitosamente'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error en admin-login-as-user:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
