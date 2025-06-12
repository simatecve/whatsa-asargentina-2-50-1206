
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FormData, Usuario } from "../../components/types";
import { checkAdminPermissions } from "./permissionsUtils";

// Actualizar usuario existente
export const updateUser = async (formData: FormData, editUser: Usuario): Promise<boolean> => {
  try {
    if (!await checkAdminPermissions()) return false;

    if (!formData.nombre.trim()) {
      toast.error("El nombre es requerido");
      return false;
    }

    console.log("Actualizando usuario:", editUser.id);

    // Actualizar datos básicos del usuario
    const { error: updateError } = await supabase
      .from("usuarios")
      .update({
        nombre: formData.nombre.trim(),
        perfil: formData.perfil,
      })
      .eq("id", editUser.id);

    if (updateError) {
      console.error('Error updating user:', updateError);
      toast.error("Error al actualizar usuario");
      return false;
    }

    // Si se proporcionó una nueva contraseña, actualizarla usando la función de admin
    if (formData.password && formData.password.trim()) {
      console.log("Actualizando contraseña del usuario...");
      
      const { error: passwordError } = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'updateUserPassword',
          userId: editUser.user_id,
          newPassword: formData.password.trim()
        }
      });

      if (passwordError) {
        console.error('Error updating password:', passwordError);
        toast.error("Usuario actualizado pero error al cambiar contraseña");
        return false;
      }

      console.log("Contraseña actualizada exitosamente");
    }

    toast.success("Usuario actualizado exitosamente");
    return true;

  } catch (error) {
    console.error("Error updating user:", error);
    toast.error("Error inesperado al actualizar usuario");
    return false;
  }
};
