
import { supabase } from "@/integrations/supabase/client";

export const useAgentsStats = () => {
  const getAgentsStats = async (userId: string) => {
    const { data: agents, error: agentsError } = await supabase
      .from('agente_ia_config')
      .select('is_active')
      .eq('user_id', userId);

    if (agentsError) {
      console.error("Error obteniendo agentes IA:", agentsError);
      throw agentsError;
    }

    const activeAgents = agents?.filter(a => a.is_active).length || 0;
    console.log(`Agentes IA activos: ${activeAgents}`);

    return { activeAgents };
  };

  return { getAgentsStats };
};
