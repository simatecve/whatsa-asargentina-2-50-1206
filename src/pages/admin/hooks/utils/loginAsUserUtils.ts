
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

    const loadingToast = toast.loading(`Cambiando a sesión de ${user.nombre}...`);

    try {
      // Primero cerrar la sesión actual del admin
      await supabase.auth.signOut();
      
      // Mostrar mensaje y redirigir a login con email pre-llenado
      toast.dismiss(loadingToast);
      toast.success(`Sesión admin cerrada. Ahora inicia sesión como ${user.nombre}`);
      
      // Redirigir a login con el email del usuario
      const loginUrl = `/login?email=${encodeURIComponent(user.email)}&returnTo=/dashboard`;
      window.location.href = loginUrl;
      
    } catch (error: any) {
      console.error("Error al cerrar sesión:", error);
      toast.dismiss(loadingToast);
      toast.error("Error al cambiar sesión");
    }
    
  } catch (error: any) {
    console.error("Error general:", error);
    toast.error("Error inesperado");
  }
};
