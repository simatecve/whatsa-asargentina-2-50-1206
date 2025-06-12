
import { Badge } from "@/components/ui/badge";
import { Lead, DEFAULT_LEAD_STATUS_CONFIG } from "@/types/lead";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeadStatusBadgeProps {
  lead: Lead | null;
  loading?: boolean;
  onCreateLead?: () => void;
  compact?: boolean;
}

export const LeadStatusBadge = ({ 
  lead, 
  loading = false, 
  onCreateLead,
  compact = false 
}: LeadStatusBadgeProps) => {
  if (loading) {
    return (
      <div className="flex items-center gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        {!compact && <span className="text-xs text-muted-foreground">Cargando lead...</span>}
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex items-center gap-1">
        {onCreateLead ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateLead}
            className="h-6 px-2 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Crear Lead
          </Button>
        ) : (
          <Badge variant="secondary" className="text-xs">
            Sin Lead
          </Badge>
        )}
      </div>
    );
  }

  // Use default config as fallback for any status
  const statusConfig = DEFAULT_LEAD_STATUS_CONFIG[lead.status as keyof typeof DEFAULT_LEAD_STATUS_CONFIG] || {
    title: lead.status.charAt(0).toUpperCase() + lead.status.slice(1),
    color: 'bg-gray-100 border-gray-400 text-gray-800'
  };

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="outline" 
        className={`text-xs ${statusConfig.color} border-current`}
      >
        {statusConfig.title}
      </Badge>
      {!compact && (
        <span className="text-xs text-muted-foreground">
          Lead #{lead.id}
        </span>
      )}
    </div>
  );
};
