
import { useAgenteIAView } from "@/hooks/useAgenteIAView";
import { useBotAutoDisable } from "@/hooks/useBotAutoDisable";
import { AgenteIAHeader } from "@/components/agente-ia/AgenteIAHeader";
import { AgenteIAViewContainer } from "@/components/agente-ia/AgenteIAViewContainer";
import { LimitReachedAlert } from "@/components/subscription/LimitReachedAlert";

const AgenteIA = () => {
  const {
    currentView,
    editingConfig,
    handleCreateNew,
    handleEdit,
    handleBack,
    handleSave
  } = useAgenteIAView();

  const { isAtMessageLimit, messageUsage } = useBotAutoDisable();

  // Si está en el límite de mensajes, mostrar solo la alerta de bloqueo
  if (isAtMessageLimit) {
    return (
      <div className="space-y-6">
        <AgenteIAHeader />
        <div className="max-w-4xl mx-auto">
          <LimitReachedAlert 
            type="mensajes" 
            current={messageUsage.current} 
            max={messageUsage.max} 
            blocking={true} 
          />
          <div className="mt-6 text-center p-8 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sección Bloqueada
            </h3>
            <p className="text-gray-600">
              No puedes acceder a la gestión de Agentes IA porque has alcanzado el límite de mensajes de tu plan.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Todos los bots han sido desactivados automáticamente para cumplir con los límites del plan.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AgenteIAHeader />
      <AgenteIAViewContainer
        currentView={currentView}
        editingConfig={editingConfig}
        onCreateNew={handleCreateNew}
        onEdit={handleEdit}
        onBack={handleBack}
        onSave={handleSave}
      />
    </div>
  );
};

export default AgenteIA;
