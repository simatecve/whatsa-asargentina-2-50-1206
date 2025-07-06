
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
  const channelRef = useRef<any>(null);

  console.log('🔄 REALTIME OPTIMIZADO iniciado:', { 
    hasUserData: !!userData, 
    selectedInstanceId, 
    selectedConversationId: selectedConversation?.id 
  });

  useEffect(() => {
    // Limpiar canal anterior
    if (channelRef.current) {
      console.log('🧹 Limpiando canal anterior');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (!userData) {
      console.log('🔴 REALTIME: No userData, omitiendo suscripción');
      return;
    }

    console.log('🔴 REALTIME OPTIMIZADO: Configurando suscripciones...');

    // OPTIMIZACIÓN: Canal único consolidado
    const channelName = `optimized_realtime_${Date.now()}`;
    const channel = supabase.channel(channelName);

    // OPTIMIZACIÓN: Filtrar eventos específicos para reducir payload
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'conversaciones'
      },
      (payload) => {
        console.log('🚨 NUEVA CONVERSACIÓN:', payload.eventType);
        // Debounced update para evitar múltiples llamadas
        setTimeout(() => fetchConversations(), 100);
      }
    );

    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversaciones'
      },
      (payload) => {
        console.log('🚨 CONVERSACIÓN ACTUALIZADA:', payload.eventType);
        // Solo actualizar si hay cambios relevantes
        if (payload.new && payload.old) {
          const hasRelevantChanges = 
            payload.new.ultimo_mensaje !== payload.old.ultimo_mensaje ||
            payload.new.mensajes_no_leidos !== payload.old.mensajes_no_leidos;
          
          if (hasRelevantChanges) {
            setTimeout(() => fetchConversations(), 100);
          }
        }
      }
    );

    // OPTIMIZACIÓN: Solo escuchar inserts de mensajes (más eficiente)
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'mensajes'
      },
      (payload) => {
        console.log('🚨 NUEVO MENSAJE:', payload.eventType);
        
        // Update conversaciones (debounced)
        setTimeout(() => fetchConversations(), 100);
        
        // Update mensajes solo si pertenece a conversación actual
        if (selectedConversation && payload.new) {
          const messageData = payload.new as any;
          
          if (messageData.conversation_id === selectedConversation.id) {
            console.log('⚡ Mensaje para conversación actual, actualizando');
            setTimeout(() => fetchMessages(selectedConversation), 150);
          }
        }
      }
    );

    // OPTIMIZACIÓN: Suscripción más eficiente
    channel.subscribe((status) => {
      console.log('🔗 Canal realtime optimizado:', status);
      if (status === 'SUBSCRIBED') {
        console.log('✅ Canal realtime OPTIMIZADO activo');
        channelRef.current = channel;
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Error en canal realtime');
      } else if (status === 'TIMED_OUT') {
        console.error('⏰ Canal realtime timeout');
      }
    });

    console.log('✅ REALTIME OPTIMIZADO: Suscripciones configuradas');

    return () => {
      console.log('🔴 REALTIME OPTIMIZADO: Limpiando suscripciones');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userData, selectedConversation?.id, fetchConversations, fetchMessages]);
};
