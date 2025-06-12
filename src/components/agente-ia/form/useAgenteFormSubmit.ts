
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AgenteIAForm } from "../agenteIASchema";

export const useAgenteFormSubmit = (editingConfig?: any, onSave?: () => void) => {
  const [saving, setSaving] = useState(false);

  const onSubmit = async (values: AgenteIAForm) => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Usuario no autenticado");
        return;
      }

      const configData = {
        ...values,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      console.log("Saving agente config:", configData);

      let error;

      if (editingConfig?.id) {
        // Update existing configuration
        const result = await supabase
          .from("agente_ia_config")
          .update(configData)
          .eq("id", editingConfig.id);
        error = result.error;
      } else {
        // Insert new configuration
        const result = await supabase
          .from("agente_ia_config")
          .insert(configData);
        error = result.error;
      }

      if (error) {
        console.error("Error saving config:", error);
        toast.error("Error al guardar la configuración");
        return;
      }

      toast.success(editingConfig ? "Agente actualizado correctamente" : "Agente creado correctamente");
      onSave?.();
    } catch (error) {
      console.error("Exception saving config:", error);
      toast.error("Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    onSubmit
  };
};
