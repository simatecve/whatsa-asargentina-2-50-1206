
import { useState } from "react";
import { Usuario, FormData } from "../components/types";
import { createUser, updateUser, deleteUser, loginAsUser } from "./utils/adminUserUtils";

export const useUserOperations = (fetchUsers: () => void) => {
  const [saving, setSaving] = useState(false);

  const onLoginAsUser = async (user: Usuario) => {
    await loginAsUser(user);
  };

  const onSaveUser = async (formData: FormData, editUser: Usuario | null, setOpen: (open: boolean) => void) => {
    setSaving(true);
    
    let success = false;
    if (editUser) {
      success = await updateUser(formData, editUser);
    } else {
      success = await createUser(formData);
    }
    
    if (success) {
      setOpen(false);
      fetchUsers();
    }
    
    setSaving(false);
    return success;
  };

  const onDeleteUser = async (userId: string) => {
    const success = await deleteUser(userId);
    if (success) {
      fetchUsers();
    }
  };

  return {
    saving,
    handleLoginAsUser: onLoginAsUser,
    handleSaveUser: onSaveUser,
    handleDeleteUser: onDeleteUser,
  };
};
