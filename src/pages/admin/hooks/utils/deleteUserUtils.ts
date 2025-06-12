
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { checkAdminPermissions } from "./permissionsUtils";

// Eliminar usuario completamente (tabla usuarios + auth)
export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    if (!await checkAdminPermissions()) return false;

    console.log("Eliminando usuario:", userId);

    // Primero obtener información del usuario
    const { data: userToDelete } = await supabase
      .from("usuarios")
      .select("nombre, user_id")
      .eq("user_id", userId)
      .single();

    if (!userToDelete) {
      toast.error("Usuario no encontrado");
      return false;
    }

    // Eliminar usuario usando la edge function admin-operations
    const { data, error } = await supabase.functions.invoke('admin-operations', {
      body: {
        action: 'deleteUser',
        userId: userId
      }
    });

    if (error) {
      console.error('Error calling delete function:', error);
      toast.error("Error al eliminar usuario");
      return false;
    }

    if (data.error) {
      console.error('Error from delete function:', data.error);
      toast.error(`Error al eliminar usuario: ${data.error}`);
      return false;
    }

    toast.success(`Usuario ${userToDelete.nombre} eliminado exitosamente`);
    return true;

  } catch (error) {
    console.error("Error deleting user:", error);
    toast.error("Error inesperado al eliminar usuario");
    return false;
  }
};
