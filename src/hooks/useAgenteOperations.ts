
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AgenteConfig = {
  id: string;
  nombre_agente: string;
  instance_name: string;
  prompt: string;
  is_active: boolean;
  created_at: string;
};

export const useAgenteOperations = (fetchAgentes: () => void) => {
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("agente_ia_config")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) {
        console.error("Error updating agente status:", error);
        toast.error("Error al actualizar el estado del agente");
        return;
      }

      toast.success(`Agente ${!currentStatus ? "activado" : "desactivado"} correctamente`);
      fetchAgentes();
    } catch (error) {
      console.error("Exception updating agente status:", error);
      toast.error("Error al actualizar el estado del agente");
    }
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Está seguro de eliminar el agente "${nombre}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("agente_ia_config")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting agente:", error);
        toast.error("Error al eliminar el agente");
        return;
      }

      toast.success("Agente eliminado correctamente");
      fetchAgentes();
    } catch (error) {
      console.error("Exception deleting agente:", error);
      toast.error("Error al eliminar el agente");
    }
  };

  return {
    handleToggleActive,
    handleDelete
  };
};
