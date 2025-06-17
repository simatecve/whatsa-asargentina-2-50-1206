
import { supabase } from "@/integrations/supabase/client";
import { BotContactStatus } from "@/types/botContactStatus";

export const useBotContactFetch = () => {
  const fetchContactStatus = async (numeroContacto: string, instanciaNombre: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      console.log('Fetching bot status for:', { numeroContacto, instanciaNombre });

      const { data, error } = await supabase
        .from('contactos_bots')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('numero_contacto', numeroContacto)
        .eq('instancia_nombre', instanciaNombre)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching contact bot status:', error);
        throw error;
      }

      console.log('Bot status fetched:', data);
      return data;
    } catch (error) {
      console.error('Error fetching contact bot status:', error);
      return null;
    }
  };

  return { fetchContactStatus };
};
