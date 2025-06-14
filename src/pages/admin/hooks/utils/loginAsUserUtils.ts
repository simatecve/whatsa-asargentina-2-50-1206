
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

    const loadingToast = toast.loading(`Cambiando sesión a ${user.nombre}...`);

    try {
      // Llamar a la función edge que generará el enlace de acceso
      const { data, error } = await supabase.functions.invoke('admin-login-as-user', {
        body: { 
          targetUserEmail: user.email
        }
      });

      if (error) {
        console.error('Error en función edge:', error);
        toast.dismiss(loadingToast);
        toast.error(`Error al cambiar sesión: ${error.message}`);
        return;
      }

      if (!data?.success) {
        toast.dismiss(loadingToast);
        toast.error(data?.error || "No se pudo cambiar la sesión");
        return;
      }

      toast.dismiss(loadingToast);
      toast.success(`Redirigiendo a la sesión de ${user.nombre}...`);
      
      // Redirigir usando el enlace mágico generado
      setTimeout(() => {
        window.location.href = data.redirectUrl;
      }, 1000);
      
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
