
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Conversation } from "@/types/crm";
import { useOptimizedCache } from "./useOptimizedCache";

export const useOptimizedConversations = (selectedInstanceId?: string, userData?: any) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const lastFetchRef = useRef<string | undefined>(undefined);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const {
    getCachedConversations,
    setCachedConversations,
    invalidateConversationsCache,
    updateConversationInCache
  } = useOptimizedCache();

  const fetchConversations = useCallback(async (instanceId?: string, useCache: boolean = true) => {
    try {
      // Cancelar petición anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Verificar cache primero
      if (useCache) {
        const cached = getCachedConversations(instanceId || "all");
        if (cached) {
          console.log('Using cached conversations:', cached.length);
          setConversations(cached);
          setLoading(false);
          return;
        }
      }

      console.log('Fetching fresh conversations for instance:', instanceId);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.log('No session found, cannot fetch conversations');
        setConversations([]);
        setLoading(false);
        return;
      }

      // Crear nuevo AbortController
      abortControllerRef.current = new AbortController();

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
        .order('ultimo_mensaje_fecha', { ascending: false })
        .limit(100); // Limitar a las 100 conversaciones más recientes

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
          setLoading(false);
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
      
      console.log('Fresh conversations fetched:', formattedConversations.length);
      
      // Actualizar cache
      setCachedConversations(formattedConversations, instanceId || "all");
      setConversations(formattedConversations);
      lastFetchRef.current = instanceId;
      
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching conversations:', error);
        setConversations([]);
      }
    } finally {
      setLoading(false);
    }
  }, [getCachedConversations, setCachedConversations]);

  const updateConversationAfterSend = useCallback(async (conversation: Conversation, message: string) => {
    try {
      const now = new Date().toISOString();
      
      // Actualizar estado local y cache inmediatamente
      const updatedConversation = { 
        ...conversation, 
        ultimo_mensaje: message,
        ultimo_mensaje_fecha: now
      };
      
      setConversations(prev => {
        const updated = prev.map(conv => 
          conv.id === conversation.id ? updatedConversation : conv
        );
        const otherConvs = updated.filter(conv => conv.id !== conversation.id);
        return [updatedConversation, ...otherConvs];
      });

      // Actualizar cache
      updateConversationInCache(updatedConversation);

      // Actualizar en base de datos en background
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
        // En caso de error, refrescar desde base de datos
        fetchConversations(selectedInstanceId, false);
      }
    } catch (error) {
      console.error('Error updating conversation after send:', error);
      fetchConversations(selectedInstanceId, false);
    }
  }, [updateConversationInCache, fetchConversations, selectedInstanceId]);

  // Efecto optimizado que evita fetch innecesarios
  useEffect(() => {
    if (userData && lastFetchRef.current !== selectedInstanceId) {
      setLoading(true);
      fetchConversations(selectedInstanceId);
    }
  }, [userData, selectedInstanceId, fetchConversations]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const refreshConversations = useCallback(() => {
    invalidateConversationsCache();
    fetchConversations(selectedInstanceId, false);
  }, [invalidateConversationsCache, fetchConversations, selectedInstanceId]);

  return {
    conversations,
    setConversations,
    loading,
    fetchConversations,
    updateConversationAfterSend,
    refreshConversations
  };
};
