
import { supabase } from "@/integrations/supabase/client";

export const useConversationsStats = () => {
  const getConversationsStats = async (instanceNames: string[]) => {
    let totalConversations = 0;
    let unreadMessages = 0;
    
    if (instanceNames.length > 0) {
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversaciones')
        .select('mensajes_no_leidos')
        .in('instancia_nombre', instanceNames);

      if (conversationsError) {
        console.error("Error obteniendo conversaciones:", conversationsError);
      } else {
        totalConversations = conversations?.length || 0;
        unreadMessages = conversations?.reduce((acc, conv) => acc + (conv.mensajes_no_leidos || 0), 0) || 0;
        console.log(`Conversaciones: ${totalConversations}, Mensajes no leídos: ${unreadMessages}`);
      }
    }

    return { totalConversations, unreadMessages };
  };

  return { getConversationsStats };
};
