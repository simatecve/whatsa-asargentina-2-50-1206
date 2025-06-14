
import { useState } from "react";
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
    } catch (error) {
      console.error(`Error checking status for ${instanceName}:`, error);
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
        return null;
      }
    } catch (error) {
      console.error(`Error connecting instance ${instanceName}:`, error);
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
    } catch (error) {
      console.error(`Error connecting to CRM for instance ${instanceName}:`, error);
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
