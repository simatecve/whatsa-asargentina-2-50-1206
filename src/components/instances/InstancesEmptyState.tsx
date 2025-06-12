
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { WifiOff } from "lucide-react";

interface InstancesEmptyStateProps {
  onCreateNew: () => void;
}

const InstancesEmptyState = ({ onCreateNew }: InstancesEmptyStateProps) => {
  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <WifiOff className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium">No hay instancias</p>
        <p className="text-sm text-gray-500 mt-1">
          No se encontraron instancias activas. Cree una nueva instancia para comenzar.
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onCreateNew}>
          Crear Instancia
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InstancesEmptyState;
