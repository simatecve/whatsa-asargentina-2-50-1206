
import { useState } from "react";
import { createInstance } from "@/services/apiService";
import { useConnection } from "@/contexts/ConnectionContext";
import { usePlanLimitsValidation } from "@/hooks/usePlanLimitsValidation";
import NewInstanceForm from "@/components/instances/NewInstanceForm";
import { toast } from "sonner";

interface NewInstanceContainerProps {
  apiConfigExists: boolean;
  onInstanceCreated: () => void;
}

export const NewInstanceContainer = ({ 
  apiConfigExists, 
  onInstanceCreated 
}: NewInstanceContainerProps) => {
  const [instanceName, setInstanceName] = useState("");
  const [creating, setCreating] = useState(false);
  const { fetchInstances, currentQRCode, currentInstanceName, modalOpen, setModalOpen } = useConnection();
  const { validateAndBlock } = usePlanLimitsValidation();

  const handleCreateInstance = async () => {
    if (!instanceName.trim()) {
      toast.error("Por favor ingrese un nombre para la instancia");
      return;
    }

    // Validar límites del plan antes de crear
    if (!validateAndBlock('instancias')) {
      return; // El hook ya muestra el toast de error apropiado
    }

    setCreating(true);
    try {
      console.log("Creating instance:", instanceName);
      const result = await createInstance({
        instanceName: instanceName.trim(),
        qrcode: true
      });

      console.log("Instance creation result:", result);

      toast.success("Instancia creada exitosamente");
      setInstanceName("");
      await fetchInstances();
      onInstanceCreated();
    } catch (error) {
      console.error("Error creating instance:", error);
      
      // Verificar si el error es por límite del plan
      if (error instanceof Error && error.message.includes('Límite de instancias excedido')) {
        toast.error("Has alcanzado el límite de instancias de tu plan. Actualiza tu plan para crear más instancias.", {
          duration: 5000,
          action: {
            label: "Ver Planes",
            onClick: () => window.location.href = "/dashboard/planes"
          }
        });
      } else {
        toast.error(error instanceof Error ? error.message : "Error al crear la instancia");
      }
    } finally {
      setCreating(false);
    }
  };

  if (!apiConfigExists) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔧</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Configuración Requerida
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            La configuración de la API Evolution no está disponible. 
            Contacte al administrador del sistema para configurar la conexión.
          </p>
        </div>
      </div>
    );
  }

  return (
    <NewInstanceForm
      instanceName={instanceName}
      creating={creating}
      apiConfigExists={apiConfigExists}
      onInstanceNameChange={setInstanceName}
      onSubmit={handleCreateInstance}
      onConfigureAPI={() => {}} // No se usa ya que no hay pestaña de configuración
    />
  );
};
