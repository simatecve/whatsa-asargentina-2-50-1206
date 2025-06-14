
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Usuario } from "../../components/types";

export const loginAsUser = async (user: Usuario): Promise<void> => {
  try {
    console.log("Iniciando login como usuario:", user.email);

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
      // Llamar a la función edge simplificada
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

      // Usar el enlace mágico para cambiar la sesión
      if (data.magicLink) {
        toast.success(`¡Redirigiendo a sesión de ${user.nombre}!`);
        
        // Redirigir usando el enlace mágico
        window.location.href = data.magicLink;
      } else {
        toast.error("No se pudo generar el enlace de acceso");
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
