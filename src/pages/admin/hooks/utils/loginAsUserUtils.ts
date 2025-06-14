
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Usuario } from "../../components/types";

export const loginAsUser = async (user: Usuario): Promise<void> => {
  try {
    console.log("Iniciando login real como usuario:", user.email);

    // Verificaciones básicas
    if (user.perfil === 'administrador') {
      toast.error("No se puede iniciar sesión como otro administrador");
      return;
    }

    if (!user.email) {
      toast.error("El usuario no tiene un email válido");
      return;
    }

    const loadingToast = toast.loading(`Generando acceso para ${user.nombre}...`);

    try {
      // Obtener sesión actual del admin
      const { data: currentSession } = await supabase.auth.getSession();
      
      if (currentSession.session) {
        // Guardar información del admin actual
        localStorage.setItem('admin_user_id', currentSession.session.user.id);
        localStorage.setItem('admin_email', currentSession.session.user.email || '');
        console.log("Información del admin guardada");
      }

      // Llamar a la función edge para generar enlace mágico
      const { data, error } = await supabase.functions.invoke('login-as-user', {
        body: { userEmail: user.email }
      });

      if (error) {
        console.error("Error al invocar función:", error);
        throw error;
      }

      if (!data.success || !data.magicLink) {
        throw new Error(data.error || "No se pudo generar el enlace de acceso");
      }

      console.log("Enlace mágico generado, redirigiendo...");
      
      toast.dismiss(loadingToast);
      toast.success(`Accediendo como ${user.nombre}`);
      
      // Redirigir al enlace mágico que hará el login automático
      window.location.href = data.magicLink;
      
    } catch (error: any) {
      console.error("Error al generar enlace mágico:", error);
      toast.dismiss(loadingToast);
      toast.error("Error al acceder al panel del usuario");
    }
    
  } catch (error: any) {
    console.error("Error general:", error);
    toast.error("Error inesperado");
  }
};

export const returnToAdminPanel = async (): Promise<void> => {
  const adminUserId = localStorage.getItem('admin_user_id');
  const adminEmail = localStorage.getItem('admin_email');
  
  if (adminUserId && adminEmail) {
    console.log("Regresando al panel de admin...");
    
    try {
      const loadingToast = toast.loading("Regresando al panel de administrador...");
      
      // Llamar a la función edge para generar enlace mágico del admin
      const { data, error } = await supabase.functions.invoke('login-as-user', {
        body: { userEmail: adminEmail }
      });

      if (error || !data.success || !data.magicLink) {
        throw new Error("No se pudo generar el enlace de acceso para el admin");
      }

      // Limpiar datos de simulación
      localStorage.removeItem('admin_user_id');
      localStorage.removeItem('admin_email');
      
      toast.dismiss(loadingToast);
      toast.success("Regresando al panel de administrador");
      
      // Redirigir al enlace mágico que hará el login del admin
      // Agregamos parámetro para ir directo al panel de usuarios
      const adminLink = data.magicLink + '&returnTo=' + encodeURIComponent('/admin/usuarios');
      window.location.href = adminLink;
      
    } catch (error) {
      console.error("Error al regresar al panel admin:", error);
      toast.error("Error al regresar al panel de administrador");
      
      // Fallback: redirigir al login
      localStorage.removeItem('admin_user_id');
      localStorage.removeItem('admin_email');
      window.location.href = '/login';
    }
  } else {
    // Si no hay datos del admin, ir al login normal
    toast.info("Redirigiendo al login...");
    window.location.href = '/login';
  }
};
