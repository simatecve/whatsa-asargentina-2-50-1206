
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

  const fetchMessages = useCallback(async (conversation: Conversation, page: number = 0, useCache: boolean = true) => {
    console.log('🔄 Starting fetchMessages for conversation:', conversation.id, 'page:', page, 'useCache:', useCache);
    
    // Prevenir múltiples fetches simultáneos para la misma conversación
    if (currentConversationRef.current === conversation.id && loading && page === 0) {
      console.log('⏳ Already fetching messages for this conversation');
      return;
    }

    // Si es página 0 (inicial), verificar cache solo si useCache es true
    if (page === 0) {
      currentConversationRef.current = conversation.id;
      
      // Para tiempo real, SIEMPRE invalidar cache primero
      if (!useCache) {
        console.log('🔄 REALTIME: Invalidating messages cache for fresh data');
        invalidateMessagesCache(conversation.id);
      }
      
      if (useCache) {
        const cached = getCachedMessages(conversation.id);
        if (cached) {
          console.log(`📦 Using cached messages: ${cached.data.length} messages`);
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

      console.log('🔄 Fetching FRESH messages for conversation:', conversation.id);
      
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
        console.log('⚠️ Conversation changed during fetch, ignoring results');
        return;
      }

      if (error) {
        console.error('❌ Error fetching messages from DB:', error);
        throw error;
      }

      const fetchedMessages = (dbMessages || []).reverse(); // Invertir para orden cronológico
      const totalCount = count || 0;
      const hasMore = offset + MESSAGE_PAGE_SIZE < totalCount;

      console.log(`✅ Fetched ${fetchedMessages.length} FRESH messages for conversation ${conversation.id}, page ${page}`);
      
      if (page === 0) {
        // Primera página - reemplazar completamente
        setMessages(fetchedMessages);
        // Solo cachear si useCache es true
        if (useCache) {
          setCachedMessages(conversation.id, fetchedMessages, hasMore, totalCount);
        }
      } else {
        // Páginas adicionales - prepender
        setMessages(prev => {
          const combined = [...fetchedMessages, ...prev];
          const unique = combined.filter((msg, index, self) => 
            index === self.findIndex(m => m.id === msg.id)
          );
          return unique;
        });
        
        if (useCache) {
          prependCachedMessages(conversation.id, fetchedMessages);
        }
      }

      setHasMoreMessages(hasMore);

      // Marcar como leído solo en la primera página
      if (page === 0) {
        markAsRead(conversation);
      }

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('❌ Error fetching messages:', error);
        
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
            console.log(`🔄 Fallback found ${fallbackMessages.length} messages`);
            setMessages(fallbackMessages);
            if (useCache) {
              setCachedMessages(conversation.id, fallbackMessages, false);
            }
          } catch (fallbackError) {
            console.error('❌ Fallback also failed:', fallbackError);
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
        console.error('Error marking conversation as read:', error);
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, [setConversations]);

  const clearMessages = useCallback(() => {
    console.log('🧹 Clearing messages');
    setMessages([]);
    setHasMoreMessages(false);
    currentConversationRef.current = null;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Función para refresh inmediato (sin cache) - usada por tiempo real
  const refreshMessages = useCallback((conversation: Conversation) => {
    console.log('🔄 REFRESH: Force refreshing messages without cache');
    fetchMessages(conversation, 0, false);
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
