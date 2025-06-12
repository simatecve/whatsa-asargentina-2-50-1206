
import { useState, useEffect, useCallback, useRef } from "react";
import { useUserData } from "./useUserData";
import { Conversation, Message } from "@/types/crm";
import { useConversations } from "./crm/useConversations";
import { useMessages } from "./crm/useMessages";
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
    updateConversationAfterSend
  } = useConversations(selectedInstanceId, userData);

  const {
    messages,
    setMessages,
    fetchMessages,
    addMessageToChat,
    markAsRead,
    clearMessages,
    loading: messagesLoading
  } = useMessages(setConversations);

  // Real-time subscriptions
  useRealtimeSubscriptions({
    userData,
    selectedInstanceId,
    selectedConversation,
    fetchConversations,
    fetchMessages
  });

  // Handler para cambiar la conversación seleccionada
  const handleSetSelectedConversation = useCallback((conversation: Conversation | null) => {
    console.log('Setting selected conversation:', conversation?.id);
    
    setSelectedConversation(conversation);
    
    // Si hay una conversación seleccionada, cargar sus mensajes
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
  // No incluimos messagesLoading aquí para evitar que desaparezcan las conversaciones
  const loading = conversationsLoading;

  return {
    conversations,
    messages,
    selectedConversation,
    setSelectedConversation: handleSetSelectedConversation,
    loading,
    messagesLoading,
    fetchConversations,
    fetchMessages,
    markAsRead,
    updateConversationAfterSend,
    handleMessageSent
  };
};
