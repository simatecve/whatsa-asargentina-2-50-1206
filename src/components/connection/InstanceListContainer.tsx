
import { useConnection } from "@/contexts/ConnectionContext";
import InstanceList from "@/components/instances/InstanceList";
import { Skeleton } from "@/components/ui/skeleton";

interface InstanceListContainerProps {
  onCreateNew: () => void;
}

export const InstanceListContainer = ({ onCreateNew }: InstanceListContainerProps) => {
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
  } = useConnection();

  const handleColorChange = async (instanceName: string, newColor: string) => {
    // Refresh instances to get updated color
    await fetchInstances();
  };

  // Show loading skeleton while fetching data
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

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
