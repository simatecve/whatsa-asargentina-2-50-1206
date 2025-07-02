
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Conversation } from "@/types/crm";

interface UseRealtimeSubscriptionsProps {
  userData: any;
  selectedInstanceId?: string;
  selectedConversation: Conversation | null;
  fetchConversations: () => void;
  fetchMessages: (conversation: Conversation) => void;
}

export const useRealtimeSubscriptions = ({
  userData,
  selectedInstanceId,
  selectedConversation,
  fetchConversations,
  fetchMessages
}: UseRealtimeSubscriptionsProps) => {
  const conversationsChannelRef = useRef<any>(null);
  const messagesChannelRef = useRef<any>(null);
  const isSubscribedRef = useRef({ conversations: false, messages: false });

  // Conversaciones subscription
  useEffect(() => {
    if (!userData) {
      console.log('No user data, skipping conversations subscription');
      return;
    }

    // Cleanup existing subscription
    if (conversationsChannelRef.current) {
      console.log('Cleaning up existing conversations channel');
      supabase.removeChannel(conversationsChannelRef.current);
      conversationsChannelRef.current = null;
      isSubscribedRef.current.conversations = false;
    }

    // Only create new subscription if not already subscribed
    if (!isSubscribedRef.current.conversations) {
      console.log('Setting up conversations realtime subscription');
      
      conversationsChannelRef.current = supabase
        .channel(`conversaciones-changes-${Date.now()}`) // Unique channel name
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'conversaciones'
          },
          (payload) => {
            console.log('Conversaciones change detected:', payload);
            // Refrescar conversaciones después de un breve delay
            setTimeout(() => fetchConversations(), 500);
          }
        )
        .subscribe((status) => {
          console.log('Conversations subscription status:', status);
          if (status === 'SUBSCRIBED') {
            isSubscribedRef.current.conversations = true;
          }
        });
    }

    return () => {
      if (conversationsChannelRef.current) {
        console.log('Cleanup: removing conversations channel');
        supabase.removeChannel(conversationsChannelRef.current);
        conversationsChannelRef.current = null;
        isSubscribedRef.current.conversations = false;
      }
    };
  }, [userData, selectedInstanceId, fetchConversations]);

  // Mensajes subscription
  useEffect(() => {
    // Cleanup messages subscription if no conversation selected
    if (!userData || !selectedConversation) {
      if (messagesChannelRef.current) {
        console.log('Cleaning up messages channel - no conversation');
        supabase.removeChannel(messagesChannelRef.current);
        messagesChannelRef.current = null;
        isSubscribedRef.current.messages = false;
      }
      return;
    }

    // Cleanup existing subscription
    if (messagesChannelRef.current) {
      console.log('Cleaning up existing messages channel');
      supabase.removeChannel(messagesChannelRef.current);
      messagesChannelRef.current = null;
      isSubscribedRef.current.messages = false;
    }

    // Only create new subscription if not already subscribed
    if (!isSubscribedRef.current.messages) {
      console.log('Setting up messages realtime subscription for conversation:', selectedConversation.id);

      messagesChannelRef.current = supabase
        .channel(`mensajes-${selectedConversation.id}-${Date.now()}`) // Unique channel name
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'mensajes',
            filter: `conversation_id=eq.${selectedConversation.id}`
          },
          (payload) => {
            console.log('Messages change detected:', payload);
            // Refrescar mensajes y conversaciones después de un breve delay
            setTimeout(() => {
              fetchMessages(selectedConversation);
              fetchConversations();
            }, 500);
          }
        )
        .subscribe((status) => {
          console.log('Messages subscription status:', status);
          if (status === 'SUBSCRIBED') {
            isSubscribedRef.current.messages = true;
          }
        });
    }

    return () => {
      if (messagesChannelRef.current) {
        console.log('Cleanup: removing messages channel');
        supabase.removeChannel(messagesChannelRef.current);
        messagesChannelRef.current = null;
        isSubscribedRef.current.messages = false;
      }
    };
  }, [userData, selectedConversation, fetchMessages, fetchConversations]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('Component unmount: cleaning up all channels');
      if (conversationsChannelRef.current) {
        supabase.removeChannel(conversationsChannelRef.current);
        isSubscribedRef.current.conversations = false;
      }
      if (messagesChannelRef.current) {
        supabase.removeChannel(messagesChannelRef.current);
        isSubscribedRef.current.messages = false;
      }
    };
  }, []);
};
