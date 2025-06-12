
import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useLeadIntegration } from "./useLeadIntegration";
import { Conversation, Message } from "@/hooks/useCRMData";
import { Lead } from "@/types/lead";

export const useChatWindowState = (conversation: Conversation, messages: Message[]) => {
  const { 
    getLeadForConversation, 
    createLeadFromConversation, 
    updateLeadStatus, 
    loading: leadLoading 
  } = useLeadIntegration();
  
  const [conversationLead, setConversationLead] = useState<Lead | null>(null);
  const [loadingLead, setLoadingLead] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const previousConversationId = useRef<string | null>(null);

  // Memoize conversation key
  const conversationKey = useMemo(() => 
    `${conversation.numero_contacto}-${conversation.instancia_nombre}`, 
    [conversation.numero_contacto, conversation.instancia_nombre]
  );

  // Auto-scroll function
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  }, []);

  // Scroll when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, scrollToBottom]);

  // Load lead when conversation changes
  useEffect(() => {
    if (previousConversationId.current !== conversation.id) {
      setConversationLead(null);
      setLoadingLead(false);
      scrollToBottom("instant");
      previousConversationId.current = conversation.id;
      
      const loadLead = async () => {
        setLoadingLead(true);
        try {
          const foundLead = await getLeadForConversation(conversation);
          setConversationLead(foundLead);
        } catch (error) {
          console.error('Error loading lead for conversation:', error);
          setConversationLead(null);
        } finally {
          setLoadingLead(false);
        }
      };
      
      loadLead();
    }
  }, [conversation.id, getLeadForConversation, scrollToBottom]);

  const handleCreateLead = useCallback(async (): Promise<Lead | null> => {
    try {
      const newLead = await createLeadFromConversation(conversation);
      if (newLead) {
        setConversationLead(newLead);
      }
      return newLead;
    } catch (error) {
      console.error('Error creating lead:', error);
      return null;
    }
  }, [conversation, createLeadFromConversation]);

  const handleUpdateLeadStatus = useCallback(async (leadId: number, newStatus: string): Promise<boolean> => {
    try {
      const success = await updateLeadStatus(leadId, newStatus);
      if (success && conversationLead) {
        const updatedLead = { ...conversationLead, status: newStatus };
        setConversationLead(updatedLead);
      }
      return success;
    } catch (error) {
      console.error('Error updating lead status:', error);
      return false;
    }
  }, [updateLeadStatus, conversationLead]);

  return {
    conversationLead,
    loadingLead,
    leadLoading,
    messagesEndRef,
    scrollAreaRef,
    scrollToBottom,
    handleCreateLead,
    handleUpdateLeadStatus
  };
};
