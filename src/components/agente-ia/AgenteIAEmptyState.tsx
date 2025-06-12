
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Plus } from "lucide-react";

interface AgenteIAEmptyStateProps {
  onCreateNew: () => void;
}

export const AgenteIAEmptyState = ({ onCreateNew }: AgenteIAEmptyStateProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <Bot className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay agentes configurados</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comience creando su primer agente IA para una instancia de WhatsApp.
          </p>
          <div className="mt-6">
            <Button onClick={onCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              Crear primer agente
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
