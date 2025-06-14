
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Login as user request started')
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Crear cliente admin de Supabase
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

    // Verificar autorización del admin que hace la petición
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No authorization header')
      return new Response(
        JSON.stringify({ success: false, error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verificar que quien hace la petición es un usuario válido
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      console.error('Error de autenticación:', authError)
      return new Response(
        JSON.stringify({ success: false, error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar que el usuario actual es admin
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('usuarios')
      .select('perfil')
      .eq('user_id', user.id)
      .single()

    if (adminError || !adminUser || adminUser.perfil !== 'administrador') {
      console.error('Usuario sin permisos de admin')
      return new Response(
        JSON.stringify({ success: false, error: 'Sin permisos de administrador' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { userEmail } = await req.json()

    if (!userEmail) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email de usuario requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Generando tokens para:', userEmail)

    // Buscar el usuario objetivo por email
    const { data: targetUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error listando usuarios:', listError)
      return new Response(
        JSON.stringify({ success: false, error: 'Error al buscar usuario' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const targetUser = targetUsers.users.find(u => u.email === userEmail)
    
    if (!targetUser) {
      console.error('Usuario no encontrado:', userEmail)
      return new Response(
        JSON.stringify({ success: false, error: 'Usuario no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generar tokens de acceso para el usuario objetivo
    const { data: tokenData, error: tokenError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email: userEmail,
      options: {
        redirectTo: `${new URL(req.url).origin}/dashboard`
      }
    })

    if (tokenError || !tokenData) {
      console.error('Error generando tokens:', tokenError)
      return new Response(
        JSON.stringify({ success: false, error: 'Error generando tokens de acceso' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Crear una sesión válida para el usuario objetivo
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.createUser({
      email: userEmail,
      email_confirm: true,
      user_metadata: {}
    })

    if (sessionError && !sessionError.message.includes('already registered')) {
      console.error('Error en sesión:', sessionError)
      return new Response(
        JSON.stringify({ success: false, error: 'Error creando sesión' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generar tokens JWT válidos para el usuario
    const now = Math.floor(Date.now() / 1000)
    const accessToken = await generateJWT({
      sub: targetUser.id,
      email: userEmail,
      aud: 'authenticated',
      role: 'authenticated',
      iat: now,
      exp: now + 3600 // 1 hora
    })

    const refreshToken = await generateJWT({
      sub: targetUser.id,
      iat: now,
      exp: now + (30 * 24 * 60 * 60) // 30 días
    })

    console.log('Tokens generados exitosamente')

    return new Response(
      JSON.stringify({
        success: true,
        accessToken,
        refreshToken,
        message: 'Tokens generados exitosamente'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error en login-as-user:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Función auxiliar para generar JWT (simplificada)
async function generateJWT(payload: any): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  }
  
  const encodedHeader = btoa(JSON.stringify(header))
  const encodedPayload = btoa(JSON.stringify(payload))
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(Deno.env.get('SUPABASE_JWT_SECRET') || 'your-secret-key'),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ),
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
  )
  
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
  
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`
}
