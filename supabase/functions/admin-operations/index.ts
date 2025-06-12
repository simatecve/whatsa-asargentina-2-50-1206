
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from './utils.ts'
import { createUser } from './create-user.ts'
import { updateUserPassword } from './update-password.ts'
import { generateMagicLink } from './generate-magic-link.ts'
import { deleteUser } from './delete-user.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, ...params } = await req.json()

    let result
    switch (action) {
      case 'createUser':
        result = await createUser(params)
        break
      case 'updateUserPassword':
        result = await updateUserPassword(params)
        break
      case 'generateMagicLink':
        result = await generateMagicLink(params)
        break
      case 'deleteUser':
        result = await deleteUser(params)
        break
      default:
        throw new Error('Acción no válida')
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error en admin-operations:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error interno del servidor',
        details: error.toString()
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
