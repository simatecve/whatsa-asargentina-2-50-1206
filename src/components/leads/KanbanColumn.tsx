
import { Lead } from "@/types/lead";
import LeadCard from "./LeadCard";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface KanbanColumnProps {
  status: string; // Cambio de LeadStatus a string
  title: string;
  leads: Lead[];
  colorClass: string;
  onDragStart: (lead: Lead) => void;
  onDrop: () => void;
  onCreateContactList?: (status: string, leads: Lead[]) => void; // Cambio de LeadStatus a string
  onLeadClick?: (lead: Lead) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  title,
  leads,
  colorClass,
  onDragStart,
  onDrop,
  onCreateContactList,
  onLeadClick
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop();
  };

  const handleCreateContactList = () => {
    if (onCreateContactList && leads.length > 0) {
      onCreateContactList(status, leads);
    }
  };

  return (
    <div
      className="flex flex-col w-72 flex-shrink-0 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className={`p-3 font-medium rounded-t-lg ${colorClass}`}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">{title}</h3>
          {leads.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleCreateContactList}
              className="h-6 px-2 text-xs bg-white/90 hover:bg-white border-white/50"
              title={`Crear lista de contactos con leads ${title.toLowerCase()}`}
            >
              <Users className="h-3 w-3 mr-1" />
              Lista
            </Button>
          )}
        </div>
        <div className="text-sm">{leads.length} leads</div>
      </div>
      
      <div className="flex-1 min-h-[200px] p-2 overflow-y-auto">
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onDragStart={() => onDragStart(lead)}
            onLeadClick={onLeadClick}
          />
        ))}
        {leads.length === 0 && (
          <div className="flex items-center justify-center h-20 text-gray-500 dark:text-gray-400 text-sm border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            No hay leads en esta etapa
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
