
import { Progress } from "@/components/ui/progress";
import { Campana } from "./types";
import { CampanaBadge } from "./CampanaBadge";
import { CampanaActions } from "./CampanaActions";
import { Smartphone } from "lucide-react";

interface CampanaRowProps {
  campana: Campana;
  onVerDetalles: (campana: Campana) => void;
  onSendCampana: (campana: Campana) => void;
  onDeleteCampana: (id: string) => void;
  isSending: boolean;
}

export const CampanaRow = ({
  campana,
  onVerDetalles,
  onSendCampana,
  onDeleteCampana,
  isSending,
}: CampanaRowProps) => {
  const progreso = campana.total_contactos
    ? Math.round((campana.enviados || 0) / campana.total_contactos * 100)
    : 0;
    
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {campana.nombre}
        </div>
        <div className="text-xs text-gray-500">
          Creada: {new Date(campana.created_at).toLocaleDateString()}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {campana.lista_nombre}
        </div>
        <div className="text-xs text-gray-500">
          {campana.total_contactos || 0} contactos
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 flex items-center gap-1">
          <Smartphone className="h-4 w-4" />
          {campana.instance_nombre || "Sin instancia"}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <CampanaBadge estado={campana.estado} />
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <Progress value={progreso} className="h-2 w-full" />
          <span className="text-xs font-medium">{progreso}%</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {campana.enviados || 0} de {campana.total_contactos || 0}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <CampanaActions 
          campana={campana}
          onVerDetalles={() => onVerDetalles(campana)}
          onSendCampana={() => onSendCampana(campana)}
          onDeleteCampana={() => onDeleteCampana(campana.id)}
          isSending={isSending}
        />
      </td>
    </tr>
  );
};
