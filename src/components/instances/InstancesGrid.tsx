
import { Instance } from "@/contexts/types";
import { InstanceCard } from "./InstanceCard";

interface InstancesGridProps {
  instances: Instance[];
  checkingStatus: Record<string, boolean>;
  connecting: Record<string, boolean>;
  connectingToCRM: Record<string, boolean>;
  onConnect: (instance: Instance) => void;
  onCheckStatus: (instanceName: string) => void;
  onConnectCRM: (instanceName: string) => void;
  formatDate: (date: string) => string;
  getStatusColor: (status: string) => string;
  userData: { nombre: string; email: string; perfil: string } | null;
  onColorChange?: (instanceName: string, newColor: string) => void;
}

const InstancesGrid = ({
  instances,
  checkingStatus,
  connecting,
  connectingToCRM,
  onConnect,
  onCheckStatus,
  onConnectCRM,
  formatDate,
  getStatusColor,
  userData,
  onColorChange
}: InstancesGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {instances.map((instance) => (
        <InstanceCard
          key={instance.id}
          instance={instance}
          allInstances={instances}
          onConnect={onConnect}
          onDisconnect={() => {}}
          onDelete={() => {}}
          onToggleWebhook={() => {}}
          onColorChange={onColorChange}
        />
      ))}
    </div>
  );
};

export default InstancesGrid;
