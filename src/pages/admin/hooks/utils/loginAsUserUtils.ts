
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Usuario } from "../../components/types";

export const loginAsUser = async (user: Usuario): Promise<void> => {
  try {
    console.log("Iniciando simulación de login como usuario:", user.email);

    // Verificaciones básicas
    if (user.perfil === 'administrador') {
      toast.error("No se puede simular la sesión de otro administrador");
      return;
    }

    if (!user.email) {
      toast.error("El usuario no tiene un email válido");
      return;
    }

    const loadingToast = toast.loading(`Accediendo al panel de ${user.nombre}...`);

    try {
      // Guardar información del admin actual
      const { data: currentSession } = await supabase.auth.getSession();
      if (currentSession.session) {
        localStorage.setItem('admin_user_id', currentSession.session.user.id);
        localStorage.setItem('admin_email', currentSession.session.user.email || '');
      }

      // Cerrar sesión actual
      await supabase.auth.signOut();
      
      // Mostrar mensaje de éxito y redirigir
      toast.dismiss(loadingToast);
      toast.success(`Accediendo al panel de ${user.nombre}`);
      
      // Redirigir directamente al dashboard con parámetros que simulen la sesión del usuario
      const dashboardUrl = `/dashboard?simulate_user=${encodeURIComponent(user.user_id || user.id)}&user_email=${encodeURIComponent(user.email)}&user_name=${encodeURIComponent(user.nombre || '')}`;
      window.location.href = dashboardUrl;
      
    } catch (error: any) {
      console.error("Error al simular sesión:", error);
      toast.dismiss(loadingToast);
      toast.error("Error al acceder al panel del usuario");
    }
    
  } catch (error: any) {
    console.error("Error general:", error);
    toast.error("Error inesperado");
  }
};

export const returnToAdminPanel = (): void => {
  const adminUserId = localStorage.getItem('admin_user_id');
  const adminEmail = localStorage.getItem('admin_email');
  
  if (adminUserId && adminEmail) {
    // Limpiar datos de simulación
    localStorage.removeItem('admin_user_id');
    localStorage.removeItem('admin_email');
    
    toast.info("Regresando al panel de administrador...");
    
    // Redirigir al login del admin
    window.location.href = `/login?email=${encodeURIComponent(adminEmail)}&returnTo=/admin/usuarios`;
  } else {
    // Si no hay datos del admin, ir al login normal
    window.location.href = '/login';
  }
};
