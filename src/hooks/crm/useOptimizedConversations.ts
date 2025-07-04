
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

  const fetchConversations = useCallback(async (instanceId?: string, forceRefresh: boolean = false) => {
    try {
      // Cancelar petición anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Para actualizaciones de tiempo real, SIEMPRE invalidar cache y forzar refresh
      if (forceRefresh) {
        console.log('🔄 FORCE REFRESH: Invalidando cache y obteniendo datos frescos');
        invalidateConversationsCache();
      } else {
        // Solo usar cache en carga inicial
        const cached = getCachedConversations(instanceId || "all");
        if (cached) {
          console.log('📦 Usando conversaciones cacheadas:', cached.length);
          setConversations(cached);
          setLoading(false);
          return;
        }
      }

      console.log('🔄 Obteniendo conversaciones FRESCAS para instancia:', instanceId);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.log('❌ No hay sesión, no se pueden obtener conversaciones');
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
        console.error('❌ Error obteniendo conversaciones:', error);
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
      
      console.log('✅ Conversaciones frescas obtenidas:', formattedConversations.length);
      
      // SIEMPRE actualizar el cache después de obtener datos frescos
      setCachedConversations(formattedConversations, instanceId || "all");
      
      // FORZAR actualización del estado
      setConversations(formattedConversations);
      lastFetchRef.current = instanceId;
      
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('❌ Error obteniendo conversaciones:', error);
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
        console.error('❌ Error actualizando conversación después de envío:', error);
        // Forzar refresh en caso de error
        fetchConversations(selectedInstanceId, true);
      }
    } catch (error) {
      console.error('❌ Error actualizando conversación después de envío:', error);
      fetchConversations(selectedInstanceId, true);
    }
  }, [updateConversationInCache, fetchConversations, selectedInstanceId]);

  // Efecto optimizado - fetch inicial
  useEffect(() => {
    if (userData && lastFetchRef.current !== selectedInstanceId) {
      setLoading(true);
      fetchConversations(selectedInstanceId, false);
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

  // Función para refresh FORZADO (usado por tiempo real)
  const refreshConversations = useCallback(() => {
    console.log('🔄 REFRESH FORZADO: Actualizando conversaciones sin cache');
    fetchConversations(selectedInstanceId, true);
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
