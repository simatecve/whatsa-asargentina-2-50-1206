
import { createAdminClient } from './utils.ts'

export const updateUserPassword = async (params: any) => {
  const supabaseAdmin = createAdminClient()
  const { userId, newPassword } = params
  
  if (!userId || !newPassword) {
    throw new Error('UserId y newPassword son requeridos')
  }
  
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { password: newPassword }
  )

  if (updateError) {
    console.error('Error updating password:', updateError)
    throw new Error(`Error actualizando contraseña: ${updateError.message}`)
  }

  return { success: true }
}
