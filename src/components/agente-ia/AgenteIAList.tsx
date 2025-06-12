
import { AgenteIACard } from "./AgenteIACard";
import { AgenteIAEmptyState } from "./AgenteIAEmptyState";
import { AgenteIALoadingSkeleton } from "./AgenteIALoadingSkeleton";
import { AgenteIAListHeader } from "./AgenteIAListHeader";
import { useAgentesData } from "@/hooks/useAgentesData";
import { useAgenteOperations } from "@/hooks/useAgenteOperations";

type AgenteConfig = {
  id: string;
  nombre_agente: string;
  instance_name: string;
  prompt: string;
  is_active: boolean;
  created_at: string;
};

interface AgenteIAListProps {
  onCreateNew: () => void;
  onEdit: (config: AgenteConfig) => void;
}

export const AgenteIAList = ({ onCreateNew, onEdit }: AgenteIAListProps) => {
  const { agentes, loading, fetchAgentes } = useAgentesData();
  const { handleToggleActive, handleDelete } = useAgenteOperations(fetchAgentes);

  if (loading) {
    return <AgenteIALoadingSkeleton />;
  }

  return (
    <div className="space-y-4">
      <AgenteIAListHeader onCreateNew={onCreateNew} />

      {agentes.length === 0 ? (
        <AgenteIAEmptyState onCreateNew={onCreateNew} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agentes.map((agente) => (
            <AgenteIACard
              key={agente.id}
              agente={agente}
              onEdit={onEdit}
              onToggleActive={handleToggleActive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
