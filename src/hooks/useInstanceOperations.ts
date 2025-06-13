
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { 
  fetchUserInstances, 
  checkConnectionState,
  connectInstance,
  updateInstanceConnectionStatus,
  connectToCRM,
  deleteInstance
} from "@/services/apiService";
import { Instance, UserData } from "@/contexts/types";

export const useInstanceOperations = (
  setInstances: React.Dispatch<React.SetStateAction<Instance[]>>,
  userData: UserData | null,
  setCurrentQRCode: React.Dispatch<React.SetStateAction<string | null>>,
  setCurrentInstanceName: React.Dispatch<React.SetStateAction<string>>,
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const [loading, setLoading] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState<Record<string, boolean>>({});
  const [connecting, setConnecting] = useState<Record<string, boolean>>({});
  const [connectingToCRM, setConnectingToCRM] = useState<Record<string, boolean>>({});

  const fetchInstances = async () => {
    // Don't fetch if no user data
    if (!userData) {
      setInstances([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchUserInstances();
      setInstances(data);
      
      // Check connection status for each instance
      data.forEach(instance => {
        checkInstanceStatus(instance.nombre);
      });
    } catch (error) {
      console.error("Error fetching instances:", error);
      toast({
        title: "Error al cargar instancias",
        description: "No se pudieron obtener las instancias existentes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkInstanceStatus = async (instanceName: string) => {
    setCheckingStatus(prev => ({ ...prev, [instanceName]: true }));
    try {
      const isConnected = await checkConnectionState(instanceName);
      await updateInstanceConnectionStatus(instanceName, isConnected);
      
      // Update the instance status in the local state
      setInstances(prev => 
        prev.map(instance => 
          instance.nombre === instanceName 
            ? { ...instance, estado: isConnected ? "connected" : "disconnected" } 
            : instance
        )
      );

      if (isConnected) {
        toast({
          title: "Estado verificado",
          description: `La instancia ${instanceName} está conectada.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Estado verificado",
          description: `La instancia ${instanceName} está desconectada.`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error(`Error checking status for ${instanceName}:`, error);
      toast({
        title: "Error de verificación",
        description: "No se pudo verificar el estado de la instancia.",
        variant: "destructive"
      });
    } finally {
      setCheckingStatus(prev => ({ ...prev, [instanceName]: false }));
    }
  };

  const handleConnectInstance = async (instance: Instance) => {
    const instanceName = instance.nombre;
    setConnecting(prev => ({ ...prev, [instanceName]: true }));
    try {
      const qrCode = await connectInstance(instanceName);
      
      if (qrCode) {
        setCurrentQRCode(qrCode);
        setCurrentInstanceName(instanceName);
        setModalOpen(true);
        return qrCode;
      } else {
        toast({
          title: "Error de conexión",
          description: "No se pudo generar el código QR para la conexión.",
          variant: "destructive"
        });
        return null;
      }
    } catch (error) {
      console.error(`Error connecting instance ${instanceName}:`, error);
      toast({
        title: "Error de conexión",
        description: "Ocurrió un error al intentar conectar la instancia.",
        variant: "destructive"
      });
      return null;
    } finally {
      setConnecting(prev => ({ ...prev, [instanceName]: false }));
    }
  };

  const handleConnectToCRM = async (instanceName: string) => {
    setConnectingToCRM(prev => ({ ...prev, [instanceName]: true }));
    try {
      // Prepare user data to send to the webhook
      const userForCRM = userData || { 
        nombre: "Usuario desconocido", 
        email: "desconocido@example.com", 
        perfil: "usuario" 
      };

      // Call the function to connect to the CRM
      await connectToCRM(instanceName, userForCRM);
      
      toast({
        title: "Conexión exitosa",
        description: "La instancia ha sido conectada al CRM correctamente.",
      });
    } catch (error) {
      console.error(`Error connecting to CRM for instance ${instanceName}:`, error);
      toast({
        title: "Error de conexión",
        description: "Ocurrió un error al intentar conectar la instancia al CRM.",
        variant: "destructive"
      });
    } finally {
      setConnectingToCRM(prev => ({ ...prev, [instanceName]: false }));
    }
  };

  const handleDeleteInstance = async (instanceName: string) => {
    try {
      await deleteInstance(instanceName);
      // Refresh the instances list after successful deletion
      await fetchInstances();
    } catch (error) {
      console.error(`Error deleting instance ${instanceName}:`, error);
      // Error handling is already done in the deleteInstance function
    }
  };

  return {
    loading,
    checkingStatus,
    connecting,
    connectingToCRM,
    fetchInstances,
    checkInstanceStatus,
    handleConnectInstance,
    handleConnectToCRM,
    handleDeleteInstance
  };
};
