
import React from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuscripcionesHeaderProps {
  onAsignarPlan: () => void;
}

export const SuscripcionesHeader = ({ onAsignarPlan }: SuscripcionesHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Administración de Suscripciones</h1>
        <p className="text-muted-foreground">
          Gestione las suscripciones de los usuarios y asigne planes.
        </p>
      </div>
      <Button onClick={onAsignarPlan}>
        <UserPlus className="mr-2 h-4 w-4" />
        Asignar Plan
      </Button>
    </div>
  );
};
