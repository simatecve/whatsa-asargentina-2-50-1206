
import { useState } from "react";
import { BotContactStatus } from "@/types/botContactStatus";

export const useBotContactStatusCache = () => {
  const [contactStatuses, setContactStatuses] = useState<Map<string, BotContactStatus>>(new Map());

  const getContactKey = (numeroContacto: string, instanciaNombre: string) => {
    return `${numeroContacto}-${instanciaNombre}`;
  };

  const updateStatusInCache = (numeroContacto: string, instanciaNombre: string, status: BotContactStatus) => {
    const key = getContactKey(numeroContacto, instanciaNombre);
    setContactStatuses(prev => {
      const newMap = new Map(prev);
      newMap.set(key, status);
      return newMap;
    });
  };

  const getStatusFromCache = (numeroContacto: string, instanciaNombre: string) => {
    const key = getContactKey(numeroContacto, instanciaNombre);
    const status = contactStatuses.get(key);
    return status?.bot_activo ?? true; // Por defecto activo (no hay registro)
  };

  return {
    contactStatuses,
    setContactStatuses,
    getContactKey,
    updateStatusInCache,
    getStatusFromCache
  };
};
