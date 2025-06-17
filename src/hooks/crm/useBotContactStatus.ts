
import { useState } from "react";
import { useBotContactStatusCache } from "./useBotContactStatusCache";
import { useBotContactFetch } from "./useBotContactFetch";
import { useBotContactOperations } from "./useBotContactOperations";
import { BotContactStatus } from "@/types/botContactStatus";

export const useBotContactStatus = () => {
  const [loading, setLoading] = useState(false);
  
  const {
    contactStatuses,
    setContactStatuses,
    getContactKey,
    updateStatusInCache,
    getStatusFromCache
  } = useBotContactStatusCache();
  
  const { fetchContactStatus: fetchFromDB } = useBotContactFetch();
  const { deactivateBotForContact, toggleBotStatus: performToggle } = useBotContactOperations();

  const fetchContactStatus = async (numeroContacto: string, instanciaNombre: string) => {
    try {
      const data = await fetchFromDB(numeroContacto, instanciaNombre);
      
      const key = getContactKey(numeroContacto, instanciaNombre);
      
      // Nueva lógica: Si existe registro = bot desactivado, si no existe = bot activo
      const status: BotContactStatus = {
        id: data?.id || '',
        numero_contacto: numeroContacto,
        instancia_nombre: instanciaNombre,
        bot_activo: !data // true si NO existe registro, false si SÍ existe
      };

      console.log('Bot status fetched:', status);
      
      setContactStatuses(prev => {
        const newMap = new Map(prev);
        newMap.set(key, status);
        return newMap;
      });
      return data;
    } catch (error) {
      console.error('Error fetching contact bot status:', error);
      return null;
    }
  };

  const toggleBotStatus = async (numeroContacto: string, instanciaNombre: string) => {
    setLoading(true);
    try {
      const key = getContactKey(numeroContacto, instanciaNombre);
      const currentStatus = contactStatuses.get(key);
      const isCurrentlyActive = currentStatus?.bot_activo ?? true; // Por defecto activo

      const success = await performToggle(numeroContacto, instanciaNombre, isCurrentlyActive);
      
      if (success) {
        // Actualizar estado local
        updateStatusInCache(numeroContacto, instanciaNombre, {
          id: currentStatus?.id || '',
          numero_contacto: numeroContacto,
          instancia_nombre: instanciaNombre,
          bot_activo: !isCurrentlyActive // Cambiar el estado
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error toggling bot status:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getBotStatus = (numeroContacto: string, instanciaNombre: string) => {
    return getStatusFromCache(numeroContacto, instanciaNombre);
  };

  return {
    fetchContactStatus,
    toggleBotStatus,
    getBotStatus,
    deactivateBotForContact, // Exportar la función para uso externo
    loading
  };
};
