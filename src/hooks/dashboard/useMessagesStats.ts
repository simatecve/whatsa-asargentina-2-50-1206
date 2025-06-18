
import { supabase } from "@/integrations/supabase/client";

export const useMessagesStats = () => {
  const getMessagesStats = async (instanceNames: string[], suscripcion: any, maxMessages: number) => {
    let consumedMessages = 0;
    
    if (instanceNames.length > 0 && suscripcion) {
      const suscripcionStart = new Date(suscripcion.fecha_inicio);
      
      console.log('Contando mensajes recibidos desde:', suscripcionStart.toISOString());
      console.log('Para instancias:', instanceNames);
      
      const { count: messagesCount, error: messagesError } = await supabase
        .from('mensajes')
        .select('id', { count: 'exact' })
        .in('instancia', instanceNames)
        .eq('direccion', 'recibido')
        .gte('created_at', suscripcionStart.toISOString());

      if (messagesError) {
        console.error("Error obteniendo mensajes consumidos:", messagesError);
      } else {
        consumedMessages = messagesCount || 0;
        console.log(`Mensajes recibidos contados: ${consumedMessages} de máximo ${maxMessages}`);
      }
    }

    return { consumedMessages };
  };

  return { getMessagesStats };
};
