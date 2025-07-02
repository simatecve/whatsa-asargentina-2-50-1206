
import { useState, useEffect, useCallback, useRef } from "react";
import { useCRMData, Conversation } from "@/hooks/useCRMData";
import { useSubscriptionValidation } from "@/hooks/useSubscriptionValidation";
import { useConversationLimits } from "@/hooks/useConversationLimits";
import { useMessageLimits } from "@/hooks/useMessageLimits";
import { useBotAutoDisable } from "@/hooks/useBotAutoDisable";
import { useURLParams } from "@/hooks/useURLParams";
import { toast } from "sonner";

export const useCRMState = () => {
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>("all");
  const [navigationProcessed, setNavigationProcessed] = useState(false);
  const navigationProcessedRef = useRef(false);
  
  const {
    limits,
    suscripcionActiva,
    checkLimit,
    loading: subscriptionLoading,
    isExpired
  } = useSubscriptionValidation();
  
  const {
    blockedConversations,
    getFilteredConversations,
    processConversations
  } = useConversationLimits();

  const {
    isAtMessageLimit,
    messageUsage,
    validateMessageReceive
  } = useMessageLimits();

  // Usar el hook de auto-desactivación de bots
  useBotAutoDisable();
  
  const { getParam } = useURLParams();
  
  const {
    conversations: allConversations,
    messages,
    selectedConversation,
    setSelectedConversation,
    loading,
    messagesLoading,
    hasMoreMessages,
    updateConversationAfterSend,
    handleMessageSent: crmHandleMessageSent,
    loadMoreMessages
  } = useCRMData(selectedInstanceId);

  // Procesar conversaciones para determinar cuáles están bloqueadas
  useEffect(() => {
    if (allConversations.length > 0) {
      try {
        processConversations(allConversations);
      } catch (error) {
        console.error('Error processing conversations limits:', error);
      }
    }
  }, [allConversations, processConversations]);

  // Obtener conversaciones filtradas usando la función memoizada
  const conversations = getFilteredConversations(allConversations);

  // Procesar navegación desde Kanban
  useEffect(() => {
    if (navigationProcessedRef.current) return;

    const instanceIdParam = getParam('instanceId');
    const contactParam = getParam('contact');
    
    if (!instanceIdParam || !contactParam) return;

    console.log('Processing Kanban navigation with instanceId:', instanceIdParam, 'contact:', contactParam);

    // Limpiar los parámetros de URL inmediatamente
    const url = new URL(window.location.href);
    url.searchParams.delete('instanceId');
    url.searchParams.delete('contact');
    window.history.replaceState({}, '', url.toString());

    // Establecer la instancia
    setSelectedInstanceId(instanceIdParam);
    
    // Marcar como procesado para evitar re-ejecuciones
    navigationProcessedRef.current = true;
    setNavigationProcessed(true);

    // Función para buscar y seleccionar conversación cuando las conversaciones estén disponibles
    const findAndSelectConversation = () => {
      if (allConversations.length === 0) return false;
      
      console.log('Looking for conversation with contact:', contactParam);
      
      const targetConversation = allConversations.find(conv => 
        conv.numero_contacto === contactParam
      );
      
      if (targetConversation) {
        const isBlocked = !conversations.find(conv => conv.id === targetConversation.id);
        
        if (!isBlocked) {
          console.log('Selecting conversation:', targetConversation.id);
          setSelectedConversation(targetConversation);
          toast.success(`Conversación encontrada con ${targetConversation.nombre_contacto || 'Sin nombre'}`);
        } else {
          toast.error('Esta conversación está bloqueada por límite del plan');
        }
      } else {
        toast.info(`No se encontró una conversación existente para ${contactParam}. Puedes iniciar una nueva.`);
      }
      
      return true;
    };

    findAndSelectConversation();
  }, [getParam]);

  // Buscar conversación cuando cambien las conversaciones
  useEffect(() => {
    if (!navigationProcessed || allConversations.length === 0) return;
    
    const contactParam = getParam('contact');
    if (!contactParam) return;
    
    if (selectedConversation) return;
    
    console.log('Searching for conversation after conversations loaded');
    
    const targetConversation = allConversations.find(conv => 
      conv.numero_contacto === contactParam
    );
    
    if (targetConversation) {
      const isBlocked = !conversations.find(conv => conv.id === targetConversation.id);
      
      if (!isBlocked) {
        console.log('Late selecting conversation:', targetConversation.id);
        setSelectedConversation(targetConversation);
      }
    }
  }, [allConversations, conversations, navigationProcessed, selectedConversation, getParam]);

  const handleMessageSent = useCallback(async (message: string) => {
    if (selectedConversation) {
      try {
        crmHandleMessageSent(message);
        await updateConversationAfterSend(selectedConversation, message);
      } catch (error) {
        console.error('Error handling message sent:', error);
      }
    }
  }, [selectedConversation, crmHandleMessageSent, updateConversationAfterSend]);

  const handleLoadMoreMessages = useCallback(() => {
    if (selectedConversation && loadMoreMessages) {
      try {
        loadMoreMessages();
      } catch (error) {
        console.error('Error loading more messages:', error);
      }
    }
  }, [selectedConversation, loadMoreMessages]);

  // Computed values
  const showSubscriptionAlert = !subscriptionLoading && isExpired;
  const isAtConversationLimit = limits ? checkLimit('conversaciones') : false;
  const hasBlockedConversations = blockedConversations.length > 0;

  console.log('CRM Debug:', {
    selectedInstanceId,
    allConversations: allConversations?.length || 0,
    filteredConversations: conversations?.length || 0,
    blockedConversations: blockedConversations?.length || 0,
    loading,
    messagesLoading,
    selectedConversation: selectedConversation?.id,
    subscriptionLoading,
    isExpired,
    limits,
    suscripcionActiva: !!suscripcionActiva,
    isAtMessageLimit,
    messageUsage,
    hasMoreMessages,
    navigationProcessed
  });

  return {
    // State
    selectedInstanceId,
    setSelectedInstanceId,
    conversations,
    allConversations,
    messages,
    selectedConversation,
    setSelectedConversation,
    loading,
    messagesLoading,
    subscriptionLoading,
    hasMoreMessages,
    
    // Subscription data
    limits,
    suscripcionActiva,
    isExpired,
    showSubscriptionAlert,
    isAtConversationLimit,
    
    // Conversation limits
    blockedConversations,
    hasBlockedConversations,
    
    // Message limits
    isAtMessageLimit,
    messageUsage,
    validateMessageReceive,
    
    // Handlers
    handleMessageSent,
    updateConversationAfterSend,
    handleLoadMoreMessages
  };
};
