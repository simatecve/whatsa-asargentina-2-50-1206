
import { useState, useEffect, useCallback, useRef } from "react";
import { useUserData } from "./useUserData";
import { Conversation, Message } from "@/types/crm";
import { useOptimizedConversations } from "./crm/useOptimizedConversations";
import { useOptimizedMessages } from "./crm/useOptimizedMessages";
import { useRealtimeSubscriptions } from "./crm/useRealtimeSubscriptions";

export type { Conversation, Message };

export const useCRMData = (selectedInstanceId?: string) => {
  const { userData } = useUserData();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const previousInstanceId = useRef<string | undefined>(undefined);

  console.log('🏠 useCRMData render:', {
    userData: !!userData,
    selectedInstanceId,
    selectedConversationId: selectedConversation?.id
  });

  const {
    conversations,
    setConversations,
    loading: conversationsLoading,
    fetchConversations,
    updateConversationAfterSend,
    refreshConversations
  } = useOptimizedConversations(selectedInstanceId, userData);

  const {
    messages,
    setMessages,
    fetchMessages,
    loadMoreMessages,
    addMessageToChat,
    markAsRead,
    clearMessages,
    refreshMessages,
    loading: messagesLoading,
    hasMoreMessages
  } = useOptimizedMessages(setConversations);

  // Callbacks optimizados para tiempo real
  const realtimeFetchConversations = useCallback(() => {
    console.log('🔄 Real-time: Refreshing conversations');
    refreshConversations();
  }, [refreshConversations]);

  const realtimeFetchMessages = useCallback(async (conversation: Conversation) => {
    console.log('🔄 Real-time: Refreshing messages for conversation:', conversation.id);
    if (selectedConversation?.id === conversation.id) {
      await refreshMessages(conversation);
    }
  }, [selectedConversation, refreshMessages]);

  // Real-time subscriptions
  useRealtimeSubscriptions({
    userData,
    selectedInstanceId,
    selectedConversation,
    fetchConversations: realtimeFetchConversations,
    fetchMessages: realtimeFetchMessages
  });

  // Handler para cambiar la conversación seleccionada
  const handleSetSelectedConversation = useCallback(async (conversation: Conversation | null) => {
    console.log('🎯 Setting selected conversation:', conversation?.id);
    
    if (conversation?.id === selectedConversation?.id) {
      console.log('⚠️ Same conversation selected, skipping');
      return;
    }
    
    setSelectedConversation(conversation);
    
    if (conversation) {
      console.log('📨 Loading messages for conversation:', conversation.id);
      try {
        await fetchMessages(conversation, 0, false);
        console.log('✅ Messages loaded successfully');
      } catch (error) {
        console.error('❌ Error loading messages:', error);
      }
    } else {
      console.log('🧹 No conversation selected, clearing messages');
      clearMessages();
    }
  }, [selectedConversation?.id, fetchMessages, clearMessages]);

  // Handler para mensajes enviados
  const handleMessageSent = useCallback((messageText: string) => {
    console.log('📤 Message sent:', messageText);
    if (selectedConversation) {
      addMessageToChat(selectedConversation, messageText);
      updateConversationAfterSend(selectedConversation, messageText);
    }
  }, [selectedConversation, addMessageToChat, updateConversationAfterSend]);

  // Limpiar conversación seleccionada cuando cambia la instancia
  useEffect(() => {
    if (previousInstanceId.current !== selectedInstanceId) {
      console.log('🔄 Instance changed, clearing selected conversation');
      setSelectedConversation(null);
      clearMessages();
      previousInstanceId.current = selectedInstanceId;
    }
  }, [selectedInstanceId, clearMessages]);

  const loading = conversationsLoading;

  console.log('🏠 useCRMData return values:', {
    conversationsCount: conversations.length,
    messagesCount: messages.length,
    selectedConversationId: selectedConversation?.id,
    loading,
    messagesLoading,
    hasMoreMessages
  });

  return {
    conversations,
    messages,
    selectedConversation,
    setSelectedConversation: handleSetSelectedConversation,
    loading,
    messagesLoading,
    hasMoreMessages,
    fetchConversations,
    fetchMessages: (conversation: Conversation) => fetchMessages(conversation, 0, false),
    loadMoreMessages: () => selectedConversation ? loadMoreMessages(selectedConversation) : Promise.resolve(),
    markAsRead,
    updateConversationAfterSend,
    handleMessageSent,
    refreshConversations,
    refreshMessages: () => selectedConversation ? refreshMessages(selectedConversation) : Promise.resolve()
  };
};
