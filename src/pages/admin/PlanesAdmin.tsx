
import React, { useState, useEffect } from "react";
import { usePlanOperations } from "./hooks/usePlanOperations";
import { PlanesHeader } from "./components/PlanesHeader";
import { PlanesGrid } from "./components/PlanesGrid";
import { PlanFormDialog } from "./components/PlanFormDialog";

interface Plan {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  moneda: string;
  periodo: string;
  max_instancias: number;
  max_contactos: number;
  max_campanas: number;
  max_conversaciones: number;
  max_mensajes: number;
  estado: boolean;
}

const PlanesAdmin = () => {
  const { planes, loading, fetchPlanes, savePlan, deletePlan } = usePlanOperations();
  const [open, setOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);

  useEffect(() => {
    fetchPlanes();
  }, []);

  const openCreateDialog = () => {
    setEditPlan(null);
    setOpen(true);
  };

  const openEditDialog = (plan: Plan) => {
    setEditPlan(plan);
    setOpen(true);
  };

  const handleSavePlan = async (formData: any, editPlan: Plan | null) => {
    const success = await savePlan(formData, editPlan);
    return success;
  };

  return (
    <div className="space-y-6">
      <PlanesHeader onCreatePlan={openCreateDialog} />
      
      <PlanesGrid
        planes={planes}
        loading={loading}
        onCreatePlan={openCreateDialog}
        onEditPlan={openEditDialog}
        onDeletePlan={deletePlan}
      />

      <PlanFormDialog
        open={open}
        onOpenChange={setOpen}
        editPlan={editPlan}
        onSave={handleSavePlan}
      />
    </div>
  );
};

export default PlanesAdmin;
