
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SmartTemplate, ExpertiseArea } from "@/types/team";
import { toast } from "sonner";

export const useSmartTemplates = () => {
  const [smartTemplates, setSmartTemplates] = useState<SmartTemplate[]>([]);

  const fetchSmartTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('smart_templates')
        .select('*')
        .eq('is_active', true)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setSmartTemplates(data || []);
    } catch (error) {
      console.error('Error fetching smart templates:', error);
    }
  };

  const addSmartTemplate = async (templateData: {
    title: string;
    content: string;
    context_triggers: string[];
    expertise_area: ExpertiseArea;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('smart_templates')
        .insert({
          owner_user_id: user.id,
          ...templateData
        });

      if (error) throw error;

      toast.success('Template agregado exitosamente');
      fetchSmartTemplates();
    } catch (error) {
      console.error('Error adding smart template:', error);
      toast.error('Error al agregar template');
    }
  };

  return {
    smartTemplates,
    fetchSmartTemplates,
    addSmartTemplate,
  };
};
