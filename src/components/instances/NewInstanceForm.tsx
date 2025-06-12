
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, RefreshCw, Settings } from "lucide-react";

interface NewInstanceFormProps {
  instanceName: string;
  creating: boolean;
  apiConfigExists: boolean;
  onInstanceNameChange: (value: string) => void;
  onSubmit: () => void;
  onConfigureAPI: () => void;
}

const NewInstanceForm = ({
  instanceName,
  creating,
  apiConfigExists,
  onInstanceNameChange,
  onSubmit,
  onConfigureAPI
}: NewInstanceFormProps) => {
  if (!apiConfigExists) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">Configuración requerida</p>
          <p className="text-sm text-gray-500 mt-1">
            Primero debe configurar los datos de conexión a la API Evolution.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full"
            onClick={onConfigureAPI}
          >
            <Settings className="h-4 w-4 mr-2" />
            Ir a Configuración
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear Nueva Instancia</CardTitle>
        <CardDescription>
          Configure el nombre para su nueva instancia de WhatsApp.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="instance-name">Nombre de la Instancia</Label>
          <Input
            id="instance-name"
            placeholder="Mi Instancia"
            value={instanceName}
            onChange={(e) => onInstanceNameChange(e.target.value)}
          />
          <p className="text-xs text-gray-500">
            Un nombre único para identificar esta instancia
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onSubmit} 
          disabled={creating || !instanceName.trim()}
          className="w-full"
        >
          {creating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Creando...
            </>
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Crear Instancia
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NewInstanceForm;
