
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Usuario } from "../../components/types";
import { checkAdminPermissions } from "./permissionsUtils";

export const loginAsUser = async (user: Usuario): Promise<void> => {
  try {
    console.log("Iniciando login como usuario:", user.email);

    // Verificar permisos de admin
    if (!await checkAdminPermissions()) {
      return;
    }

    // Verificaciones básicas
    if (user.perfil === 'administrador') {
      toast.error("No se puede hacer login como otro administrador");
      return;
    }

    if (!user.email) {
      toast.error("El usuario no tiene un email válido");
      return;
    }

    const loadingToast = toast.loading(`Generando acceso para ${user.nombre}...`);

    try {
      // Verificar que el usuario existe en auth.users
      const { data: userData, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        console.error('Error listando usuarios:', listError);
        toast.dismiss(loadingToast);
        toast.error("Error al verificar usuario");
        return;
      }

      const targetAuthUser = userData?.users?.find((u: any) => u.email === user.email);
      
      if (!targetAuthUser) {
        toast.dismiss(loadingToast);
        toast.error("Usuario no encontrado");
        return;
      }

      console.log("Usuario encontrado, generando link de acceso...");

      // Generar link mágico para el usuario objetivo
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: user.email,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (linkError || !linkData) {
        console.error('Error generando link:', linkError);
        toast.dismiss(loadingToast);
        toast.error("Error al generar acceso");
        return;
      }

      // Extraer tokens del action_link
      const actionLink = linkData.properties?.action_link;
      if (!actionLink) {
        toast.dismiss(loadingToast);
        toast.error("No se pudo generar el enlace de acceso");
        return;
      }

      console.log("Link generado:", actionLink);

      // Extraer tokens de la URL
      const url = new URL(actionLink);
      const fragment = url.hash.substring(1); // Remover el #
      const params = new URLSearchParams(fragment);
      
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (!accessToken || !refreshToken) {
        toast.dismiss(loadingToast);
        toast.error("No se pudieron extraer los tokens de acceso");
        return;
      }

      console.log("Tokens extraídos correctamente, estableciendo sesión...");

      // Establecer la nueva sesión
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (sessionError) {
        console.error('Error estableciendo sesión:', sessionError);
        toast.dismiss(loadingToast);
        toast.error(`Error al cambiar sesión: ${sessionError.message}`);
        return;
      }

      toast.dismiss(loadingToast);
      toast.success(`¡Sesión cambiada exitosamente a ${user.nombre}!`);
      
      // Redirigir al dashboard después de un breve delay
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
      
    } catch (functionError: any) {
      console.error("Error en login como usuario:", functionError);
      toast.dismiss(loadingToast);
      
      const errorMessage = functionError?.message || 
                          functionError?.details || 
                          "Error al comunicarse con el sistema";
      
      toast.error(`Error: ${errorMessage}`);
    }
    
  } catch (error: any) {
    console.error("Error general en login como usuario:", error);
    toast.error(`Error inesperado: ${error.message || 'Error desconocido'}`);
  }
};
