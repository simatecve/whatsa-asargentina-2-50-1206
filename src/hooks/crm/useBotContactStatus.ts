
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BotContactStatus {
  id: string;
  numero_contacto: string;
  instancia_nombre: string;
  bot_activo: boolean; // Calculado: false si existe registro, true si no existe
}

export const useBotContactStatus = () => {
  const [contactStatuses, setContactStatuses] = useState<Map<string, BotContactStatus>>(new Map());
  const [loading, setLoading] = useState(false);

  const getContactKey = (numeroContacto: string, instanciaNombre: string) => {
    return `${numeroContacto}-${instanciaNombre}`;
  };

  const fetchContactStatus = async (numeroContacto: string, instanciaNombre: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      console.log('Fetching bot status for:', { numeroContacto, instanciaNombre });

      const { data, error } = await supabase
        .from('contactos_bots')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('numero_contacto', numeroContacto)
        .eq('instancia_nombre', instanciaNombre)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching contact bot status:', error);
        throw error;
      }

      const key = getContactKey(numeroContacto, instanciaNombre);
      
      // Nueva lógica: Si existe registro = bot desactivado, si no existe = bot activo
      const status: BotContactStatus = {
        id: data?.id || '',
        numero_contacto: numeroContacto,
        instancia_nombre: instanciaNombre,
        bot_activo: !data // true si NO existe registro, false si SÍ existe
      };

      console.log('Bot status fetched:', status);
      
      setContactStatuses(prev => new Map(prev.set(key, status)));
      return data;
    } catch (error) {
      console.error('Error fetching contact bot status:', error);
      return null;
    }
  };

  // Función para desactivar el bot - INSERTAR registro
  const deactivateBotForContact = async (numeroContacto: string, instanciaNombre: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      console.log('Deactivating bot for contact:', { numeroContacto, instanciaNombre });

      // Desactivar bot = INSERTAR registro en la tabla
      const { data, error } = await supabase
        .from('contactos_bots')
        .insert({
          user_id: session.user.id,
          numero_contacto: numeroContacto,
          instancia_nombre: instanciaNombre
        })
        .select()
        .single();

      if (error) {
        // Si ya existe, no es un error crítico
        if (error.code === '23505') { // duplicate key violation
          console.log('Bot already deactivated for contact:', numeroContacto);
          return true;
        } else {
          throw error;
        }
      }

      // Actualizar estado local
      const key = getContactKey(numeroContacto, instanciaNombre);
      setContactStatuses(prev => new Map(prev.set(key, {
        id: data?.id || '',
        numero_contacto: numeroContacto,
        instancia_nombre: instanciaNombre,
        bot_activo: false // Bot desactivado
      })));

      console.log('Bot deactivated for contact:', numeroContacto);
      
      // Disparar evento personalizado
      window.dispatchEvent(new CustomEvent('bot-status-changed', {
        detail: { numero_contacto: numeroContacto, instancia_nombre: instanciaNombre }
      }));
      
      return true;
    } catch (error) {
      console.error('Error deactivating bot:', error);
      return false;
    }
  };

  // Función para activar el bot - ELIMINAR registro
  const activateBotForContact = async (numeroContacto: string, instanciaNombre: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      console.log('Activating bot for contact:', { numeroContacto, instanciaNombre });

      // Activar bot = ELIMINAR registro de la tabla
      const { error } = await supabase
        .from('contactos_bots')
        .delete()
        .eq('user_id', session.user.id)
        .eq('numero_contacto', numeroContacto)
        .eq('instancia_nombre', instanciaNombre);

      if (error) throw error;

      // Actualizar estado local
      const key = getContactKey(numeroContacto, instanciaNombre);
      setContactStatuses(prev => new Map(prev.set(key, {
        id: '',
        numero_contacto: numeroContacto,
        instancia_nombre: instanciaNombre,
        bot_activo: true // Bot activado
      })));

      console.log('Bot activated for contact:', numeroContacto);
      
      // Disparar evento personalizado
      window.dispatchEvent(new CustomEvent('bot-status-changed', {
        detail: { numero_contacto: numeroContacto, instancia_nombre: instanciaNombre }
      }));
      
      return true;
    } catch (error) {
      console.error('Error activating bot:', error);
      return false;
    }
  };

  const toggleBotStatus = async (numeroContacto: string, instanciaNombre: string) => {
    console.log('Toggling bot status for:', { numeroContacto, instanciaNombre });
    
    setLoading(true);
    try {
      const key = getContactKey(numeroContacto, instanciaNombre);
      const currentStatus = contactStatuses.get(key);
      const isCurrentlyActive = currentStatus?.bot_activo ?? true; // Por defecto activo

      console.log('Current bot status:', { isCurrentlyActive, currentStatus });

      if (isCurrentlyActive) {
        // Está activo, lo desactivamos (insertamos registro)
        const success = await deactivateBotForContact(numeroContacto, instanciaNombre);
        if (success) {
          toast.success('Bot desactivado para este contacto');
        } else {
          toast.error('Error al desactivar el bot');
        }
      } else {
        // Está desactivado, lo activamos (eliminamos registro)
        const success = await activateBotForContact(numeroContacto, instanciaNombre);
        if (success) {
          toast.success('Bot activado para este contacto');
        } else {
          toast.error('Error al activar el bot');
        }
      }
    } catch (error) {
      console.error('Error toggling bot status:', error);
      toast.error('Error al cambiar el estado del bot');
    } finally {
      setLoading(false);
    }
  };

  const getBotStatus = (numeroContacto: string, instanciaNombre: string) => {
    const key = getContactKey(numeroContacto, instanciaNombre);
    const status = contactStatuses.get(key);
    return status?.bot_activo ?? true; // Por defecto activo (no hay registro)
  };

  return {
    fetchContactStatus,
    toggleBotStatus,
    getBotStatus,
    deactivateBotForContact, // Exportar la función para uso externo
    loading
  };
};
