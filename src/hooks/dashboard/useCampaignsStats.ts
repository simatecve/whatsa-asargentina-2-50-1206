
import { supabase } from "@/integrations/supabase/client";

export const useCampaignsStats = () => {
  const getCampaignsStats = async (userId: string, maxCampanas: number) => {
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campanas')
      .select('estado, created_at')
      .eq('user_id', userId)
      .eq('estado', 'enviada')
      .order('created_at', { ascending: true });

    if (campaignsError) {
      console.error("Error obteniendo campañas:", campaignsError);
      throw campaignsError;
    }

    const totalCampaigns = campaigns?.length || 0;
    const activeCampaigns = Math.min(totalCampaigns, maxCampanas);

    console.log(`Campañas enviadas: ${totalCampaigns}, Permitidas por plan: ${maxCampanas}, Mostradas: ${activeCampaigns}`);

    return { totalCampaigns: activeCampaigns, activeCampaigns };
  };

  return { getCampaignsStats };
};
