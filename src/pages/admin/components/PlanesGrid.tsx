
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanCard } from "./PlanCard";

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

interface PlanesGridProps {
  planes: Plan[];
  loading: boolean;
  onCreatePlan: () => void;
  onEditPlan: (plan: Plan) => void;
  onDeletePlan: (planId: string) => void;
}

export const PlanesGrid = ({ planes, loading, onCreatePlan, onEditPlan, onDeletePlan }: PlanesGridProps) => {
  if (loading) {
    return <div className="text-center py-8">Cargando planes...</div>;
  }

  if (planes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay planes disponibles</p>
        <Button onClick={onCreatePlan} className="mt-4">
          <Plus className="mr-2 h-4 w-4" />
          Crear primer plan
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {planes.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          onEdit={onEditPlan}
          onDelete={onDeletePlan}
        />
      ))}
    </div>
  );
};
