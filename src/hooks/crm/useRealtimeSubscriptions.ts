
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
  console.log('🔄 REALTIME Hook initialized with:', { 
    hasUserData: !!userData, 
    selectedInstanceId, 
    selectedConversationId: selectedConversation?.id 
  });

  useEffect(() => {
    if (!userData) {
      console.log('🔴 REALTIME: No userData, skipping subscription');
      return;
    }

    console.log('🔴 REALTIME: Setting up realtime subscriptions...');

    // Canal único para conversaciones
    const conversationsChannel = supabase
      .channel(`conversations_${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversaciones'
        },
        (payload) => {
          console.log('🚨 CONVERSATION CHANGED:', payload.eventType, payload);
          fetchConversations();
        }
      )
      .subscribe((status) => {
        console.log('🔗 Conversations channel:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Conversations channel SUBSCRIBED successfully');
        }
      });

    // Canal único para mensajes
    const messagesChannel = supabase
      .channel(`messages_${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mensajes'
        },
        (payload) => {
          console.log('🚨 MESSAGE CHANGED:', payload.eventType, payload);
          
          // Siempre actualizar conversaciones cuando hay cambios en mensajes
          fetchConversations();
          
          // Si hay una conversación seleccionada, actualizar mensajes también
          if (selectedConversation) {
            console.log('⚡ Updating messages for current conversation');
            fetchMessages(selectedConversation);
          }
        }
      )
      .subscribe((status) => {
        console.log('🔗 Messages channel:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Messages channel SUBSCRIBED successfully');
        }
      });

    console.log('✅ REALTIME: Subscriptions configured');

    return () => {
      console.log('🔴 REALTIME: Cleaning up subscriptions');
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [userData, fetchConversations, fetchMessages, selectedConversation]);
};
