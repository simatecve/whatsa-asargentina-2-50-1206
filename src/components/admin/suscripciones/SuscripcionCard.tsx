
import React from "react";
import { User, Calendar, ArrowUpDown, X, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";

interface SuscripcionCardProps {
  suscripcion: any;
  onCambiarPlan: (suscripcion: any) => void;
  onExtender: (id: string, meses: number) => void;
  onCancelar: (id: string) => void;
  onEliminar: (id: string) => void;
}

export const SuscripcionCard = ({ 
  suscripcion, 
  onCambiarPlan, 
  onExtender, 
  onCancelar, 
  onEliminar 
}: SuscripcionCardProps) => {
  const getStatusBadgeVariant = (status: string, fechaFin: string) => {
    if (status === "activa" && new Date(fechaFin) < new Date()) {
      return "destructive";
    }
    switch (status) {
      case "activa":
        return "default";
      case "pendiente":
        return "secondary";
      case "cancelada":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status: string, fechaFin: string) => {
    if (status === "activa" && new Date(fechaFin) < new Date()) {
      return "Vencida";
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const isExpired = (fechaFin: string) => new Date(fechaFin) < new Date();

  const getPlanTypeText = (periodo: string) => {
    switch (periodo) {
      case 'trial':
        return 'Prueba';
      case 'mensual':
        return 'mes';
      case 'trimestral':
        return 'trimestre';
      case 'anual':
        return 'año';
      default:
        return periodo;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <CardTitle className="text-base">
                {suscripcion.usuarios?.nombre || "Usuario Desconocido"}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {suscripcion.usuarios?.email}
              </p>
            </div>
          </div>
          <Badge variant={getStatusBadgeVariant(suscripcion.estado, suscripcion.fecha_fin)}>
            {getStatusText(suscripcion.estado, suscripcion.fecha_fin)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm">{suscripcion.planes?.nombre || "Plan Desconocido"}</p>
            {suscripcion.planes?.periodo === 'trial' && (
              <Badge variant="secondary" className="text-xs">
                Prueba
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {suscripcion.planes?.precio === 0 ? 'Gratuito' : `$${suscripcion.planes?.precio} ${suscripcion.planes?.moneda}`} 
            {suscripcion.planes?.precio > 0 && ` / ${getPlanTypeText(suscripcion.planes?.periodo)}`}
          </p>
        </div>
        
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Inicio:</span>
            <span>{format(new Date(suscripcion.fecha_inicio), "dd/MM/yyyy")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vence:</span>
            <span className={isExpired(suscripcion.fecha_fin) && suscripcion.estado === "activa" ? "text-red-600 font-medium" : ""}>
              {format(new Date(suscripcion.fecha_fin), "dd/MM/yyyy")}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => onCambiarPlan(suscripcion)}
          >
            <ArrowUpDown className="h-3 w-3 mr-1" />
            Cambiar Plan
          </Button>
          
          <div className="flex gap-1">
            {suscripcion.estado === "activa" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => onExtender(suscripcion.id, 1)}
                >
                  +1 mes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => onCancelar(suscripcion.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </>
            )}
            {(suscripcion.estado === "cancelada" || isExpired(suscripcion.fecha_fin)) && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-green-600 hover:text-green-700"
                onClick={() => onExtender(suscripcion.id, 1)}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Renovar
              </Button>
            )}
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar suscripción?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará permanentemente la suscripción de {suscripcion.usuarios?.nombre}. 
                    Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onEliminar(suscripcion.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
