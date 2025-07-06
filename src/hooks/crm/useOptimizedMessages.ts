
import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message, Conversation } from "@/types/crm";
import { useOptimizedCache } from "./useOptimizedCache";

export const useOptimizedMessages = (setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const currentConversationRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    getCachedMessages,
    setCachedMessages,
    updateCachedMessages,
    prependCachedMessages,
    invalidateMessagesCache,
    MESSAGE_PAGE_SIZE
  } = useOptimizedCache();

  // Helper function to map database results to complete Message objects
  const mapToCompleteMessage = (dbMessage: any, conversation: Conversation): Message => ({
    id: dbMessage.id,
    instancia: conversation.instancia_nombre,
    numero: conversation.numero_contacto,
    pushname: dbMessage.pushname || conversation.nombre_contacto,
    mensaje: dbMessage.mensaje,
    tipo_mensaje: dbMessage.tipo_mensaje,
    estado_lectura: dbMessage.estado_lectura ?? false,
    mensaje_id: dbMessage.mensaje_id || null,
    archivo_url: dbMessage.archivo_url,
    archivo_nombre: dbMessage.archivo_nombre,
    archivo_tipo: dbMessage.archivo_tipo,
    adjunto: dbMessage.adjunto || null,
    direccion: dbMessage.direccion,
    respondido_a: dbMessage.respondido_a || null,
    created_at: dbMessage.created_at,
    conversation_id: dbMessage.conversation_id
  });

  // OPTIMIZACIÓN: Implementar cursor-based pagination
  const fetchMessages = useCallback(async (conversation: Conversation, cursor?: string, forceRefresh: boolean = false) => {
    console.log('🔄 Iniciando fetchMessages optimizado para conversación:', conversation.id);
    
    if (currentConversationRef.current === conversation.id && loading && !cursor) {
      console.log('⏳ Ya se están obteniendo mensajes para esta conversación');
      return;
    }

    if (!cursor) {
      currentConversationRef.current = conversation.id;
      
      if (forceRefresh) {
        console.log('🔄 FORCE REFRESH: Invalidando cache de mensajes');
        invalidateMessagesCache(conversation.id);
      } else {
        const cached = getCachedMessages(conversation.id);
        if (cached) {
          console.log(`📦 Usando mensajes cacheados: ${cached.data.length} mensajes`);
          setMessages(cached.data);
          setHasMoreMessages(cached.hasMore);
          setLoading(false);
          markAsRead(conversation);
          return;
        }
      }
    }

    setLoading(true);

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      console.log('🔄 Obteniendo mensajes optimizados para conversación:', conversation.id);
      
      // OPTIMIZACIÓN: Usar cursor-based pagination en lugar de offset
      let query = supabase
        .from('mensajes')
        .select(`
          id,
          mensaje,
          tipo_mensaje,
          direccion,
          created_at,
          conversation_id,
          archivo_url,
          archivo_nombre,
          archivo_tipo,
          pushname,
          estado_lectura,
          mensaje_id,
          adjunto,
          respondido_a
        `) // Solo campos necesarios
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: false })
        .limit(MESSAGE_PAGE_SIZE);

      // Implementar cursor-based pagination
      if (cursor) {
        query = query.lt('created_at', cursor);
      }

      const { data: dbMessages, error } = await query.abortSignal(signal);

      if (currentConversationRef.current !== conversation.id) {
        console.log('⚠️ La conversación cambió durante el fetch, ignorando resultados');
        return;
      }

      if (error) {
        console.error('❌ Error obteniendo mensajes de BD:', error);
        throw error;
      }

      // Map database results to complete Message objects
      const fetchedMessages = (dbMessages || [])
        .reverse()
        .map(dbMsg => mapToCompleteMessage(dbMsg, conversation));
      
      const hasMore = (dbMessages || []).length === MESSAGE_PAGE_SIZE;

      console.log(`✅ Obtenidos ${fetchedMessages.length} mensajes optimizados`);
      
      if (!cursor) {
        // Primera carga
        setMessages([...fetchedMessages]);
        setCachedMessages(
          conversation.id, 
          fetchedMessages, 
          hasMore, 
          fetchedMessages.length,
          fetchedMessages[0]?.created_at
        );
      } else {
        // Cargar más mensajes
        setMessages(prev => {
          const combined = [...fetchedMessages, ...prev];
          const unique = combined.filter((msg, index, self) => 
            index === self.findIndex(m => m.id === msg.id)
          );
          return unique;
        });
        
        prependCachedMessages(conversation.id, fetchedMessages);
      }

      setHasMoreMessages(hasMore);

      if (!cursor) {
        markAsRead(conversation);
      }

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('❌ Error obteniendo mensajes:', error);
        
        if (currentConversationRef.current === conversation.id && !cursor) {
          // Fallback optimizado - solo campos esenciales
          try {
            const { data: dbMessages } = await supabase
              .from('mensajes')
              .select(`
                id,
                mensaje,
                tipo_mensaje,
                direccion,
                created_at,
                conversation_id,
                pushname,
                estado_lectura,
                mensaje_id,
                adjunto,
                respondido_a,
                archivo_url,
                archivo_nombre,
                archivo_tipo
              `)
              .eq('instancia', conversation.instancia_nombre)
              .eq('numero', conversation.numero_contacto)
              .order('created_at', { ascending: true })
              .limit(MESSAGE_PAGE_SIZE);

            const fallbackMessages = (dbMessages || []).map(dbMsg => mapToCompleteMessage(dbMsg, conversation));
            console.log(`🔄 Fallback encontró ${fallbackMessages.length} mensajes`);
            setMessages([...fallbackMessages]);
            setCachedMessages(conversation.id, fallbackMessages, false);
          } catch (fallbackError) {
            console.error('❌ Fallback también falló:', fallbackError);
            setMessages([]);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }, [getCachedMessages, setCachedMessages, prependCachedMessages, invalidateMessagesCache, MESSAGE_PAGE_SIZE]);

  // OPTIMIZACIÓN: Cargar más mensajes con cursor
  const loadMoreMessages = useCallback(async (conversation: Conversation) => {
    if (!hasMoreMessages || loading) return;

    const oldestMessage = messages[0];
    if (oldestMessage) {
      await fetchMessages(conversation, oldestMessage.created_at, false);
    }
  }, [fetchMessages, hasMoreMessages, loading, messages]);

  const addMessageToChat = useCallback((conversation: Conversation, messageText: string) => {
    const newMessage: Message = {
      id: Date.now(),
      instancia: conversation.instancia_nombre,
      numero: conversation.numero_contacto,
      pushname: conversation.nombre_contacto,
      mensaje: messageText,
      tipo_mensaje: 'texto',
      estado_lectura: false,
      mensaje_id: null,
      archivo_url: null,
      archivo_nombre: null,
      archivo_tipo: null,
      adjunto: null,
      direccion: 'enviado',
      respondido_a: null,
      created_at: new Date().toISOString(),
      conversation_id: conversation.id
    };

    // OPTIMIZACIÓN: Usar función de actualización diferencial
    setMessages(prev => [...prev, newMessage]);
    updateCachedMessages(conversation.id, [newMessage]);
  }, [updateCachedMessages]);

  const markAsRead = useCallback(async (conversation: Conversation) => {
    try {
      // Actualización optimista inmediata
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversation.id
            ? { ...conv, mensajes_no_leidos: 0 }
            : conv
        )
      );

      // OPTIMIZACIÓN: Solo ejecutar si realmente hay mensajes no leídos
      if (conversation.mensajes_no_leidos > 0) {
        const { error } = await supabase.rpc('mark_conversation_as_read', {
          conversation_uuid: conversation.id
        });

        if (error) {
          console.error('Error marcando conversación como leída:', error);
        }
      }
    } catch (error) {
      console.error('Error marcando como leída:', error);
    }
  }, [setConversations]);

  const clearMessages = useCallback(() => {
    console.log('🧹 Limpiando mensajes');
    setMessages([]);
    setHasMoreMessages(false);
    currentConversationRef.current = null;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const refreshMessages = useCallback((conversation: Conversation) => {
    console.log('🔄 REFRESH OPTIMIZADO: Actualizando mensajes sin cache');
    fetchMessages(conversation, undefined, true);
  }, [fetchMessages]);

  return {
    messages,
    setMessages,
    fetchMessages,
    loadMoreMessages,
    addMessageToChat,
    markAsRead,
    clearMessages,
    refreshMessages,
    loading,
    hasMoreMessages
  };
};
