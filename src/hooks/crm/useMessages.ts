
import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message, Conversation } from "@/types/crm";

export const useMessages = (setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const currentConversationRef = useRef<string | null>(null);

  const fetchMessages = useCallback(async (conversation: Conversation) => {
    console.log('Starting fetchMessages for conversation:', conversation.id);
    
    // Prevent multiple simultaneous fetches for the same conversation
    if (currentConversationRef.current === conversation.id && loading) {
      console.log('Already fetching messages for this conversation');
      return;
    }

    // Update current conversation reference immediately
    currentConversationRef.current = conversation.id;
    setLoading(true);
    
    try {
      console.log('Fetching messages for conversation:', conversation.id);
      
      const { data: dbMessages, error } = await supabase
        .from('mensajes')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      // Check if this is still the current conversation
      if (currentConversationRef.current !== conversation.id) {
        console.log('Conversation changed during fetch, ignoring results');
        return;
      }

      if (error) {
        console.error('Error fetching messages from DB:', error);
        throw error;
      }

      const messages = dbMessages || [];
      console.log(`Found ${messages.length} messages for conversation ${conversation.id}`);
      setMessages(messages);

      // Marcar como leído
      markAsRead(conversation);
    } catch (error) {
      console.error('Error fetching messages:', error);
      
      // Only try fallback if this is still the current conversation
      if (currentConversationRef.current === conversation.id) {
        try {
          // Fallback: búsqueda por instancia y número
          const { data: dbMessages } = await supabase
            .from('mensajes')
            .select('*')
            .eq('instancia', conversation.instancia_nombre)
            .eq('numero', conversation.numero_contacto)
            .order('created_at', { ascending: true });

          const fallbackMessages = dbMessages || [];
          console.log(`Fallback found ${fallbackMessages.length} messages`);
          setMessages(fallbackMessages);
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          setMessages([]);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

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
  }, []);

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
    console.log('Clearing messages');
    setMessages([]);
    currentConversationRef.current = null;
  }, []);

  return {
    messages,
    setMessages,
    fetchMessages,
    addMessageToChat,
    markAsRead,
    clearMessages,
    loading
  };
};
