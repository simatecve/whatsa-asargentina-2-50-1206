
import { useState, useMemo } from "react";
import { useSubscriptionValidation } from "./useSubscriptionValidation";

export const useConversationLimits = () => {
  const { limits, suscripcionActiva } = useSubscriptionValidation();
  const [allowedConversations, setAllowedConversations] = useState<string[]>([]);
  const [blockedConversations, setBlockedConversations] = useState<string[]>([]);

  const processConversations = (conversations: any[]) => {
    if (!limits) {
      // Si no hay límites cargados, permitir todas las conversaciones temporalmente
      setAllowedConversations(conversations.map(c => c.id));
      setBlockedConversations([]);
      return;
    }

    // Si hay suscripción activa, aplicar límites normalmente
    if (suscripcionActiva) {
      const maxConversations = limits.maxConversaciones;
      
      // Ordenar conversaciones por fecha del último mensaje (más recientes primero)
      const sortedConversations = [...conversations].sort((a, b) => {
        const dateA = new Date(a.ultimo_mensaje_fecha || 0).getTime();
        const dateB = new Date(b.ultimo_mensaje_fecha || 0).getTime();
        return dateB - dateA;
      });

      // Permitir hasta el límite del plan
      const allowed = sortedConversations.slice(0, maxConversations).map(c => c.id);
      const blocked = sortedConversations.slice(maxConversations).map(c => c.id);

      setAllowedConversations(allowed);
      setBlockedConversations(blocked);
    } else {
      // Si no hay suscripción activa, permitir un número limitado (ej: 3 conversaciones)
      const freeLimit = 3;
      const sortedConversations = [...conversations].sort((a, b) => {
        const dateA = new Date(a.ultimo_mensaje_fecha || 0).getTime();
        const dateB = new Date(b.ultimo_mensaje_fecha || 0).getTime();
        return dateB - dateA;
      });

      const allowed = sortedConversations.slice(0, freeLimit).map(c => c.id);
      const blocked = sortedConversations.slice(freeLimit).map(c => c.id);

      setAllowedConversations(allowed);
      setBlockedConversations(blocked);
    }
  };

  const isConversationAllowed = (conversationId: string): boolean => {
    return allowedConversations.includes(conversationId);
  };

  const isConversationBlocked = (conversationId: string): boolean => {
    return blockedConversations.includes(conversationId);
  };

  const getRemainingConversations = (): number => {
    if (!limits) return 0;
    const maxConversations = suscripcionActiva ? limits.maxConversaciones : 3;
    return Math.max(0, maxConversations - allowedConversations.length);
  };

  // Función memoizada para filtrar conversaciones
  const getFilteredConversations = useMemo(() => {
    return (conversations: any[]) => {
      if (!limits) return conversations; // Si no hay límites, mostrar todas temporalmente
      
      const maxConversations = suscripcionActiva ? limits.maxConversaciones : 3;
      
      // Ordenar conversaciones por fecha del último mensaje (más recientes primero)
      const sortedConversations = [...conversations].sort((a, b) => {
        const dateA = new Date(a.ultimo_mensaje_fecha || 0).getTime();
        const dateB = new Date(b.ultimo_mensaje_fecha || 0).getTime();
        return dateB - dateA;
      });

      // Devolver solo las conversaciones permitidas
      return sortedConversations.slice(0, maxConversations);
    };
  }, [limits, suscripcionActiva]);

  console.log('ConversationLimits Debug:', {
    limits,
    suscripcionActiva,
    allowedConversations: allowedConversations.length,
    blockedConversations: blockedConversations.length
  });

  return {
    allowedConversations,
    blockedConversations,
    processConversations,
    getFilteredConversations,
    isConversationAllowed,
    isConversationBlocked,
    getRemainingConversations,
    limits
  };
};
