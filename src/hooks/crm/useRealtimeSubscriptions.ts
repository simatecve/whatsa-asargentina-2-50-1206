
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

  // Funciones inmediatas sin debounce para tiempo real crítico
  const immediateFetchConversations = () => {
    console.log('IMMEDIATE: Refreshing conversations...');
    fetchConversations();
  };

  const immediateFetchMessages = (conversation: Conversation) => {
    console.log('IMMEDIATE: Refreshing messages for conversation:', conversation.id);
    fetchMessages(conversation);
  };

  // Funciones con debounce mínimo para evitar spam
  const debouncedFetchConversations = (delay: number = 50) => {
    if (conversationDebounceRef.current) {
      clearTimeout(conversationDebounceRef.current);
    }
    
    conversationDebounceRef.current = setTimeout(() => {
      console.log('Debounced: Refreshing conversations...');
      fetchConversations();
    }, delay);
  };

  const debouncedFetchMessages = (conversation: Conversation, delay: number = 25) => {
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

    console.log('🔴 REALTIME: Setting up IMMEDIATE real-time subscriptions...');

    // Suscripción crítica para conversaciones - INMEDIATA
    const conversationsChannel = supabase
      .channel('conversations-realtime-immediate')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversaciones'
        },
        (payload) => {
          console.log('🚨 CONVERSATION CHANGE DETECTED:', payload.eventType, payload);
          // Actualización INMEDIATA para conversaciones
          immediateFetchConversations();
        }
      )
      .subscribe();

    // Suscripción CRÍTICA para mensajes entrantes - INMEDIATA
    const messagesChannel = supabase
      .channel('messages-realtime-immediate')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes'
        },
        (payload) => {
          console.log('🚨 NEW INCOMING MESSAGE DETECTED:', payload);
          
          const newMessage = payload.new as any;
          
          // CRÍTICO: Actualizar conversaciones INMEDIATAMENTE
          console.log('⚡ UPDATING CONVERSATIONS IMMEDIATELY');
          immediateFetchConversations();
          
          // Si estamos viendo esta conversación, actualizar mensajes INMEDIATAMENTE
          if (selectedConversation && newMessage?.conversation_id === selectedConversation.id) {
            console.log('⚡ UPDATING CURRENT CONVERSATION MESSAGES IMMEDIATELY');
            immediateFetchMessages(selectedConversation);
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
          console.log('🔄 Message updated:', payload);
          
          const updatedMessage = payload.new as any;
          
          // Actualización con debounce mínimo para updates
          if (selectedConversation && updatedMessage?.conversation_id === selectedConversation.id) {
            console.log('🔄 Updating messages for current conversation - MESSAGE UPDATE');
            debouncedFetchMessages(selectedConversation, 25);
          }
        }
      )
      .subscribe();

    // Suscripción para cambios en bot status - con debounce mínimo
    const botStatusChannel = supabase
      .channel('bot-status-realtime-immediate')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'contactos_bots'
        },
        (payload) => {
          console.log('🤖 Bot status INSERT detected:', payload);
          
          const payloadNew = payload.new as any;
          const numeroContacto = payloadNew?.numero_contacto;
          const instanciaNombre = payloadNew?.instancia_nombre;
          
          if (numeroContacto && instanciaNombre) {
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
          console.log('🤖 Bot status DELETE detected:', payload);
          
          const payloadOld = payload.old as any;
          const numeroContacto = payloadOld?.numero_contacto;
          const instanciaNombre = payloadOld?.instancia_nombre;
          
          if (numeroContacto && instanciaNombre) {
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

    console.log('✅ REALTIME: Immediate real-time subscriptions ACTIVE');

    return () => {
      console.log('🔴 REALTIME: Cleaning up immediate real-time subscriptions');
      
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
  }, [userData, selectedInstanceId, selectedConversation?.id]);
};
