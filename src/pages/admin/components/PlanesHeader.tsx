
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlanesHeaderProps {
  onCreatePlan: () => void;
}

export const PlanesHeader = ({ onCreatePlan }: PlanesHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Administración de Planes</h1>
        <p className="text-muted-foreground">
          Gestione los planes de suscripción del sistema.
        </p>
      </div>
      <Button onClick={onCreatePlan}>
        <Plus className="mr-2 h-4 w-4" />
        Nuevo Plan
      </Button>
    </div>
  );
};
