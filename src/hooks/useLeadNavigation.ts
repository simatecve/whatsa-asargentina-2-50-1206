
import { useNavigate } from "react-router-dom";
import { Lead } from "@/types/lead";

export const useLeadNavigation = () => {
  const navigate = useNavigate();

  const navigateToConversation = (lead: Lead) => {
    if (!lead.numero || !lead.instancia) {
      console.warn('Lead missing required data for navigation:', lead);
      return;
    }

    // Limpiar el número (remover @s.whatsapp.net si existe)
    const cleanNumber = lead.numero.replace(/@s\.whatsapp\.net$/, '');
    
    // Navegar al CRM con parámetros de consulta
    navigate(`/dashboard/crm?instance=${encodeURIComponent(lead.instancia)}&contact=${encodeURIComponent(cleanNumber)}`);
  };

  return { navigateToConversation };
};
