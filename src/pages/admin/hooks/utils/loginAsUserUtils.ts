
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
      // Obtener el token de administrador actual
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession?.access_token) {
        toast.dismiss(loadingToast);
        toast.error("No se encontró sesión de administrador válida");
        return;
      }

      // Llamar a la función edge de admin-login-as-user
      const { data, error } = await supabase.functions.invoke('admin-login-as-user', {
        body: { targetUserEmail: user.email },
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`
        }
      });

      if (error) {
        console.error('Error en función edge:', error);
        toast.dismiss(loadingToast);
        toast.error(`Error: ${error.message}`);
        return;
      }

      if (!data.success || !data.session) {
        toast.dismiss(loadingToast);
        toast.error("No se pudo generar la sesión del usuario");
        return;
      }

      console.log("Estableciendo nueva sesión...");

      // Establecer la nueva sesión
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
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
      console.error("Error en función de login:", functionError);
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
