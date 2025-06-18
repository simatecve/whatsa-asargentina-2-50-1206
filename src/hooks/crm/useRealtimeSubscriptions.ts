
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Conversation } from "@/types/crm";

interface UseRealtimeSubscriptionsProps {
  userData: any;
  selectedInstanceId?: string;
  selectedConversation: Conversation | null;
  fetchConversations: (instanceId?: string) => Promise<void>;
  fetchMessages: (conversation: Conversation) => Promise<void>;
}

export const useRealtimeSubscriptions = ({
  userData,
  selectedInstanceId,
  selectedConversation,
  fetchConversations,
  fetchMessages
}: UseRealtimeSubscriptionsProps) => {
  useEffect(() => {
    if (!userData) return;

    console.log('Setting up optimized realtime subscriptions...');

    // Reduced auto-refresh interval to 10 seconds for better performance
    const autoRefreshInterval = setInterval(() => {
      console.log('Auto-refreshing conversations...');
      fetchConversations(selectedInstanceId);
    }, 10000); // Reduced from 3000ms to 10000ms

    // Suscripción para cambios en conversaciones
    const conversationsChannel = supabase
      .channel('conversations-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversaciones'
        },
        (payload) => {
          console.log('Conversation change detected:', payload);
          // Refrescar conversaciones inmediatamente cuando hay cambios
          fetchConversations(selectedInstanceId);
        }
      )
      .subscribe();

    // Suscripción optimizada para nuevos mensajes
    const messagesChannel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mensajes'
        },
        (payload) => {
          console.log('Message change detected:', payload);
          
          // Actualizar conversaciones cuando hay cambios en mensajes
          fetchConversations(selectedInstanceId);
          
          // Si estamos viendo una conversación, actualizar los mensajes inmediatamente
          if (selectedConversation) {
            const payloadNew = payload.new as any;
            const payloadOld = payload.old as any;
            
            const newConversationId = payloadNew?.conversation_id;
            const oldConversationId = payloadOld?.conversation_id;
              
            if (newConversationId === selectedConversation.id || oldConversationId === selectedConversation.id) {
              console.log('Refreshing messages for current conversation');
              // Use immediate refresh without delay
              setTimeout(() => fetchMessages(selectedConversation), 100);
            }
          }
        }
      )
      .subscribe();

    // Suscripción para cambios en la tabla contactos_bots
    const botStatusChannel = supabase
      .channel('bot-status-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contactos_bots'
        },
        (payload) => {
          console.log('Bot status change detected:', payload);
          
          // Extraer datos de manera segura
          const payloadNew = payload.new as any;
          const payloadOld = payload.old as any;
          
          const numeroContacto = payloadNew?.numero_contacto || payloadOld?.numero_contacto;
          const instanciaNombre = payloadNew?.instancia_nombre || payloadOld?.instancia_nombre;
          
          // Nueva lógica: presencia = desactivado, ausencia = activado
          // Si es INSERT/UPDATE = bot desactivado, si es DELETE = bot activado
          const botActivo = payload.event === 'DELETE' ? true : false;
          
          if (numeroContacto && instanciaNombre) {
            // Esto ayudará a que el botón del bot se actualice en tiempo real
            // Forzar re-render del componente BotToggleButton
            window.dispatchEvent(new CustomEvent('bot-status-changed', { 
              detail: { 
                numero_contacto: numeroContacto,
                instancia_nombre: instanciaNombre,
                bot_activo: botActivo
              } 
            }));
          }
        }
      )
      .subscribe();

    console.log('Optimized realtime subscriptions active with 10-second auto-refresh');

    return () => {
      console.log('Cleaning up optimized realtime subscriptions and auto-refresh');
      clearInterval(autoRefreshInterval);
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(botStatusChannel);
    };
  }, [userData, selectedInstanceId, selectedConversation?.id, fetchConversations, fetchMessages]);
};
