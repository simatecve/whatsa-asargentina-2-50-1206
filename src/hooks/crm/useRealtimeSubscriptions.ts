
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
  const channelRef = useRef<any>(null);

  console.log('🔄 REALTIME Hook initialized with:', { 
    hasUserData: !!userData, 
    selectedInstanceId, 
    selectedConversationId: selectedConversation?.id 
  });

  useEffect(() => {
    // Limpiar canal anterior si existe
    if (channelRef.current) {
      console.log('🧹 Cleaning previous channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (!userData) {
      console.log('🔴 REALTIME: No userData, skipping subscription');
      return;
    }

    console.log('🔴 REALTIME: Setting up realtime subscriptions...');

    // Crear un canal único con timestamp para evitar conflictos
    const channelName = `realtime_changes_${Date.now()}`;
    const channel = supabase.channel(channelName);

    // Escuchar cambios en conversaciones
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversaciones'
      },
      (payload) => {
        console.log('🚨 CONVERSATION CHANGED:', payload.eventType, payload);
        // Actualizar conversaciones inmediatamente
        fetchConversations();
      }
    );

    // Escuchar cambios en mensajes
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'mensajes'
      },
      (payload) => {
        console.log('🚨 MESSAGE CHANGED:', payload.eventType, payload);
        
        // SIEMPRE actualizar conversaciones cuando hay cambios en mensajes
        fetchConversations();
        
        // Si hay una conversación seleccionada, verificar si el mensaje pertenece a ella
        if (selectedConversation && payload.new) {
          const messageData = payload.new as any;
          console.log('📝 Checking message for current conversation:', {
            messageConversationId: messageData.conversation_id,
            selectedConversationId: selectedConversation.id,
            messageInstancia: messageData.instancia,
            selectedInstancia: selectedConversation.instancia_nombre
          });
          
          // Actualizar mensajes si pertenece a la conversación actual
          if (messageData.conversation_id === selectedConversation.id) {
            console.log('⚡ Message belongs to current conversation, updating messages');
            fetchMessages(selectedConversation);
          }
        }
      }
    );

    // Suscribirse al canal
    channel.subscribe((status) => {
      console.log('🔗 Realtime channel status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('✅ Realtime channel SUBSCRIBED successfully');
        channelRef.current = channel;
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Realtime channel error');
      } else if (status === 'TIMED_OUT') {
        console.error('⏰ Realtime channel timed out');
      }
    });

    console.log('✅ REALTIME: Subscriptions configured');

    return () => {
      console.log('🔴 REALTIME: Cleaning up subscriptions');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userData, selectedConversation?.id, fetchConversations, fetchMessages]);
};
