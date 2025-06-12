
import { useState } from "react";

export type AgenteIAView = 'list' | 'form';

export const useAgenteIAView = () => {
  const [currentView, setCurrentView] = useState<AgenteIAView>('list');
  const [editingConfig, setEditingConfig] = useState<any>(null);

  const handleCreateNew = () => {
    setEditingConfig(null);
    setCurrentView('form');
  };

  const handleEdit = (config: any) => {
    setEditingConfig(config);
    setCurrentView('form');
  };

  const handleBack = () => {
    setEditingConfig(null);
    setCurrentView('list');
  };

  const handleSave = () => {
    setEditingConfig(null);
    setCurrentView('list');
  };

  return {
    currentView,
    editingConfig,
    handleCreateNew,
    handleEdit,
    handleBack,
    handleSave
  };
};
