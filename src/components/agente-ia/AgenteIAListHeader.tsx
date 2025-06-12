
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AgenteIAListHeaderProps {
  onCreateNew: () => void;
}

export const AgenteIAListHeader = ({ onCreateNew }: AgenteIAListHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">Mis Agentes IA</h2>
      <Button onClick={onCreateNew}>
        <Plus className="mr-2 h-4 w-4" />
        Nuevo Agente
      </Button>
    </div>
  );
};
