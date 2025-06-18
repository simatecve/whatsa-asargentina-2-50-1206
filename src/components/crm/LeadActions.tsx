
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, User, Loader2 } from "lucide-react";
import { Lead } from "@/types/lead";
import { KanbanColumn } from "@/types/kanban";
import { useKanbanColumns } from "@/hooks/useKanbanColumns";

interface LeadActionsProps {
  lead: Lead | null;
  onUpdateStatus: (leadId: number, newStatus: string) => Promise<boolean>;
  onCreateLead?: () => Promise<Lead | null>;
  loading?: boolean;
}

export const LeadActions = ({ 
  lead, 
  onUpdateStatus, 
  onCreateLead, 
  loading = false 
}: LeadActionsProps) => {
  const [updating, setUpdating] = useState(false);
  const [creating, setCreating] = useState(false);
  const { columns, loading: columnsLoading } = useKanbanColumns();

  const handleStatusChange = async (newStatus: string) => {
    if (!lead) return;
    
    setUpdating(true);
    try {
      await onUpdateStatus(lead.id, newStatus);
    } catch (error) {
      console.error('Error updating lead status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateLead = async () => {
    if (!onCreateLead) return;
    
    setCreating(true);
    try {
      await onCreateLead();
    } catch (error) {
      console.error('Error creating lead:', error);
    } finally {
      setCreating(false);
    }
  };

  if (!lead) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleCreateLead}
        disabled={creating || loading}
        className="h-8"
      >
        {creating ? (
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
        ) : (
          <User className="h-3 w-3 mr-1" />
        )}
        Crear Lead
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={updating || loading || columnsLoading}
          className="h-8"
        >
          {updating ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <>
              Cambiar Estatus
              <ChevronDown className="h-3 w-3 ml-1" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {columns.map((column) => (
          <DropdownMenuItem
            key={column.status_key}
            onClick={() => handleStatusChange(column.status_key)}
            disabled={column.status_key === lead.status}
            className={column.status_key === lead.status ? "opacity-50" : ""}
          >
            <div className={`w-3 h-3 rounded-full mr-2 ${column.color_class.split(' ')[0]}`} />
            {column.title}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
