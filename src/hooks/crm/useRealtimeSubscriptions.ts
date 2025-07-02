
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

  // Conversaciones subscription
  useEffect(() => {
    if (!userData) return;

    // Cleanup existing subscription
    if (conversationsChannelRef.current) {
      supabase.removeChannel(conversationsChannelRef.current);
      conversationsChannelRef.current = null;
    }

    console.log('Setting up conversations realtime subscription');
    
    conversationsChannelRef.current = supabase
      .channel('conversaciones-changes')
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
      .subscribe();

    return () => {
      if (conversationsChannelRef.current) {
        supabase.removeChannel(conversationsChannelRef.current);
        conversationsChannelRef.current = null;
      }
    };
  }, [userData, selectedInstanceId, fetchConversations]);

  // Mensajes subscription
  useEffect(() => {
    if (!userData || !selectedConversation) {
      // Cleanup messages subscription if no conversation selected
      if (messagesChannelRef.current) {
        supabase.removeChannel(messagesChannelRef.current);
        messagesChannelRef.current = null;
      }
      return;
    }

    // Cleanup existing subscription
    if (messagesChannelRef.current) {
      supabase.removeChannel(messagesChannelRef.current);
      messagesChannelRef.current = null;
    }

    console.log('Setting up messages realtime subscription for conversation:', selectedConversation.id);

    messagesChannelRef.current = supabase
      .channel(`mensajes-${selectedConversation.id}`)
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
      .subscribe();

    return () => {
      if (messagesChannelRef.current) {
        supabase.removeChannel(messagesChannelRef.current);
        messagesChannelRef.current = null;
      }
    };
  }, [userData, selectedConversation, fetchMessages, fetchConversations]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (conversationsChannelRef.current) {
        supabase.removeChannel(conversationsChannelRef.current);
      }
      if (messagesChannelRef.current) {
        supabase.removeChannel(messagesChannelRef.current);
      }
    };
  }, []);
};
