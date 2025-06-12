
import { createAdminClient } from './utils.ts'

export const generateMagicLink = async (params: any) => {
  const supabaseAdmin = createAdminClient()
  const { email: linkEmail, redirectTo } = params
  
  if (!linkEmail) {
    throw new Error('Email es requerido')
  }
  
  const { data, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: linkEmail,
    options: {
      redirectTo: redirectTo
    }
  })

  if (linkError) {
    console.error('Error generating magic link:', linkError)
    throw new Error(`Error generando link mágico: ${linkError.message}`)
  }

  return { 
    success: true, 
    actionLink: data?.properties?.action_link 
  }
}
