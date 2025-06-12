
import { Button } from "@/components/ui/button";
import { ListChecks, Plus } from "lucide-react";

interface CampanasEmptyStateProps {
  estado: string;
  onCreateNew: () => void;
}

export const CampanasEmptyState = ({ estado, onCreateNew }: CampanasEmptyStateProps) => {
  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case "todas":
        return "";
      case "pendiente":
        return "pendientes";
      case "enviada":
        return "enviadas";
      case "borrador":
        return "en borrador";
      case "completada":
        return "completadas";
      default:
        return estado;
    }
  };

  const estadoTexto = getEstadoTexto(estado);

  return (
    <div className="text-center py-8">
      <ListChecks className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">
        No hay campañas {estadoTexto}
      </h3>
      <p className="mt-2 text-sm text-gray-500">
        {estado === "todas" 
          ? "No tienes campañas creadas aún. Crea tu primera campaña para empezar."
          : `No se encontraron campañas ${estadoTexto}. Crea una nueva para empezar.`
        }
      </p>
      <Button 
        onClick={onCreateNew}
        className="mt-4 bg-green-500 hover:bg-green-600"
      >
        <Plus className="mr-2 h-4 w-4" />
        Crear Nueva Campaña
      </Button>
    </div>
  );
};
