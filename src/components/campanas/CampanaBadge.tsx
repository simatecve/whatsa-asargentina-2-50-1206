
import { Badge } from "@/components/ui/badge";

interface CampanaBadgeProps {
  estado: string;
}

export const CampanaBadge = ({ estado }: CampanaBadgeProps) => {
  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "en_progreso":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "completada":
      case "enviada":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "borrador":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      case "pausada":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      case "cancelada":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "Pendiente";
      case "en_progreso":
        return "En progreso";
      case "completada":
        return "Completada";
      case "enviada":
        return "Enviada";
      case "borrador":
        return "Borrador";
      case "pausada":
        return "Pausada";
      case "cancelada":
        return "Cancelada";
      default:
        return estado.charAt(0).toUpperCase() + estado.slice(1);
    }
  };

  return (
    <Badge className={getEstadoBadgeColor(estado)}>
      {getEstadoTexto(estado)}
    </Badge>
  );
};
