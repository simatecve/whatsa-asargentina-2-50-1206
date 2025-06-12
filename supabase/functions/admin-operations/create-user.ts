
import { createAdminClient } from './utils.ts'

export const createUser = async (params: any) => {
  const supabaseAdmin = createAdminClient()
  const { email, password, nombre, perfil } = params
  
  console.log('Creating new user with admin client:', { email, nombre, perfil })
  
  // Verificar que todos los campos requeridos estén presentes
  if (!email || !password || !nombre) {
    throw new Error('Email, password y nombre son requeridos')
  }

  // Verificar si ya existe un usuario en la tabla usuarios con este email usando maybeSingle()
  const { data: existingUser, error: checkError } = await supabaseAdmin
    .from("usuarios")
    .select("user_id, email")
    .eq("email", email)
    .maybeSingle()

  if (checkError) {
    console.error('Error checking existing user:', checkError)
    throw new Error('Error al verificar usuario existente')
  }

  if (existingUser) {
    throw new Error('Ya existe un usuario con este email')
  }

  // Crear usuario en auth con el cliente admin
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true, // Auto-confirmar email
    user_metadata: {
      nombre: nombre
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

  // Insertar en tabla usuarios usando solo las columnas que existen
  const { error: userError } = await supabaseAdmin
    .from("usuarios")
    .insert({
      user_id: authData.user.id,
      nombre: nombre,
      email: email,
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

  return {
    success: true, 
    user: {
      id: authData.user.id,
      email: authData.user.email,
      nombre: nombre,
      perfil: perfil
    }
  }
}
