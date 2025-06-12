
import { Button } from "@/components/ui/button";
import { Save, Loader2, ArrowLeft } from "lucide-react";

interface AgenteFormActionsProps {
  saving: boolean;
  editingConfig?: any;
  onBack: () => void;
}

export const AgenteFormActions = ({ saving, editingConfig, onBack }: AgenteFormActionsProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <h2 className="text-xl font-semibold">
          {editingConfig ? "Editar Agente IA" : "Crear Nuevo Agente IA"}
        </h2>
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            {editingConfig ? "Actualizar" : "Crear"} Agente
          </>
        )}
      </Button>
    </div>
  );
};
