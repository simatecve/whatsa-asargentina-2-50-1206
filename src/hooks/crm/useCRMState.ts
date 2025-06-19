
import { useState, useEffect, useCallback, useRef } from "react";
import { useCRMData, Conversation } from "@/hooks/useCRMData";
import { useSubscriptionValidation } from "@/hooks/useSubscriptionValidation";
import { useConversationLimits } from "@/hooks/useConversationLimits";
import { useMessageLimits } from "@/hooks/useMessageLimits";
import { useBotAutoDisable } from "@/hooks/useBotAutoDisable";
import { useURLParams } from "@/hooks/useURLParams";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCRMState = () => {
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>("all");
  const [urlParamsProcessed, setUrlParamsProcessed] = useState(false);
  
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
      processConversations(allConversations);
    }
  }, [allConversations, processConversations]);

  // Obtener conversaciones filtradas usando la función memoizada
  const conversations = getFilteredConversations(allConversations);

  // Handle URL parameters for direct navigation from Kanban - SOLO UNA VEZ
  useEffect(() => {
    if (urlParamsProcessed) return;

    const instanceParam = getParam('instance');
    const contactParam = getParam('contact');
    
    if (!instanceParam || !contactParam) return;

    console.log('Processing URL params:', { instanceParam, contactParam });
    
    const processUrlParams = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log('No session found');
          return;
        }
        
        // Buscar la instancia por nombre
        const { data: instanceData } = await supabase
          .from('instancias')
          .select('id, nombre')
          .eq('nombre', instanceParam)
          .eq('user_id', session.user.id)
          .single();
        
        if (instanceData) {
          console.log('Setting instance ID:', instanceData.id);
          setSelectedInstanceId(instanceData.id);
        } else {
          toast.error(`Instancia "${instanceParam}" no encontrada`);
        }
      } catch (error) {
        console.error('Error processing URL params:', error);
        toast.error('Error al procesar la navegación');
      } finally {
        setUrlParamsProcessed(true);
        // Limpiar los parámetros de URL después de procesarlos
        const url = new URL(window.location.href);
        url.searchParams.delete('instance');
        url.searchParams.delete('contact');
        window.history.replaceState({}, '', url.toString());
      }
    };

    processUrlParams();
  }, [getParam, urlParamsProcessed]);

  // Buscar y seleccionar conversación cuando cambien las conversaciones y tengamos parámetros URL
  useEffect(() => {
    if (!urlParamsProcessed || allConversations.length === 0) return;

    const contactParam = getParam('contact');
    const instanceParam = getParam('instance');
    
    if (!contactParam || !instanceParam) return;

    console.log('Looking for conversation with:', { contactParam, instanceParam });
    
    const targetConversation = allConversations.find(conv => {
      const matches = conv.instancia_nombre === instanceParam && 
                    conv.numero_contacto === contactParam;
      console.log('Checking conversation:', {
        id: conv.id,
        instancia: conv.instancia_nombre,
        numero: conv.numero_contacto,
        matches
      });
      return matches;
    });
    
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
  }, [allConversations, conversations, urlParamsProcessed, getParam, setSelectedConversation]);

  const handleMessageSent = useCallback(async (message: string) => {
    if (selectedConversation) {
      // Usar el handler del CRM que actualiza la UI inmediatamente
      crmHandleMessageSent(message);
      // También actualizar la conversación
      await updateConversationAfterSend(selectedConversation, message);
    }
  }, [selectedConversation, crmHandleMessageSent, updateConversationAfterSend]);

  const handleLoadMoreMessages = useCallback(() => {
    if (selectedConversation && loadMoreMessages) {
      loadMoreMessages(selectedConversation);
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
    urlParamsProcessed
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
