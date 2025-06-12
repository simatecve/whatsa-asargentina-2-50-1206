
import { createAdminClient } from './utils.ts'

export const deleteUser = async (params: any) => {
  const supabaseAdmin = createAdminClient()
  const { userId: deleteUserId } = params
  
  if (!deleteUserId) {
    throw new Error('UserId es requerido')
  }
  
  console.log('Attempting to delete user:', deleteUserId)
  
  // Primero eliminar de la tabla usuarios
  const { error: deleteUserRecordError } = await supabaseAdmin
    .from("usuarios")
    .delete()
    .eq("user_id", deleteUserId)

  if (deleteUserRecordError) {
    console.error('Error deleting user record:', deleteUserRecordError)
    // Continuar con la eliminación de auth aunque falle la tabla usuarios
  }
  
  // Luego eliminar del sistema de auth
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(deleteUserId)

  if (deleteError) {
    console.error('Error deleting user from auth:', deleteError)
    throw new Error(`Error eliminando usuario: ${deleteError.message}`)
  }

  console.log('User successfully deleted from auth system')

  return { success: true }
}
