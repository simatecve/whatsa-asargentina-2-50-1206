import { useState, useEffect, useCallback } from "react";
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
    updateConversationAfterSend,
    handleMessageSent: crmHandleMessageSent
  } = useCRMData(selectedInstanceId);

  // Procesar conversaciones para determinar cuáles están bloqueadas
  useEffect(() => {
    if (allConversations.length > 0) {
      processConversations(allConversations);
    }
  }, [allConversations, processConversations]);

  // Obtener conversaciones filtradas usando la función memoizada
  const conversations = getFilteredConversations(allConversations);

  // Handle URL parameters for direct navigation from Kanban
  useEffect(() => {
    const instanceParam = getParam('instance');
    const contactParam = getParam('contact');
    if (instanceParam && contactParam && allConversations.length > 0) {
      const findInstanceByName = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;
          
          const { data: instanceData } = await supabase
            .from('instancias')
            .select('id, nombre')
            .eq('nombre', instanceParam)
            .eq('user_id', session.user.id)
            .single();
          
          if (instanceData) {
            setSelectedInstanceId(instanceData.id);
            
            const targetConversation = allConversations.find(conv => 
              conv.instancia_nombre === instanceParam && 
              conv.numero_contacto === contactParam
            );
            
            if (targetConversation) {
              if (conversations.find(conv => conv.id === targetConversation.id)) {
                setSelectedConversation(targetConversation);
                toast.success(`Conversación encontrada con ${targetConversation.nombre_contacto || 'Sin nombre'}`);
              } else {
                toast.error('Esta conversación está bloqueada por límite del plan');
              }
            } else {
              toast.info(`No se encontró una conversación existente para ${contactParam}. Puedes iniciar una nueva.`);
            }
          } else {
            toast.error(`Instancia "${instanceParam}" no encontrada`);
          }
        } catch (error) {
          console.error('Error finding instance:', error);
          toast.error('Error al buscar la instancia');
        }
      };
      
      findInstanceByName();

      // Limpiar los parámetros de URL después de procesarlos
      const url = new URL(window.location.href);
      url.searchParams.delete('instance');
      url.searchParams.delete('contact');
      window.history.replaceState({}, '', url.toString());
    }
  }, [allConversations, getParam, setSelectedConversation, conversations]);

  const handleMessageSent = useCallback(async (message: string) => {
    if (selectedConversation) {
      // Usar el handler del CRM que actualiza la UI inmediatamente
      crmHandleMessageSent(message);
      // También actualizar la conversación
      await updateConversationAfterSend(selectedConversation, message);
    }
  }, [selectedConversation, crmHandleMessageSent, updateConversationAfterSend]);

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
    messageUsage
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
    updateConversationAfterSend
  };
};
