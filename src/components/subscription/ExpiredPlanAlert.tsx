
import React from "react";
import { AlertTriangle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface ExpiredPlanAlertProps {
  suscripcion: any;
}

export const ExpiredPlanAlert = ({ suscripcion }: ExpiredPlanAlertProps) => {
  const hasExpiredPlan = suscripcion && suscripcion.planes;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-xl font-bold text-red-600 dark:text-red-400">
            {hasExpiredPlan ? 'Plan Vencido' : 'Sin Plan Activo'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Acceso Restringido</AlertTitle>
            <AlertDescription>
              {hasExpiredPlan ? (
                <>
                  Tu suscripción al plan <strong>{suscripcion.planes.nombre}</strong> venció el{" "}
                  <strong>{format(new Date(suscripcion.fecha_fin), "dd/MM/yyyy")}</strong>.
                  Para continuar usando el sistema, debes renovar tu plan.
                </>
              ) : (
                <>
                  No tienes un plan activo. Para acceder a las funcionalidades del sistema, 
                  necesitas adquirir un plan de suscripción.
                </>
              )}
            </AlertDescription>
          </Alert>

          {hasExpiredPlan && (
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Tu Plan Anterior:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Plan:</span>
                  <span className="font-medium">{suscripcion.planes.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span>Precio:</span>
                  <span className="font-medium">
                    ${suscripcion.planes.precio} {suscripcion.planes.moneda}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Fecha de vencimiento:</span>
                  <span className="font-medium text-red-600">
                    {format(new Date(suscripcion.fecha_fin), "dd/MM/yyyy")}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button asChild className="w-full" size="lg">
              <Link to="/dashboard/planes">
                <CreditCard className="mr-2 h-4 w-4" />
                {hasExpiredPlan ? 'Renovar Plan' : 'Ver Planes Disponibles'}
              </Link>
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              ¿Necesitas ayuda? Contacta a nuestro equipo de soporte.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
