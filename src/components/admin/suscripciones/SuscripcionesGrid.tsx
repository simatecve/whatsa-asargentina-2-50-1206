
import React from "react";
import { CreditCard, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SuscripcionCard } from "./SuscripcionCard";

interface SuscripcionesGridProps {
  suscripciones: any[];
  loading: boolean;
  search: string;
  filter: string;
  onAsignarPlan: () => void;
  onCambiarPlan: (suscripcion: any) => void;
  onExtenderSuscripcion: (id: string, meses: number) => void;
  onCancelSuscripcion: (id: string) => void;
  onEliminarSuscripcion: (id: string) => void;
}

export const SuscripcionesGrid = ({
  suscripciones,
  loading,
  search,
  filter,
  onAsignarPlan,
  onCambiarPlan,
  onExtenderSuscripcion,
  onCancelSuscripcion,
  onEliminarSuscripcion
}: SuscripcionesGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (suscripciones.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            {search || filter !== "todas" 
              ? "No se encontraron suscripciones con los filtros aplicados"
              : "No hay suscripciones registradas"
            }
          </p>
          <Button onClick={onAsignarPlan}>
            <UserPlus className="mr-2 h-4 w-4" />
            Asignar primer plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {suscripciones.map((suscripcion) => (
        <SuscripcionCard
          key={suscripcion.id}
          suscripcion={suscripcion}
          onCambiarPlan={onCambiarPlan}
          onExtender={onExtenderSuscripcion}
          onCancelar={onCancelSuscripcion}
          onEliminar={onEliminarSuscripcion}
        />
      ))}
    </div>
  );
};
