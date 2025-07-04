
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

  console.log('useCRMData Debug:', {
    userData,
    selectedInstanceId,
    hasUserData: !!userData
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

  // Callbacks optimizados para tiempo real - FORZAR REFRESH SIN CACHE
  const realtimeFetchConversations = useCallback(() => {
    console.log('🔄 REAL-TIME: Force refreshing conversations without cache');
    refreshConversations();
  }, [refreshConversations]);

  const realtimeFetchMessages = useCallback(async (conversation: Conversation) => {
    console.log('🔄 REAL-TIME: Force refreshing messages without cache for conversation:', conversation.id);
    // SIEMPRE usar refreshMessages que fuerza actualización sin cache
    refreshMessages(conversation);
  }, [refreshMessages]);

  // Real-time subscriptions optimizadas
  useRealtimeSubscriptions({
    userData,
    selectedInstanceId,
    selectedConversation,
    fetchConversations: realtimeFetchConversations,
    fetchMessages: realtimeFetchMessages
  });

  // Handler para cambiar la conversación seleccionada
  const handleSetSelectedConversation = useCallback((conversation: Conversation | null) => {
    console.log('Setting selected conversation:', conversation?.id);
    
    setSelectedConversation(conversation);
    
    // Si hay una conversación seleccionada, cargar sus mensajes (con cache solo en carga inicial)
    if (conversation) {
      console.log('Loading messages for conversation:', conversation.id);
      fetchMessages(conversation);
    } else {
      // Si no hay conversación seleccionada, limpiar mensajes
      clearMessages();
    }
  }, [fetchMessages, clearMessages]);

  // Handler para mensajes enviados
  const handleMessageSent = useCallback((messageText: string) => {
    if (selectedConversation) {
      // Agregar mensaje optimísticamente
      addMessageToChat(selectedConversation, messageText);
    }
  }, [selectedConversation, addMessageToChat]);

  // Limpiar conversación seleccionada cuando cambia la instancia
  useEffect(() => {
    if (previousInstanceId.current !== selectedInstanceId) {
      console.log('Instance changed, clearing selected conversation');
      setSelectedConversation(null);
      clearMessages();
      previousInstanceId.current = selectedInstanceId;
    }
  }, [selectedInstanceId, clearMessages]);

  // El loading general solo debe incluir la carga de conversaciones
  const loading = conversationsLoading;

  return {
    conversations,
    messages,
    selectedConversation,
    setSelectedConversation: handleSetSelectedConversation,
    loading,
    messagesLoading,
    hasMoreMessages,
    fetchConversations,
    fetchMessages,
    loadMoreMessages,
    markAsRead,
    updateConversationAfterSend,
    handleMessageSent,
    refreshConversations,
    refreshMessages
  };
};
