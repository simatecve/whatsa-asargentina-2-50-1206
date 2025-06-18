
import { useRef, useCallback } from 'react';
import { Conversation, Message } from '@/types/crm';

interface CacheData {
  conversations: {
    data: Conversation[];
    timestamp: number;
    instanceId: string;
  } | null;
  messages: Map<string, {
    data: Message[];
    timestamp: number;
    hasMore: boolean;
    totalCount: number;
  }>;
  conversationCounts: Map<string, number>;
}

const CACHE_EXPIRY = 30000; // 30 segundos
const MESSAGE_PAGE_SIZE = 50;

export const useOptimizedCache = () => {
  const cacheRef = useRef<CacheData>({
    conversations: null,
    messages: new Map(),
    conversationCounts: new Map()
  });

  const isCacheValid = useCallback((timestamp: number) => {
    return Date.now() - timestamp < CACHE_EXPIRY;
  }, []);

  const getCachedConversations = useCallback((instanceId: string) => {
    const cached = cacheRef.current.conversations;
    if (cached && cached.instanceId === instanceId && isCacheValid(cached.timestamp)) {
      return cached.data;
    }
    return null;
  }, [isCacheValid]);

  const setCachedConversations = useCallback((conversations: Conversation[], instanceId: string) => {
    cacheRef.current.conversations = {
      data: conversations,
      timestamp: Date.now(),
      instanceId
    };
  }, []);

  const getCachedMessages = useCallback((conversationId: string) => {
    const cached = cacheRef.current.messages.get(conversationId);
    if (cached && isCacheValid(cached.timestamp)) {
      return cached;
    }
    return null;
  }, [isCacheValid]);

  const setCachedMessages = useCallback((
    conversationId: string, 
    messages: Message[], 
    hasMore: boolean = false,
    totalCount?: number
  ) => {
    cacheRef.current.messages.set(conversationId, {
      data: messages,
      timestamp: Date.now(),
      hasMore,
      totalCount: totalCount || messages.length
    });
  }, []);

  const appendCachedMessages = useCallback((conversationId: string, newMessages: Message[]) => {
    const cached = cacheRef.current.messages.get(conversationId);
    if (cached) {
      const combinedMessages = [...cached.data, ...newMessages];
      // Eliminar duplicados basado en el ID
      const uniqueMessages = combinedMessages.filter((msg, index, self) => 
        index === self.findIndex(m => m.id === msg.id)
      );
      
      cacheRef.current.messages.set(conversationId, {
        ...cached,
        data: uniqueMessages,
        timestamp: Date.now()
      });
    }
  }, []);

  const prependCachedMessages = useCallback((conversationId: string, newMessages: Message[]) => {
    const cached = cacheRef.current.messages.get(conversationId);
    if (cached) {
      const combinedMessages = [...newMessages, ...cached.data];
      const uniqueMessages = combinedMessages.filter((msg, index, self) => 
        index === self.findIndex(m => m.id === msg.id)
      );
      
      cacheRef.current.messages.set(conversationId, {
        ...cached,
        data: uniqueMessages,
        timestamp: Date.now()
      });
    }
  }, []);

  const invalidateConversationsCache = useCallback(() => {
    cacheRef.current.conversations = null;
  }, []);

  const invalidateMessagesCache = useCallback((conversationId?: string) => {
    if (conversationId) {
      cacheRef.current.messages.delete(conversationId);
    } else {
      cacheRef.current.messages.clear();
    }
  }, []);

  const updateConversationInCache = useCallback((updatedConversation: Conversation) => {
    const cached = cacheRef.current.conversations;
    if (cached) {
      const updatedData = cached.data.map(conv => 
        conv.id === updatedConversation.id ? updatedConversation : conv
      );
      
      cacheRef.current.conversations = {
        ...cached,
        data: updatedData,
        timestamp: Date.now()
      };
    }
  }, []);

  const clearCache = useCallback(() => {
    cacheRef.current = {
      conversations: null,
      messages: new Map(),
      conversationCounts: new Map()
    };
  }, []);

  return {
    getCachedConversations,
    setCachedConversations,
    getCachedMessages,
    setCachedMessages,
    appendCachedMessages,
    prependCachedMessages,
    invalidateConversationsCache,
    invalidateMessagesCache,
    updateConversationInCache,
    clearCache,
    MESSAGE_PAGE_SIZE
  };
};
