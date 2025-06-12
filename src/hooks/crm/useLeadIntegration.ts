
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Lead } from "@/types/lead";
import { Conversation } from "@/types/crm";

export const useLeadIntegration = () => {
  const [leads, setLeads] = useState<{ [key: string]: Lead }>({});
  const [loading, setLoading] = useState(false);

  const getLeadForConversation = async (conversation: Conversation): Promise<Lead | null> => {
    try {
      const cacheKey = `${conversation.numero_contacto}-${conversation.instancia_nombre}`;
      
      // Verificar cache primero
      if (leads[cacheKey]) {
        return leads[cacheKey];
      }

      setLoading(true);
      
      const { data, error } = await supabase.rpc('get_lead_for_conversation', {
        p_numero_contacto: conversation.numero_contacto,
        p_instancia_nombre: conversation.instancia_nombre
      });

      if (error) {
        console.error('Error fetching lead for conversation:', error);
        return null;
      }

      const lead = data?.[0] || null;
      
      if (lead) {
        setLeads(prev => ({ ...prev, [cacheKey]: lead }));
      }

      return lead;
    } catch (error) {
      console.error('Error in getLeadForConversation:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createLeadFromConversation = async (conversation: Conversation): Promise<Lead | null> => {
    try {
      setLoading(true);
      
      const { data: leadId, error } = await supabase.rpc('create_lead_from_conversation', {
        p_numero_contacto: conversation.numero_contacto,
        p_instancia_nombre: conversation.instancia_nombre,
        p_pushname: conversation.nombre_contacto
      });

      if (error) {
        console.error('Error creating lead from conversation:', error);
        return null;
      }

      // Obtener el lead recién creado
      const { data: newLead, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (fetchError) {
        console.error('Error fetching new lead:', fetchError);
        return null;
      }

      const cacheKey = `${conversation.numero_contacto}-${conversation.instancia_nombre}`;
      setLeads(prev => ({ ...prev, [cacheKey]: newLead }));

      return newLead;
    } catch (error) {
      console.error('Error in createLeadFromConversation:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: number, newStatus: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) {
        console.error('Error updating lead status:', error);
        return false;
      }

      // Actualizar cache local
      setLeads(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          if (updated[key].id === leadId) {
            updated[key] = { ...updated[key], status: newStatus };
          }
        });
        return updated;
      });

      return true;
    } catch (error) {
      console.error('Error in updateLeadStatus:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    getLeadForConversation,
    createLeadFromConversation,
    updateLeadStatus,
    loading
  };
};
