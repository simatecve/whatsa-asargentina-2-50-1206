
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

      // Para tiempo real, SIEMPRE invalidar cache primero
      if (!useCache) {
        console.log('🔄 REALTIME: Invalidating conversations cache for fresh data');
        invalidateConversationsCache();
      }

      // Verificar cache solo si useCache es true
      if (useCache) {
        const cached = getCachedConversations(instanceId || "all");
        if (cached) {
          console.log('📦 Using cached conversations:', cached.length);
          setConversations(cached);
          setLoading(false);
          return;
        }
      }

      console.log('🔄 Fetching FRESH conversations for instance:', instanceId);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.log('❌ No session found, cannot fetch conversations');
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
        .limit(100);

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
        console.error('❌ Error fetching conversations:', error);
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
      
      console.log('✅ Fresh conversations fetched:', formattedConversations.length);
      
      // Actualizar cache solo si no es una actualización en tiempo real
      if (useCache) {
        setCachedConversations(formattedConversations, instanceId || "all");
      }
      
      setConversations(formattedConversations);
      lastFetchRef.current = instanceId;
      
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('❌ Error fetching conversations:', error);
        setConversations([]);
      }
    } finally {
      setLoading(false);
    }
  }, [getCachedConversations, setCachedConversations, invalidateConversationsCache]);

  const updateConversationAfterSend = useCallback(async (conversation: Conversation, message: string) => {
    try {
      const now = new Date().toISOString();
      
      // Actualizar estado local inmediatamente
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
        console.error('❌ Error updating conversation after send:', error);
        // Refrescar sin cache en caso de error
        fetchConversations(selectedInstanceId, false);
      }
    } catch (error) {
      console.error('❌ Error updating conversation after send:', error);
      fetchConversations(selectedInstanceId, false);
    }
  }, [updateConversationInCache, fetchConversations, selectedInstanceId]);

  // Efecto optimizado - fetch inicial
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

  // Función para refresh inmediato (sin cache) - usada por tiempo real
  const refreshConversations = useCallback(() => {
    console.log('🔄 REFRESH: Force refreshing conversations without cache');
    fetchConversations(selectedInstanceId, false);
  }, [fetchConversations, selectedInstanceId]);

  return {
    conversations,
    setConversations,
    loading,
    fetchConversations,
    updateConversationAfterSend,
    refreshConversations
  };
};
