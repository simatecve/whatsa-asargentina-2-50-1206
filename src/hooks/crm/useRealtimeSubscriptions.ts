
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Conversation } from "@/types/crm";

interface UseRealtimeSubscriptionsProps {
  userData: any;
  selectedInstanceId?: string;
  selectedConversation: Conversation | null;
  fetchConversations: (instanceId?: string) => void;
  fetchMessages: (conversation: Conversation) => Promise<void>;
}

export const useRealtimeSubscriptions = ({
  userData,
  selectedInstanceId,
  selectedConversation,
  fetchConversations,
  fetchMessages
}: UseRealtimeSubscriptionsProps) => {
  const conversationDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const messageDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced functions para evitar múltiples llamadas
  const debouncedFetchConversations = (delay: number = 1000) => {
    if (conversationDebounceRef.current) {
      clearTimeout(conversationDebounceRef.current);
    }
    
    conversationDebounceRef.current = setTimeout(() => {
      console.log('Debounced: Refreshing conversations...');
      fetchConversations(selectedInstanceId);
    }, delay);
  };

  const debouncedFetchMessages = (conversation: Conversation, delay: number = 500) => {
    if (messageDebounceRef.current) {
      clearTimeout(messageDebounceRef.current);
    }
    
    messageDebounceRef.current = setTimeout(() => {
      console.log('Debounced: Refreshing messages for conversation:', conversation.id);
      fetchMessages(conversation);
    }, delay);
  };

  useEffect(() => {
    if (!userData) return;

    console.log('Setting up optimized realtime subscriptions...');

    // Suscripción optimizada para cambios en conversaciones
    const conversationsChannel = supabase
      .channel('conversations-realtime-optimized')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversaciones'
        },
        (payload) => {
          console.log('Conversation change detected:', payload.eventType);
          // Debounce la actualización de conversaciones
          debouncedFetchConversations(800);
        }
      )
      .subscribe();

    // Suscripción optimizada para nuevos mensajes
    const messagesChannel = supabase
      .channel('messages-realtime-optimized')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mensajes'
        },
        (payload) => {
          console.log('Message change detected:', payload.eventType);
          
          // Actualizar conversaciones siempre (pero con debounce)
          debouncedFetchConversations(1200);
          
          // Si estamos viendo una conversación específica, actualizar mensajes
          if (selectedConversation) {
            const payloadNew = payload.new as any;
            const payloadOld = payload.old as any;
            
            const newConversationId = payloadNew?.conversation_id;
            const oldConversationId = payloadOld?.conversation_id;
              
            if (newConversationId === selectedConversation.id || oldConversationId === selectedConversation.id) {
              console.log('Refreshing messages for current conversation');
              debouncedFetchMessages(selectedConversation, 300);
            }
          }
        }
      )
      .subscribe();

    // Suscripción para cambios en la tabla contactos_bots (más eficiente)
    const botStatusChannel = supabase
      .channel('bot-status-realtime-optimized')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'contactos_bots'
        },
        (payload) => {
          console.log('Bot status INSERT detected:', payload);
          
          const payloadNew = payload.new as any;
          const numeroContacto = payloadNew?.numero_contacto;
          const instanciaNombre = payloadNew?.instancia_nombre;
          
          if (numeroContacto && instanciaNombre) {
            // INSERT = bot desactivado
            window.dispatchEvent(new CustomEvent('bot-status-changed', { 
              detail: { 
                numero_contacto: numeroContacto,
                instancia_nombre: instanciaNombre,
                bot_activo: false
              } 
            }));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'contactos_bots'
        },
        (payload) => {
          console.log('Bot status DELETE detected:', payload);
          
          const payloadOld = payload.old as any;
          const numeroContacto = payloadOld?.numero_contacto;
          const instanciaNombre = payloadOld?.instancia_nombre;
          
          if (numeroContacto && instanciaNombre) {
            // DELETE = bot activado
            window.dispatchEvent(new CustomEvent('bot-status-changed', { 
              detail: { 
                numero_contacto: numeroContacto,
                instancia_nombre: instanciaNombre,
                bot_activo: true
              } 
            }));
          }
        }
      )
      .subscribe();

    console.log('Optimized realtime subscriptions active with debouncing');

    return () => {
      console.log('Cleaning up optimized realtime subscriptions');
      
      // Limpiar timeouts
      if (conversationDebounceRef.current) {
        clearTimeout(conversationDebounceRef.current);
      }
      if (messageDebounceRef.current) {
        clearTimeout(messageDebounceRef.current);
      }
      
      // Remover canales
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(botStatusChannel);
    };
  }, [userData, selectedInstanceId, selectedConversation?.id, fetchConversations, fetchMessages]);
};
