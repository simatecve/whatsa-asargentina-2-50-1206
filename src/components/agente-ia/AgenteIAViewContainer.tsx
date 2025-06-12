
import { AgenteIAList } from "./AgenteIAList";
import { AgenteIAForm } from "./AgenteIAForm";
import { AgenteIAView } from "@/hooks/useAgenteIAView";

interface AgenteIAViewContainerProps {
  currentView: AgenteIAView;
  editingConfig: any;
  onCreateNew: () => void;
  onEdit: (config: any) => void;
  onBack: () => void;
  onSave: () => void;
}

export const AgenteIAViewContainer = ({
  currentView,
  editingConfig,
  onCreateNew,
  onEdit,
  onBack,
  onSave
}: AgenteIAViewContainerProps) => {
  if (currentView === 'list') {
    return <AgenteIAList onCreateNew={onCreateNew} onEdit={onEdit} />;
  }

  return (
    <AgenteIAForm 
      onBack={onBack} 
      onSave={onSave} 
      editingConfig={editingConfig}
    />
  );
};
