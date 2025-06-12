
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Conversation } from "@/types/crm";

export const useConversations = (selectedInstanceId?: string, userData?: any) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async (instanceId?: string) => {
    try {
      console.log('Fetching conversations for instance:', instanceId);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.log('No session found, cannot fetch conversations');
        setConversations([]);
        return;
      }

      let query = supabase
        .from('conversaciones')
        .select(`
          id,
          numero_contacto,
          nombre_contacto,
          ultimo_mensaje,
          ultimo_mensaje_fecha,
          mensajes_no_leidos,
          instancia_nombre
        `)
        .order('ultimo_mensaje_fecha', { ascending: false });

      if (instanceId && instanceId !== "all") {
        const { data: instanceData } = await supabase
          .from('instancias')
          .select('nombre, user_id')
          .eq('id', instanceId)
          .eq('user_id', session.user.id)
          .single();
        
        if (instanceData) {
          query = query.eq('instancia_nombre', instanceData.nombre);
        }
      } else {
        const { data: userInstances } = await supabase
          .from('instancias')
          .select('nombre')
          .eq('user_id', session.user.id);
        
        if (userInstances && userInstances.length > 0) {
          const instanceNames = userInstances.map(inst => inst.nombre);
          query = query.in('instancia_nombre', instanceNames);
        } else {
          setConversations([]);
          return;
        }
      }

      const { data: conversationsData, error } = await query;

      if (error) {
        console.error('Error fetching conversations:', error);
        throw error;
      }

      const formattedConversations: Conversation[] = (conversationsData || []).map(conv => ({
        id: conv.id,
        numero_contacto: conv.numero_contacto,
        nombre_contacto: conv.nombre_contacto,
        ultimo_mensaje: conv.ultimo_mensaje,
        ultimo_mensaje_fecha: conv.ultimo_mensaje_fecha,
        mensajes_no_leidos: conv.mensajes_no_leidos,
        instancia_nombre: conv.instancia_nombre
      }));
      
      console.log('Conversations fetched:', formattedConversations.length);
      setConversations(formattedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    }
  }, [userData]);

  const updateConversationAfterSend = useCallback(async (conversation: Conversation, message: string) => {
    try {
      const now = new Date().toISOString();
      
      // Actualizar estado local inmediatamente
      setConversations(prev => {
        const updated = prev.map(conv => 
          conv.id === conversation.id
            ? { 
                ...conv, 
                ultimo_mensaje: message,
                ultimo_mensaje_fecha: now
              }
            : conv
        );
        const updatedConv = updated.find(conv => conv.id === conversation.id);
        const otherConvs = updated.filter(conv => conv.id !== conversation.id);
        return updatedConv ? [updatedConv, ...otherConvs] : updated;
      });

      // Actualizar en base de datos
      const { error } = await supabase
        .from('conversaciones')
        .update({
          ultimo_mensaje: message,
          ultimo_mensaje_fecha: now,
          updated_at: now
        })
        .eq('id', conversation.id);

      if (error) {
        console.error('Error updating conversation after send:', error);
        fetchConversations(selectedInstanceId);
      }
    } catch (error) {
      console.error('Error updating conversation after send:', error);
      fetchConversations(selectedInstanceId);
    }
  }, [fetchConversations, selectedInstanceId]);

  useEffect(() => {
    console.log('useConversations effect triggered:', { userData: !!userData, selectedInstanceId });
    if (userData) {
      setLoading(true);
      fetchConversations(selectedInstanceId).finally(() => setLoading(false));
    }
  }, [userData, selectedInstanceId, fetchConversations]);

  return {
    conversations,
    setConversations,
    loading,
    fetchConversations,
    updateConversationAfterSend
  };
};
