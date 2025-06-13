
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Instance, UserData, ConnectionContextType } from "./types";
import { formatDate, getStatusColor } from "./connectionUtils";
import { useUserData } from "@/hooks/useUserData";
import { useInstanceOperations } from "@/hooks/useInstanceOperations";

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export const ConnectionProvider = ({ children }: { children: ReactNode }) => {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [currentQRCode, setCurrentQRCode] = useState<string | null>(null);
  const [currentInstanceName, setCurrentInstanceName] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const { userData } = useUserData();
  
  const {
    loading,
    checkingStatus,
    connecting,
    connectingToCRM,
    fetchInstances,
    checkInstanceStatus,
    handleConnectInstance,
    handleConnectToCRM
  } = useInstanceOperations(
    setInstances,
    userData,
    setCurrentQRCode,
    setCurrentInstanceName,
    setModalOpen
  );

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentQRCode(null);
    // Refresh instances to get the updated status
    fetchInstances();
  };

  useEffect(() => {
    // Only fetch instances when we have user data
    if (userData) {
      fetchInstances();
    } else if (userData === null) {
      // If userData is explicitly null (no user), clear instances and stop loading
      setInstances([]);
    }
  }, [userData, fetchInstances]);

  return (
    <ConnectionContext.Provider 
      value={{ 
        instances, 
        loading, 
        checkingStatus, 
        connecting, 
        connectingToCRM,
        fetchInstances, 
        handleConnectInstance, 
        checkInstanceStatus, 
        handleConnectToCRM,
        formatDate,
        getStatusColor,
        userData,
        currentQRCode,
        currentInstanceName,
        modalOpen,
        setModalOpen,
        handleCloseModal
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error("useConnection must be used within a ConnectionProvider");
  }
  return context;
};

export type { Instance, UserData } from "./types";
