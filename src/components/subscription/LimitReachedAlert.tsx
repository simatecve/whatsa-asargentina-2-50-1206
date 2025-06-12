
import React from "react";
import { AlertTriangle, CreditCard, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface LimitReachedAlertProps {
  type: 'contactos' | 'campanas' | 'conversaciones' | 'instancias' | 'mensajes';
  current: number;
  max: number;
  onClose?: () => void;
  blocking?: boolean;
}

export const LimitReachedAlert = ({ 
  type, 
  current, 
  max, 
  onClose, 
  blocking = false 
}: LimitReachedAlertProps) => {
  const typeLabels = {
    contactos: 'contactos',
    campanas: 'campañas',
    conversaciones: 'conversaciones',
    instancias: 'instancias de WhatsApp',
    mensajes: 'mensajes recibidos'
  };

  const typeMessages = {
    contactos: 'No puedes agregar más contactos a tus listas.',
    campanas: 'No puedes crear más campañas de envío masivo.',
    conversaciones: 'No puedes gestionar más conversaciones.',
    instancias: 'No puedes crear más instancias de WhatsApp.',
    mensajes: 'No puedes recibir más mensajes en el CRM.'
  };

  return (
    <Alert variant="destructive" className="mb-4 border-red-500 bg-red-50 dark:bg-red-950">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertTitle className="flex items-center justify-between text-red-800 dark:text-red-200">
        <span>Límite Alcanzado: {typeLabels[type]}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-normal">
            {current}/{max}
          </span>
          {onClose && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </AlertTitle>
      <AlertDescription className="mt-2 text-red-700 dark:text-red-300">
        <div className="flex flex-col gap-3">
          <p>
            Has alcanzado el límite máximo de {typeLabels[type]} para tu plan actual. 
            {blocking && ` ${typeMessages[type]}`}
          </p>
          <div className="flex items-center gap-2">
            <Button asChild variant="destructive" size="sm">
              <Link to="/dashboard/planes">
                <CreditCard className="mr-2 h-3 w-3" />
                Actualizar Plan
              </Link>
            </Button>
            <span className="text-xs text-red-600">
              Actualiza tu plan para continuar usando esta funcionalidad
            </span>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};
