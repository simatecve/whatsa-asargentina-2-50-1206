
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

  console.log('useCRMData OPTIMIZADO:', {
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

  // OPTIMIZACIÓN: Callbacks optimizados con debouncing
  const realtimeFetchConversations = useCallback(() => {
    console.log('🔄 REAL-TIME OPTIMIZADO: Refrescando conversaciones');
    refreshConversations();
  }, [refreshConversations]);

  const realtimeFetchMessages = useCallback(async (conversation: Conversation) => {
    console.log('🔄 REAL-TIME OPTIMIZADO: Refrescando mensajes para:', conversation.id);
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

  // OPTIMIZACIÓN: Handler mejorado para cambio de conversación
  const handleSetSelectedConversation = useCallback((conversation: Conversation | null) => {
    console.log('Seleccionando conversación optimizada:', conversation?.id);
    
    setSelectedConversation(conversation);
    
    if (conversation) {
      console.log('Cargando mensajes optimizados para conversación:', conversation.id);
      fetchMessages(conversation);
    } else {
      clearMessages();
    }
  }, [fetchMessages, clearMessages]);

  // OPTIMIZACIÓN: Handler de mensajes enviados más eficiente
  const handleMessageSent = useCallback((messageText: string) => {
    if (selectedConversation) {
      // Agregar optimísticamente
      addMessageToChat(selectedConversation, messageText);
    }
  }, [selectedConversation, addMessageToChat]);

  // OPTIMIZACIÓN: Limpiar al cambiar instancia
  useEffect(() => {
    if (previousInstanceId.current !== selectedInstanceId) {
      console.log('Instancia cambiada, limpiando conversación seleccionada');
      setSelectedConversation(null);
      clearMessages();
      previousInstanceId.current = selectedInstanceId;
    }
  }, [selectedInstanceId, clearMessages]);

  // Loading solo para conversaciones principales
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
