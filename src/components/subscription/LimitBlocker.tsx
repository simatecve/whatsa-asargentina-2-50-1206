
import React from "react";
import { Shield, CreditCard, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface LimitBlockerProps {
  type: 'contactos' | 'campanas' | 'conversaciones' | 'instancias';
  current: number;
  max: number;
  planName?: string;
}

export const LimitBlocker = ({ type, current, max, planName }: LimitBlockerProps) => {
  const typeConfig = {
    contactos: {
      title: 'Límite de Contactos Alcanzado',
      description: 'Has alcanzado el límite máximo de contactos que puedes almacenar.',
      action: 'agregar más contactos'
    },
    campanas: {
      title: 'Límite de Campañas Alcanzado', 
      description: 'Has alcanzado el límite máximo de campañas que puedes crear.',
      action: 'crear más campañas'
    },
    conversaciones: {
      title: 'Límite de Conversaciones Alcanzado',
      description: 'Has alcanzado el límite máximo de conversaciones que puedes gestionar.',
      action: 'gestionar más conversaciones'
    },
    instancias: {
      title: 'Límite de Instancias Alcanzado',
      description: 'Has alcanzado el límite máximo de instancias de WhatsApp que puedes crear.',
      action: 'crear más instancias'
    }
  };

  const config = typeConfig[type];

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="w-full max-w-md text-center border-red-200 dark:border-red-800">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-red-800 dark:text-red-200">
            {config.title}
          </CardTitle>
          <CardDescription className="text-red-600 dark:text-red-400">
            {config.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-red-50 dark:bg-red-950 p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="font-semibold text-red-800 dark:text-red-200">
                Límite Actual: {current}/{max}
              </span>
            </div>
            {planName && (
              <p className="text-sm text-red-600 dark:text-red-400">
                Plan actual: {planName}
              </p>
            )}
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Para {config.action}, necesitas actualizar tu plan a uno con límites más altos.
            </p>
            
            <Button asChild className="w-full" size="lg">
              <Link to="/dashboard/planes">
                <CreditCard className="mr-2 h-4 w-4" />
                Ver Planes Disponibles
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link to="/dashboard">
                Volver al Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
