
import React from "react";
import { Check, Clock, Loader2, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface PlanCardProps {
  plan: any;
  suscripcionActual: any;
  isProcessing: boolean;
  processingPlanId: string | null;
  onSelectPlan: (plan: any) => void;
}

export const PlanCard = ({ 
  plan, 
  suscripcionActual, 
  isProcessing, 
  processingPlanId, 
  onSelectPlan 
}: PlanCardProps) => {
  const isCurrentPlan = suscripcionActual?.planes.id === plan.id;
  const isProcessingThisPlan = isProcessing && processingPlanId === plan.id;
  const isTrialPlan = plan.periodo === 'trial';
  const isFreePlan = plan.precio === 0;

  const handleSelectPlan = () => {
    if (!isProcessing && !isCurrentPlan) {
      onSelectPlan(plan);
    }
  };

  const formatFeatureValue = (value: number, type: string) => {
    if (value >= 999999) return "Ilimitado";
    if (value >= 999 && type === "instancias") return "Ilimitado";
    if (value >= 999 && type === "campanas") return "Ilimitado";
    return value.toLocaleString();
  };

  const getPlanTypeText = () => {
    if (isTrialPlan) return "Prueba Gratuita";
    switch (plan.periodo) {
      case 'mensual': return 'mes';
      case 'trimestral': return 'trimestre';
      case 'anual': return 'año';
      default: return plan.periodo;
    }
  };

  return (
    <Card 
      className={`flex flex-col h-full transition-all duration-200 ${
        isCurrentPlan ? 'border-2 border-primary shadow-md' : ''
      } ${isProcessingThisPlan ? 'ring-2 ring-blue-500 ring-opacity-50' : ''} ${
        isTrialPlan ? 'border-2 border-green-500 shadow-lg' : ''
      }`}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {plan.nombre}
            {isTrialPlan && <Gift className="h-4 w-4 text-green-500" />}
          </div>
          <div className="flex gap-2">
            {isCurrentPlan && (
              <Badge variant="default" className="text-xs">
                Actual
              </Badge>
            )}
            {isTrialPlan && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                3 Días Gratis
              </Badge>
            )}
          </div>
        </CardTitle>
        <CardDescription>{plan.descripcion}</CardDescription>
        <div className="mt-4">
          {isFreePlan ? (
            <div className="text-3xl font-bold text-green-600">
              GRATIS
              {isTrialPlan && (
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  por 3 días
                </span>
              )}
            </div>
          ) : (
            <div className="text-3xl font-bold">
              ${plan.precio.toFixed(2)}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                /{getPlanTypeText()}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <Separator className="my-4" />
        <ul className="space-y-3 mt-4">
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            <span>
              <strong>{formatFeatureValue(plan.max_instancias, "instancias")}</strong> Instancias de WhatsApp
            </span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            <span>
              Hasta <strong>{formatFeatureValue(plan.max_contactos, "contactos")}</strong> contactos
            </span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            <span>
              Hasta <strong>{formatFeatureValue(plan.max_campanas, "campanas")}</strong> campañas
            </span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            <span>
              Hasta <strong>{formatFeatureValue(plan.max_conversaciones, "conversaciones")}</strong> conversaciones
            </span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            <span>
              Hasta <strong>{formatFeatureValue(plan.max_mensajes || 1000, "mensajes")}</strong> mensajes recibidos
            </span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            <span>Moneda: <strong>{plan.moneda}</strong></span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            <span>Soporte técnico por email</span>
          </li>
          {isTrialPlan && (
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-green-600 font-medium">Acceso completo a todas las funciones</span>
            </li>
          )}
        </ul>
      </CardContent>
      <CardFooter>
        {isCurrentPlan ? (
          <Button 
            className="w-full" 
            variant="outline"
            disabled
          >
            <Clock className="mr-2 h-4 w-4" />
            Plan Actual
          </Button>
        ) : (
          <Button 
            className={`w-full ${isTrialPlan ? 'bg-green-600 hover:bg-green-700' : ''}`}
            onClick={handleSelectPlan}
            disabled={isProcessing}
            variant={isProcessingThisPlan ? "secondary" : isTrialPlan ? "default" : "default"}
          >
            {isProcessingThisPlan ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparando pago...
              </>
            ) : isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                {isTrialPlan && <Gift className="mr-2 h-4 w-4" />}
                {isTrialPlan ? 'Activar Prueba Gratis' : 'Contratar Plan'}
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
