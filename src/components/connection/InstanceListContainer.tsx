
import { useConnection } from "@/contexts/ConnectionContext";
import { usePlanLimitsValidation } from "@/hooks/usePlanLimitsValidation";
import { LimitAlert } from "@/components/subscription/LimitAlert";
import InstanceList from "@/components/instances/InstanceList";

interface InstanceListContainerProps {
  onCreateNew: () => void;
}

export const InstanceListContainer = ({ onCreateNew }: InstanceListContainerProps) => {
  const context = useConnection();
  const { limits, checkLimit } = usePlanLimitsValidation();
  
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

  // Verificar límites de instancias
  const instanceLimit = limits ? checkLimit('instancias') : null;

  return (
    <div className="space-y-4">
      {/* Mostrar alerta si está cerca o en el límite */}
      {instanceLimit && instanceLimit.isNearLimit && (
        <LimitAlert
          type={instanceLimit.isAtLimit ? 'error' : 'warning'}
          title={instanceLimit.isAtLimit ? 'Límite de Instancias Alcanzado' : 'Cerca del Límite de Instancias'}
          description={
            instanceLimit.isAtLimit 
              ? `Has alcanzado el límite máximo de instancias para tu plan.`
              : `Estás cerca del límite de instancias para tu plan.`
          }
          current={instanceLimit.current}
          max={instanceLimit.max}
          planName=""
        />
      )}

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
    </div>
  );
};
