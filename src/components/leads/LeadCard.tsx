
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Lead } from "@/types/lead";
import { MessageSquare } from "lucide-react";

interface LeadCardProps {
  lead: Lead;
  onDragStart: () => void;
  onLeadClick?: (lead: Lead) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onDragStart, onLeadClick }) => {
  const formattedTime = lead.created_at 
    ? formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: es })
    : "";
    
  // Clean up the phone number by removing the WhatsApp suffix
  const formattedNumber = lead.numero 
    ? lead.numero.replace(/@s\.whatsapp\.net$/, '')
    : "Sin número";

  const handleClick = (e: React.MouseEvent) => {
    // Solo hacer click si no estamos arrastrando
    if (e.defaultPrevented) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    if (onLeadClick) {
      onLeadClick(lead);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Permitir que el drag and drop tenga prioridad
    if (e.button === 0) { // Solo botón izquierdo
      e.stopPropagation();
    }
  };

  return (
    <div 
      className="bg-white dark:bg-gray-900 p-3 mb-2 rounded border border-gray-200 dark:border-gray-700 shadow-sm cursor-move hover:shadow-md transition-shadow group relative"
      draggable
      onDragStart={onDragStart}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-start justify-between">
        <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200">{lead.pushname || "Sin nombre"}</h4>
        <div className="text-xs text-gray-500 dark:text-gray-400 font-bold">{formattedNumber}</div>
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        <p>Instancia: {lead.instancia || "Desconocida"}</p>
        <p>{formattedTime}</p>
      </div>

      {/* Botón para ir al CRM - ahora siempre visible y más grande */}
      {onLeadClick && (
        <button
          onClick={handleClick}
          className="absolute bottom-2 right-2 bg-green-500 hover:bg-green-600 text-white rounded-full p-2 transition-colors shadow-sm"
          title="Ir a conversación en CRM"
        >
          <MessageSquare className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default LeadCard;
