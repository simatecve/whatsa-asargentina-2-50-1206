
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AgenteConfig = {
  id: string;
  nombre_agente: string;
  instance_name: string;
  prompt: string;
  is_active: boolean;
  stop_bot_from_me: boolean;
  created_at: string;
};

export const useAgentesData = () => {
  const [agentes, setAgentes] = useState<AgenteConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgentes = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Usuario no autenticado");
        return;
      }

      const { data, error } = await supabase
        .from("agente_ia_config")
        .select(`
          id,
          nombre_agente,
          instance_name,
          prompt,
          is_active,
          stop_bot_from_me,
          created_at
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading agentes:", error);
        toast.error("Error al cargar los agentes");
        return;
      }

      console.log("Agentes loaded from DB:", data);
      setAgentes(data || []);
    } catch (error) {
      console.error("Exception loading agentes:", error);
      toast.error("Error al cargar los agentes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentes();
  }, []);

  return {
    agentes,
    loading,
    fetchAgentes
  };
};
