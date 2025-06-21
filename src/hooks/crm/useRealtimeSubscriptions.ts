
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Conversation } from "@/types/crm";

interface UseRealtimeSubscriptionsProps {
  userData: any;
  selectedInstanceId?: string;
  selectedConversation: Conversation | null;
  fetchConversations: () => void;
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
  const debouncedFetchConversations = (delay: number = 200) => {
    if (conversationDebounceRef.current) {
      clearTimeout(conversationDebounceRef.current);
    }
    
    conversationDebounceRef.current = setTimeout(() => {
      console.log('Debounced: Refreshing conversations...');
      fetchConversations();
    }, delay);
  };

  const debouncedFetchMessages = (conversation: Conversation, delay: number = 100) => {
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

    console.log('Setting up real-time subscriptions for incoming messages...');

    // Suscripción para cambios en conversaciones
    const conversationsChannel = supabase
      .channel('conversations-realtime-live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversaciones'
        },
        (payload) => {
          console.log('Conversation change detected:', payload.eventType, payload);
          // Actualizar conversaciones inmediatamente para mensajes entrantes
          debouncedFetchConversations(100);
        }
      )
      .subscribe();

    // Suscripción crítica para mensajes entrantes
    const messagesChannel = supabase
      .channel('messages-realtime-live')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes'
        },
        (payload) => {
          console.log('New incoming message detected:', payload);
          
          const newMessage = payload.new as any;
          
          // CRÍTICO: Actualizar conversaciones inmediatamente para nuevos mensajes
          debouncedFetchConversations(50);
          
          // Si estamos viendo esta conversación, actualizar mensajes inmediatamente
          if (selectedConversation && newMessage?.conversation_id === selectedConversation.id) {
            console.log('Updating messages for current conversation - INCOMING MESSAGE');
            debouncedFetchMessages(selectedConversation, 50);
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
          
          // Si estamos viendo esta conversación, actualizar mensajes
          if (selectedConversation && updatedMessage?.conversation_id === selectedConversation.id) {
            console.log('Updating messages for current conversation - MESSAGE UPDATE');
            debouncedFetchMessages(selectedConversation, 50);
          }
        }
      )
      .subscribe();

    // Suscripción para cambios en la tabla contactos_bots
    const botStatusChannel = supabase
      .channel('bot-status-realtime-live')
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

    console.log('Real-time subscriptions active for immediate message updates');

    return () => {
      console.log('Cleaning up real-time subscriptions');
      
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
