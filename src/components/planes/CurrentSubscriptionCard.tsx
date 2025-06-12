
import React from "react";
import { Check, Package } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface CurrentSubscriptionCardProps {
  suscripcionActual: any;
}

export const CurrentSubscriptionCard = ({ suscripcionActual }: CurrentSubscriptionCardProps) => {
  if (!suscripcionActual) return null;

  return (
    <Card className="border-2 border-green-200 dark:border-green-900">
      <CardHeader className="bg-green-50 dark:bg-green-900/20">
        <CardTitle className="flex items-center">
          <Check className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
          Su Plan Actual
        </CardTitle>
        <CardDescription>
          Suscripción activa hasta el {format(new Date(suscripcionActual.fecha_fin), "dd/MM/yyyy")}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold">{suscripcionActual.planes.nombre}</h3>
            <p className="text-2xl font-bold mt-2">
              ${suscripcionActual.planes.precio.toFixed(2)}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                /{suscripcionActual.planes.periodo === 'mensual' ? 'mes' : suscripcionActual.planes.periodo === 'anual' ? 'año' : suscripcionActual.planes.periodo}
              </span>
            </p>
          </div>
          <div className="bg-primary/10 p-2 rounded-full">
            <Package className="h-6 w-6 text-primary" />
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Instancias de WhatsApp:</span>
            <span className="font-medium">{suscripcionActual.planes.max_instancias}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Contactos:</span>
            <span className="font-medium">{suscripcionActual.planes.max_contactos.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Campañas:</span>
            <span className="font-medium">{suscripcionActual.planes.max_campanas}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Conversaciones:</span>
            <span className="font-medium">{suscripcionActual.planes.max_conversaciones}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Moneda:</span>
            <span className="font-medium">{suscripcionActual.planes.moneda}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fecha de renovación:</span>
            <span className="font-medium">{format(new Date(suscripcionActual.fecha_fin), "dd/MM/yyyy")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
