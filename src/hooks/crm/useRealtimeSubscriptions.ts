
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
  const debouncedFetchConversations = (delay: number = 500) => {
    if (conversationDebounceRef.current) {
      clearTimeout(conversationDebounceRef.current);
    }
    
    conversationDebounceRef.current = setTimeout(() => {
      console.log('Debounced: Refreshing conversations...');
      fetchConversations(selectedInstanceId);
    }, delay);
  };

  const debouncedFetchMessages = (conversation: Conversation, delay: number = 300) => {
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

    // Suscripción para cambios en conversaciones
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
          console.log('Conversation change detected:', payload.eventType, payload);
          // Actualizar conversaciones inmediatamente
          debouncedFetchConversations(300);
        }
      )
      .subscribe();

    // Suscripción para nuevos mensajes - esta es la crítica
    const messagesChannel = supabase
      .channel('messages-realtime-optimized')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes'
        },
        (payload) => {
          console.log('New message detected:', payload);
          
          const newMessage = payload.new as any;
          
          // Actualizar conversaciones siempre que hay un nuevo mensaje
          debouncedFetchConversations(200);
          
          // Si estamos viendo una conversación específica, actualizar mensajes
          if (selectedConversation && newMessage?.conversation_id === selectedConversation.id) {
            console.log('Refreshing messages for current conversation');
            debouncedFetchMessages(selectedConversation, 100);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'mensajes'
        },
        (payload) => {
          console.log('Message updated:', payload);
          
          const updatedMessage = payload.new as any;
          
          // Si estamos viendo una conversación específica, actualizar mensajes
          if (selectedConversation && updatedMessage?.conversation_id === selectedConversation.id) {
            console.log('Refreshing messages for current conversation due to update');
            debouncedFetchMessages(selectedConversation, 100);
          }
        }
      )
      .subscribe();

    // Suscripción para cambios en la tabla contactos_bots
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

    console.log('Optimized realtime subscriptions active with reduced debouncing');

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
