
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
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

    const { action, ...params } = await req.json()

    let result

    switch (action) {
      case 'createUser':
        result = await createUser(supabaseAdmin, params)
        break
      case 'updatePassword':
        result = await updatePassword(supabaseAdmin, params)
        break
      case 'deleteUser':
        result = await deleteUser(supabaseAdmin, params)
        break
      case 'generateMagicLink':
        result = await generateMagicLink(supabaseAdmin, params)
        break
      default:
        throw new Error('Acción no válida')
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function createUser(supabaseAdmin: any, params: any) {
  const { email, password, nombre, perfil } = params

  console.log('Creating user:', email)

  // Verificar si ya existe un usuario con este email
  const { data: existingUser } = await supabaseAdmin
    .from("usuarios")
    .select("email")
    .eq("email", email.trim())
    .maybeSingle()

  if (existingUser) {
    throw new Error("Ya existe un usuario con este email")
  }

  // Crear usuario usando auth admin
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email.trim(),
    password: password,
    email_confirm: true,
    user_metadata: {
      nombre: nombre.trim()
    }
  })

  if (authError) {
    console.error('Error creating auth user:', authError)
    throw new Error(`Error creando usuario: ${authError.message}`)
  }

  if (!authData.user) {
    throw new Error('No se pudo crear el usuario en el sistema de autenticación')
  }

  console.log('Auth user created successfully:', authData.user.id)

  // Insertar en tabla usuarios
  const { error: userError } = await supabaseAdmin
    .from("usuarios")
    .insert({
      user_id: authData.user.id,
      nombre: nombre.trim(),
      email: email.trim(),
      perfil: perfil,
    })

  if (userError) {
    console.error('Error inserting user record:', userError)
    
    // Si falla la inserción, eliminar el usuario de auth
    try {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      console.log('Deleted auth user due to profile creation failure')
    } catch (deleteError) {
      console.error('Error deleting auth user:', deleteError)
    }
    
    throw new Error(`Error guardando perfil de usuario: ${userError.message}`)
  }

  console.log('User record inserted successfully')
  return { success: true, user_id: authData.user.id }
}

async function updatePassword(supabaseAdmin: any, params: any) {
  const { userId, password } = params

  console.log('Updating password for user:', userId)

  const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { password: password }
  )

  if (passwordError) {
    console.error("Error actualizando contraseña:", passwordError)
    throw new Error(`Error al actualizar la contraseña: ${passwordError.message}`)
  }

  console.log('Password updated successfully')
  return { success: true }
}

async function deleteUser(supabaseAdmin: any, params: any) {
  const { userId } = params

  console.log('Deleting user:', userId)

  // Obtener el user_id del usuario a eliminar
  const { data: userToDelete } = await supabaseAdmin
    .from("usuarios")
    .select("user_id, nombre")
    .eq("id", userId)
    .single()

  if (!userToDelete) {
    throw new Error("Usuario no encontrado")
  }

  // Primero eliminar de la tabla usuarios
  const { error: deleteUserRecordError } = await supabaseAdmin
    .from("usuarios")
    .delete()
    .eq("id", userId)

  if (deleteUserRecordError) {
    console.error('Error deleting user record:', deleteUserRecordError)
    throw new Error(`Error eliminando registro de usuario: ${deleteUserRecordError.message}`)
  }

  // Luego eliminar del sistema de auth
  if (userToDelete.user_id) {
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userToDelete.user_id)

    if (deleteAuthError) {
      console.error('Error deleting user from auth:', deleteAuthError)
      console.warn('User record deleted but auth user deletion failed')
    }
  }

  console.log('User successfully deleted')
  return { success: true, nombre: userToDelete.nombre }
}

async function generateMagicLink(supabaseAdmin: any, params: any) {
  const { email } = params

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: email,
    options: {
      redirectTo: `${Deno.env.get('SUPABASE_URL')}/dashboard`
    }
  })

  if (error) {
    throw new Error(`Error generando enlace de acceso: ${error.message}`)
  }

  return { success: true, action_link: data?.properties?.action_link }
}
