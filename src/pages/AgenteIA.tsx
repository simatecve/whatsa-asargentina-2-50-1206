
import { useAgenteIAView } from "@/hooks/useAgenteIAView";
import { AgenteIAHeader } from "@/components/agente-ia/AgenteIAHeader";
import { AgenteIAViewContainer } from "@/components/agente-ia/AgenteIAViewContainer";

const AgenteIA = () => {
  const {
    currentView,
    editingConfig,
    handleCreateNew,
    handleEdit,
    handleBack,
    handleSave
  } = useAgenteIAView();

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
