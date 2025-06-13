
import { useConnection } from "@/contexts/ConnectionContext";
import InstanceList from "@/components/instances/InstanceList";

interface InstanceListContainerProps {
  onCreateNew: () => void;
}

export const InstanceListContainer = ({ onCreateNew }: InstanceListContainerProps) => {
  const context = useConnection();
  
  if (!context) {
    return <div>Cargando...</div>;
  }

  const { 
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
    userData
  } = context;

  const handleColorChange = async (instanceName: string, newColor: string) => {
    // Refresh instances to get updated color
    await fetchInstances();
  };

  return (
    <InstanceList
      instances={instances}
      loading={loading}
      checkingStatus={checkingStatus}
      connecting={connecting}
      connectingToCRM={connectingToCRM}
      onRefresh={fetchInstances}
      onConnect={handleConnectInstance}
      onCheckStatus={checkInstanceStatus}
      onConnectCRM={handleConnectToCRM}
      formatDate={formatDate}
      getStatusColor={getStatusColor}
      onCreateNew={onCreateNew}
      userData={userData}
      onColorChange={handleColorChange}
    />
  );
};
