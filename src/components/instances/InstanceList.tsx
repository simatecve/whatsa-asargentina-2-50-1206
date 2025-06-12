
import { Instance } from "@/contexts/types";
import InstancesLoadingSkeleton from "./InstancesLoadingSkeleton";
import InstancesEmptyState from "./InstancesEmptyState";
import InstancesHeader from "./InstancesHeader";
import InstancesGrid from "./InstancesGrid";

interface InstanceListProps {
  instances: Instance[];
  loading: boolean;
  checkingStatus: Record<string, boolean>;
  connecting: Record<string, boolean>;
  connectingToCRM: Record<string, boolean>;
  onRefresh: () => void;
  onConnect: (instance: Instance) => void;
  onCheckStatus: (instanceName: string) => void;
  onConnectCRM: (instanceName: string) => void;
  formatDate: (date: string) => string;
  getStatusColor: (status: string) => string;
  onCreateNew: () => void;
  userData: { nombre: string; email: string; perfil: string } | null;
  onColorChange?: (instanceName: string, newColor: string) => void;
}

const InstanceList = ({
  instances,
  loading,
  checkingStatus,
  connecting,
  connectingToCRM,
  onRefresh,
  onConnect,
  onCheckStatus,
  onConnectCRM,
  formatDate,
  getStatusColor,
  onCreateNew,
  userData,
  onColorChange
}: InstanceListProps) => {
  if (loading) {
    return <InstancesLoadingSkeleton />;
  }

  if (instances.length === 0) {
    return <InstancesEmptyState onCreateNew={onCreateNew} />;
  }

  return (
    <div>
      <InstancesHeader onRefresh={onRefresh} loading={loading} />
      
      <InstancesGrid
        instances={instances}
        checkingStatus={checkingStatus}
        connecting={connecting}
        connectingToCRM={connectingToCRM}
        onConnect={onConnect}
        onCheckStatus={onCheckStatus}
        onConnectCRM={onConnectCRM}
        formatDate={formatDate}
        getStatusColor={getStatusColor}
        userData={userData}
        onColorChange={onColorChange}
      />
    </div>
  );
};

export default InstanceList;
