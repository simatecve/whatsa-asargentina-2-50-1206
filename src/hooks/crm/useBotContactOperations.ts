
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useBotContactOperations = () => {
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

  const toggleBotStatus = async (
    numeroContacto: string, 
    instanciaNombre: string,
    isCurrentlyActive: boolean
  ) => {
    console.log('Toggling bot status for:', { numeroContacto, instanciaNombre });
    
    try {
      console.log('Current bot status:', { isCurrentlyActive });

      if (isCurrentlyActive) {
        // Está activo, lo desactivamos (insertamos registro)
        const success = await deactivateBotForContact(numeroContacto, instanciaNombre);
        if (success) {
          toast.success('Bot desactivado para este contacto');
        } else {
          toast.error('Error al desactivar el bot');
        }
        return success;
      } else {
        // Está desactivado, lo activamos (eliminamos registro)
        const success = await activateBotForContact(numeroContacto, instanciaNombre);
        if (success) {
          toast.success('Bot activado para este contacto');
        } else {
          toast.error('Error al activar el bot');
        }
        return success;
      }
    } catch (error) {
      console.error('Error toggling bot status:', error);
      toast.error('Error al cambiar el estado del bot');
      return false;
    }
  };

  return {
    deactivateBotForContact,
    activateBotForContact,
    toggleBotStatus
  };
};
