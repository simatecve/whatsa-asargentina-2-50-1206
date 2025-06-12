
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Edit, Trash2 } from "lucide-react";

type AgenteConfig = {
  id: string;
  nombre_agente: string;
  instance_name: string;
  prompt: string;
  is_active: boolean;
  created_at: string;
};

interface AgenteIACardProps {
  agente: AgenteConfig;
  onEdit: (config: AgenteConfig) => void;
  onToggleActive: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string, nombre: string) => void;
}

export const AgenteIACard = ({ agente, onEdit, onToggleActive, onDelete }: AgenteIACardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Bot className="mr-2 h-5 w-5 text-blue-600" />
            {agente.nombre_agente}
          </CardTitle>
          <Badge 
            className={`cursor-pointer hover:opacity-80 transition-opacity ${
              agente.is_active 
                ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200" 
                : "bg-red-100 text-red-800 border-red-300 hover:bg-red-200"
            }`}
            variant="outline"
            onClick={() => onToggleActive(agente.id, agente.is_active)}
          >
            {agente.is_active ? "Activo" : "Inactivo"}
          </Badge>
        </div>
        <CardDescription>
          Instancia: {agente.instance_name || 'No asignada'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {agente.prompt || 'Sin prompt configurado'}
        </p>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(agente)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onDelete(agente.id, agente.nombre_agente)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
