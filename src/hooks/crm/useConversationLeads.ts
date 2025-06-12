
import { useState, useCallback } from "react";
import { useLeadIntegration } from "./useLeadIntegration";
import { Conversation } from "@/types/crm";
import { Lead } from "@/types/lead";

export const useConversationLeads = () => {
  const { getLeadForConversation } = useLeadIntegration();
  const [conversationLeads, setConversationLeads] = useState<{ [key: string]: Lead | null }>({});
  const [loadingLeads, setLoadingLeads] = useState<Set<string>>(new Set());

  const loadLeadForConversation = useCallback(async (conversation: Conversation) => {
    const key = `${conversation.numero_contacto}-${conversation.instancia_nombre}`;
    
    if (loadingLeads.has(key) || conversationLeads[key] !== undefined) {
      return;
    }

    setLoadingLeads(prev => new Set(prev).add(key));

    try {
      const lead = await getLeadForConversation(conversation);
      setConversationLeads(prev => ({ ...prev, [key]: lead }));
    } catch (error) {
      console.error('Error loading lead for conversation:', error);
      setConversationLeads(prev => ({ ...prev, [key]: null }));
    } finally {
      setLoadingLeads(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  }, [getLeadForConversation, loadingLeads, conversationLeads]);

  const getLeadForKey = (key: string) => conversationLeads[key];
  const isLeadLoading = (key: string) => loadingLeads.has(key);

  return {
    loadLeadForConversation,
    getLeadForKey,
    isLeadLoading
  };
};
