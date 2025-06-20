
import { useNavigate } from "react-router-dom";
import { Lead } from "@/types/lead";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useLeadNavigation = () => {
  const navigate = useNavigate();

  const navigateToConversation = async (lead: Lead) => {
    if (!lead.numero || !lead.instancia) {
      console.warn('Lead missing required data for navigation:', lead);
      toast.error('Datos del lead incompletos para la navegación');
      return;
    }

    try {
      // Obtener el ID de la instancia basado en el nombre
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('No hay sesión activa');
        return;
      }

      const { data: instanceData, error } = await supabase
        .from('instancias')
        .select('id')
        .eq('nombre', lead.instancia)
        .eq('user_id', session.user.id)
        .single();

      if (error || !instanceData) {
        console.error('Error finding instance:', error);
        toast.error(`No se encontró la instancia "${lead.instancia}"`);
        return;
      }

      // Limpiar el número (remover @s.whatsapp.net si existe)
      const cleanNumber = lead.numero.replace(/@s\.whatsapp\.net$/, '');
      
      // Navegar al CRM con el ID de instancia directamente
      navigate(`/dashboard/crm?instanceId=${encodeURIComponent(instanceData.id)}&contact=${encodeURIComponent(cleanNumber)}`);
      
    } catch (error) {
      console.error('Error in navigation:', error);
      toast.error('Error al navegar a la conversación');
    }
  };

  return { navigateToConversation };
};
