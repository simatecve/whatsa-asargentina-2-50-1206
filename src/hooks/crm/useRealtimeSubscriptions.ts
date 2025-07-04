
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Conversation } from "@/types/crm";

interface UseRealtimeSubscriptionsProps {
  userData: any;
  selectedInstanceId?: string;
  selectedConversation: Conversation | null;
  fetchConversations: () => void;
  fetchMessages: (conversation: Conversation) => Promise<void>;
}

export const useRealtimeSubscriptions = ({
  userData,
  selectedInstanceId,
  selectedConversation,
  fetchConversations,
  fetchMessages
}: UseRealtimeSubscriptionsProps) => {
  const lastUpdateRef = useRef<number>(0);

  // Función para actualizar conversaciones INMEDIATAMENTE sin ningún delay
  const forceUpdateConversations = () => {
    const now = Date.now();
    // Evitar actualizaciones duplicadas en menos de 50ms
    if (now - lastUpdateRef.current < 50) {
      return;
    }
    lastUpdateRef.current = now;
    
    console.log('🔥 FORCE UPDATE: Actualizando conversaciones INMEDIATAMENTE');
    fetchConversations();
  };

  // Función para actualizar mensajes INMEDIATAMENTE
  const forceUpdateMessages = (conversation: Conversation) => {
    console.log('🔥 FORCE UPDATE: Actualizando mensajes INMEDIATAMENTE para:', conversation.id);
    fetchMessages(conversation);
  };

  useEffect(() => {
    if (!userData) return;

    console.log('🔴 REALTIME: Configurando suscripciones de tiempo real AGRESIVAS...');

    // Suscripción CRÍTICA para conversaciones - MÁXIMA PRIORIDAD
    const conversationsChannel = supabase
      .channel('conversations-realtime-force')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversaciones'
        },
        (payload) => {
          console.log('🚨 CONVERSACIÓN CAMBIÓ:', payload.eventType, payload);
          // Actualización INMEDIATA y FORZADA
          setTimeout(() => forceUpdateConversations(), 0);
        }
      )
      .subscribe();

    // Suscripción ULTRA-CRÍTICA para mensajes nuevos
    const messagesChannel = supabase
      .channel('messages-realtime-force')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes'
        },
        (payload) => {
          console.log('🚨 NUEVO MENSAJE DETECTADO:', payload);
          
          const newMessage = payload.new as any;
          
          // CRÍTICO: Actualizar conversaciones INMEDIATAMENTE (sin delay)
          console.log('⚡ ACTUALIZANDO CONVERSACIONES AHORA MISMO');
          setTimeout(() => forceUpdateConversations(), 0);
          
          // Si estamos viendo esta conversación, actualizar mensajes también
          if (selectedConversation && newMessage?.conversation_id === selectedConversation.id) {
            console.log('⚡ ACTUALIZANDO MENSAJES DE CONVERSACIÓN ACTUAL');
            setTimeout(() => forceUpdateMessages(selectedConversation), 10);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'mensajes'
        },
        (payload) => {
          console.log('🔄 Mensaje actualizado:', payload);
          
          const updatedMessage = payload.new as any;
          
          // Actualización inmediata para updates de mensajes
          if (selectedConversation && updatedMessage?.conversation_id === selectedConversation.id) {
            console.log('🔄 Actualizando mensajes por UPDATE');
            setTimeout(() => forceUpdateMessages(selectedConversation), 0);
          }
        }
      )
      .subscribe();

    // Suscripción para cambios en bot status
    const botStatusChannel = supabase
      .channel('bot-status-realtime-force')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'contactos_bots'
        },
        (payload) => {
          console.log('🤖 Bot status INSERT:', payload);
          
          const payloadNew = payload.new as any;
          const numeroContacto = payloadNew?.numero_contacto;
          const instanciaNombre = payloadNew?.instancia_nombre;
          
          if (numeroContacto && instanciaNombre) {
            window.dispatchEvent(new CustomEvent('bot-status-changed', { 
              detail: { 
                numero_contacto: numeroContacto,
                instancia_nombre: instanciaNombre,
                bot_activo: false
              } 
            }));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'contactos_bots'
        },
        (payload) => {
          console.log('🤖 Bot status DELETE:', payload);
          
          const payloadOld = payload.old as any;
          const numeroContacto = payloadOld?.numero_contacto;
          const instanciaNombre = payloadOld?.instancia_nombre;
          
          if (numeroContacto && instanciaNombre) {
            window.dispatchEvent(new CustomEvent('bot-status-changed', { 
              detail: { 
                numero_contacto: numeroContacto,
                instancia_nombre: instanciaNombre,
                bot_activo: true
              } 
            }));
          }
        }
      )
      .subscribe();

    console.log('✅ REALTIME: Suscripciones AGRESIVAS de tiempo real ACTIVAS');

    return () => {
      console.log('🔴 REALTIME: Limpiando suscripciones agresivas de tiempo real');
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(botStatusChannel);
    };
  }, [userData, selectedInstanceId, selectedConversation?.id, fetchConversations, fetchMessages]);
};
