
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

    const loadingToast = toast.loading(`Iniciando sesión como ${user.nombre}...`);

    try {
      // Llamar a la nueva función edge simplificada
      const { data, error } = await supabase.functions.invoke('login-as-user', {
        body: { 
          userEmail: user.email
        }
      });

      toast.dismiss(loadingToast);

      if (error) {
        console.error('Error en función edge:', error);
        toast.error(`Error: ${error.message}`);
        return;
      }

      if (!data?.success) {
        toast.error(data?.error || "No se pudo cambiar la sesión");
        return;
      }

      // La función retorna directamente el token de acceso
      if (data.accessToken) {
        // Establecer la nueva sesión
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: data.accessToken,
          refresh_token: data.refreshToken
        });

        if (setSessionError) {
          console.error('Error estableciendo sesión:', setSessionError);
          toast.error("Error al establecer la nueva sesión");
          return;
        }

        toast.success(`¡Sesión cambiada exitosamente a ${user.nombre}!`);
        
        // Redirigir al dashboard del usuario
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        toast.error("No se recibieron los tokens de acceso");
      }
      
    } catch (functionError: any) {
      console.error("Error en función de login:", functionError);
      toast.dismiss(loadingToast);
      toast.error(`Error: ${functionError.message || 'Error al comunicarse con el servidor'}`);
    }
    
  } catch (error: any) {
    console.error("Error general en login como usuario:", error);
    toast.error(`Error inesperado: ${error.message || 'Error desconocido'}`);
  }
};
