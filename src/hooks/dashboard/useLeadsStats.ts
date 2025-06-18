
import { supabase } from "@/integrations/supabase/client";

export const useLeadsStats = () => {
  const getLeadsStats = async (instanceNames: string[]) => {
    let totalLeads = 0;
    let newLeads = 0;
    
    if (instanceNames.length > 0) {
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('status')
        .in('instancia', instanceNames);

      if (leadsError) {
        console.error("Error obteniendo leads:", leadsError);
      } else {
        totalLeads = leads?.length || 0;
        newLeads = leads?.filter(l => l.status === 'new').length || 0;
        console.log(`Leads: ${totalLeads}, Nuevos: ${newLeads}`);
      }
    }

    return { totalLeads, newLeads };
  };

  return { getLeadsStats };
};
