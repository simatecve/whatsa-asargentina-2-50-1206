
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Verificar permisos de administrador
export const checkAdminPermissions = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("No hay sesión activa");
      return false;
    }

    const { data: currentUser } = await supabase
      .from("usuarios")
      .select("perfil")
      .eq("user_id", session.user.id)
      .single();

    if (!currentUser || currentUser.perfil !== 'administrador') {
      toast.error("No tienes permisos para gestionar usuarios");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error verificando permisos:", error);
    toast.error("Error verificando permisos");
    return false;
  }
};
