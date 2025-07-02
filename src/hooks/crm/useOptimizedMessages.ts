
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
    console.log('🔍 fetchMessages called:', { 
      conversationId: conversation.id, 
      page, 
      useCache,
      currentMessages: messages.length 
    });
    
    // Cancelar petición anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Si es página 0, verificar cache primero
    if (page === 0) {
      currentConversationRef.current = conversation.id;
      
      if (useCache) {
        const cached = getCachedMessages(conversation.id);
        if (cached) {
          console.log('📦 Using cached messages:', cached.data.length);
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
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      console.log('🔄 Fetching messages from DB for conversation:', conversation.id);
      
      const offset = page * MESSAGE_PAGE_SIZE;
      
      const { data: dbMessages, error, count } = await supabase
        .from('mensajes')
        .select('*', { count: 'exact' })
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + MESSAGE_PAGE_SIZE - 1)
        .abortSignal(signal);

      if (currentConversationRef.current !== conversation.id) {
        console.log('⚠️ Conversation changed during fetch, ignoring results');
        return;
      }

      if (error) {
        console.error('❌ Error fetching messages from DB:', error);
        
        // Fallback: intentar buscar por instancia y número
        console.log('🔄 Trying fallback query...');
        const { data: fallbackMessages, error: fallbackError } = await supabase
          .from('mensajes')
          .select('*')
          .eq('instancia', conversation.instancia_nombre)
          .eq('numero', conversation.numero_contacto + '@s.whatsapp.net')
          .order('created_at', { ascending: true })
          .limit(MESSAGE_PAGE_SIZE);

        if (fallbackError) {
          console.error('❌ Fallback query also failed:', fallbackError);
          setMessages([]);
          setLoading(false);
          return;
        }

        const fallbackResult = fallbackMessages || [];
        console.log('✅ Fallback found messages:', fallbackResult.length);
        setMessages(fallbackResult);
        setCachedMessages(conversation.id, fallbackResult, false);
        setLoading(false);
        return;
      }

      const fetchedMessages = (dbMessages || []).reverse();
      const totalCount = count || 0;
      const hasMore = offset + MESSAGE_PAGE_SIZE < totalCount;

      console.log('✅ Messages fetched successfully:', {
        count: fetchedMessages.length,
        totalCount,
        hasMore,
        page
      });
      
      if (page === 0) {
        setMessages(fetchedMessages);
        setCachedMessages(conversation.id, fetchedMessages, hasMore, totalCount);
      } else {
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

      if (page === 0) {
        markAsRead(conversation);
      }

    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('❌ Error in fetchMessages:', error);
        setMessages([]);
      }
    } finally {
      setLoading(false);
    }
  }, [getCachedMessages, setCachedMessages, prependCachedMessages, MESSAGE_PAGE_SIZE, messages.length]);

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

    console.log('➕ Adding message to chat:', messageText);
    setMessages(prev => [...prev, newMessage]);
    appendCachedMessages(conversation.id, [newMessage]);
  }, [appendCachedMessages]);

  const markAsRead = useCallback(async (conversation: Conversation) => {
    try {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversation.id
            ? { ...conv, mensajes_no_leidos: 0 }
            : conv
        )
      );

      const { error } = await supabase.rpc('mark_conversation_as_read', {
        conversation_uuid: conversation.id
      });

      if (error) {
        console.error('❌ Error marking conversation as read:', error);
      }
    } catch (error) {
      console.error('❌ Error in markAsRead:', error);
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

  const refreshMessages = useCallback((conversation: Conversation) => {
    console.log('🔄 Refreshing messages for conversation:', conversation.id);
    invalidateMessagesCache(conversation.id);
    fetchMessages(conversation, 0, false);
  }, [invalidateMessagesCache, fetchMessages]);

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
