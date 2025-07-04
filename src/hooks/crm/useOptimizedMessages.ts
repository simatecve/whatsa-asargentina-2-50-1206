
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
    appendCachedMessages,
    prependCachedMessages,
    invalidateMessagesCache,
    MESSAGE_PAGE_SIZE
  } = useOptimizedCache();

  const fetchMessages = useCallback(async (conversation: Conversation, page: number = 0, forceRefresh: boolean = false) => {
    console.log('🔄 Iniciando fetchMessages para conversación:', conversation.id, 'página:', page, 'forceRefresh:', forceRefresh);
    
    // Prevenir múltiples fetches simultáneos para la misma conversación
    if (currentConversationRef.current === conversation.id && loading && page === 0) {
      console.log('⏳ Ya se están obteniendo mensajes para esta conversación');
      return;
    }

    // Si es página 0 (inicial), verificar cache solo si NO es refresh forzado
    if (page === 0) {
      currentConversationRef.current = conversation.id;
      
      // Para actualizaciones de tiempo real, SIEMPRE invalidar cache primero
      if (forceRefresh) {
        console.log('🔄 FORCE REFRESH: Invalidando cache de mensajes para datos frescos');
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
      // Cancelar petición anterior
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      console.log('🔄 Obteniendo mensajes FRESCOS para conversación:', conversation.id);
      
      const offset = page * MESSAGE_PAGE_SIZE;
      
      const { data: dbMessages, error, count } = await supabase
        .from('mensajes')
        .select('*', { count: 'exact' })
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + MESSAGE_PAGE_SIZE - 1)
        .abortSignal(signal);

      // Verificar si todavía es la conversación actual
      if (currentConversationRef.current !== conversation.id) {
        console.log('⚠️ La conversación cambió durante el fetch, ignorando resultados');
        return;
      }

      if (error) {
        console.error('❌ Error obteniendo mensajes de BD:', error);
        throw error;
      }

      const fetchedMessages = (dbMessages || []).reverse(); // Invertir para orden cronológico
      const totalCount = count || 0;
      const hasMore = offset + MESSAGE_PAGE_SIZE < totalCount;

      console.log(`✅ Obtenidos ${fetchedMessages.length} mensajes FRESCOS para conversación ${conversation.id}, página ${page}`);
      
      if (page === 0) {
        // Primera página - reemplazar completamente y FORZAR actualización
        setMessages(fetchedMessages);
        // SIEMPRE cachear después de obtener datos frescos
        setCachedMessages(conversation.id, fetchedMessages, hasMore, totalCount);
      } else {
        // Páginas adicionales - prepender
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

      // Marcar como leído solo en la primera página
      if (page === 0) {
        markAsRead(conversation);
      }

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('❌ Error obteniendo mensajes:', error);
        
        // Solo intentar fallback si es la conversación actual
        if (currentConversationRef.current === conversation.id && page === 0) {
          try {
            const { data: dbMessages } = await supabase
              .from('mensajes')
              .select('*')
              .eq('instancia', conversation.instancia_nombre)
              .eq('numero', conversation.numero_contacto)
              .order('created_at', { ascending: true })
              .limit(MESSAGE_PAGE_SIZE);

            const fallbackMessages = dbMessages || [];
            console.log(`🔄 Fallback encontró ${fallbackMessages.length} mensajes`);
            setMessages(fallbackMessages);
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

  const loadMoreMessages = useCallback(async (conversation: Conversation) => {
    if (!hasMoreMessages || loading) return;

    const currentPage = Math.ceil(messages.length / MESSAGE_PAGE_SIZE);
    await fetchMessages(conversation, currentPage, false);
  }, [fetchMessages, hasMoreMessages, loading, messages.length, MESSAGE_PAGE_SIZE]);

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

    // FORZAR actualización inmediata del estado
    setMessages(prev => [...prev, newMessage]);
    appendCachedMessages(conversation.id, [newMessage]);
  }, [appendCachedMessages]);

  const markAsRead = useCallback(async (conversation: Conversation) => {
    try {
      // Actualizar estado local inmediatamente
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversation.id
            ? { ...conv, mensajes_no_leidos: 0 }
            : conv
        )
      );

      // Actualizar en base de datos
      const { error } = await supabase.rpc('mark_conversation_as_read', {
        conversation_uuid: conversation.id
      });

      if (error) {
        console.error('Error marcando conversación como leída:', error);
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

  // Función para refresh FORZADO (usado por tiempo real)
  const refreshMessages = useCallback((conversation: Conversation) => {
    console.log('🔄 REFRESH FORZADO: Actualizando mensajes sin cache');
    fetchMessages(conversation, 0, true);
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
