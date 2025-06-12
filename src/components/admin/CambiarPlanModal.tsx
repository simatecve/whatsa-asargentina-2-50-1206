
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowUpDown, CreditCard, Calendar, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface CambiarPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suscripcion: any;
  onSuccess: () => void;
}

const CambiarPlanModal = ({ open, onOpenChange, suscripcion, onSuccess }: CambiarPlanModalProps) => {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      fetchPlanes();
    }
  }, [open]);

  const fetchPlanes = async () => {
    setLoading(true);
    try {
      const { data: planesData, error: planesError } = await supabase
        .from("planes")
        .select("*")
        .eq("estado", true)
        .order("precio");

      if (planesError) throw planesError;
      setPlanes(planesData || []);
    } catch (error) {
      console.error("Error fetching planes:", error);
      toast.error("Error al cargar los planes");
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarPlan = async () => {
    if (!selectedPlan) {
      toast.error("Por favor seleccione un plan");
      return;
    }

    if (selectedPlan === suscripcion.plan_id) {
      toast.error("El usuario ya tiene este plan");
      return;
    }

    setSaving(true);
    try {
      const planSeleccionado = planes.find(p => p.id === selectedPlan);
      
      if (!planSeleccionado) {
        throw new Error("Plan no encontrado");
      }

      // Calcular nueva fecha de fin basada en el tipo de plan
      let nuevaFechaFin;
      if (planSeleccionado.periodo === 'trial') {
        // Para plan trial, dar exactamente 3 días desde ahora
        nuevaFechaFin = new Date();
        nuevaFechaFin.setDate(nuevaFechaFin.getDate() + 3);
      } else {
        // Para otros planes, mantener el tiempo restante o agregar según el periodo
        const fechaFinActual = new Date(suscripcion.fecha_fin);
        const ahora = new Date();
        
        if (fechaFinActual > ahora) {
          // Si la suscripción actual aún está activa, mantener la fecha
          nuevaFechaFin = fechaFinActual;
        } else {
          // Si ya expiró, crear nueva suscripción desde ahora
          nuevaFechaFin = new Date();
          switch (planSeleccionado.periodo) {
            case 'mensual':
              nuevaFechaFin.setMonth(nuevaFechaFin.getMonth() + 1);
              break;
            case 'trimestral':
              nuevaFechaFin.setMonth(nuevaFechaFin.getMonth() + 3);
              break;
            case 'anual':
              nuevaFechaFin.setFullYear(nuevaFechaFin.getFullYear() + 1);
              break;
            default:
              nuevaFechaFin.setMonth(nuevaFechaFin.getMonth() + 1);
          }
        }
      }

      // Actualizar la suscripción existente
      const { error: updateError } = await supabase
        .from("suscripciones")
        .update({
          plan_id: selectedPlan,
          fecha_fin: nuevaFechaFin.toISOString(),
          estado: "activa",
          updated_at: new Date().toISOString()
        })
        .eq("id", suscripcion.id);

      if (updateError) throw updateError;

      toast.success("Plan cambiado correctamente");
      onSuccess();
      onOpenChange(false);
      setSelectedPlan("");
    } catch (error) {
      console.error("Error cambiando plan:", error);
      toast.error("Error al cambiar el plan");
    } finally {
      setSaving(false);
    }
  };

  const selectedPlanData = planes.find(p => p.id === selectedPlan);
  const currentPlanData = planes.find(p => p.id === suscripcion?.plan_id);

  const getPlanTypeText = (periodo: string) => {
    switch (periodo) {
      case 'trial':
        return 'Prueba gratuita';
      case 'mensual':
        return 'Mensual';
      case 'trimestral':
        return 'Trimestral';
      case 'anual':
        return 'Anual';
      default:
        return periodo;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ArrowUpDown className="mr-2 h-5 w-5" />
            Cambiar Plan
          </DialogTitle>
          <DialogDescription>
            Modifique el plan de suscripción del usuario seleccionado.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Cargando planes...</p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {currentPlanData && (
              <div className="bg-muted p-3 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Plan Actual:</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{currentPlanData.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      ${currentPlanData.precio} {currentPlanData.moneda} - {getPlanTypeText(currentPlanData.periodo)}
                    </p>
                  </div>
                  <Badge variant="secondary">Actual</Badge>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="plan">Nuevo Plan *</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un plan" />
                </SelectTrigger>
                <SelectContent>
                  {planes.map((plan) => (
                    <SelectItem 
                      key={plan.id} 
                      value={plan.id}
                      disabled={plan.id === suscripcion?.plan_id}
                    >
                      <div className="flex items-center w-full">
                        <div className="flex-1">
                          <div className="font-medium">{plan.nombre}</div>
                          <div className="text-xs text-muted-foreground">
                            ${plan.precio} {plan.moneda} - {getPlanTypeText(plan.periodo)}
                          </div>
                        </div>
                        {plan.id === suscripcion?.plan_id && (
                          <Badge variant="outline" className="ml-2">Actual</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPlanData && selectedPlanData.id !== suscripcion?.plan_id && (
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-900">
                <h4 className="font-medium text-sm mb-2 text-green-800 dark:text-green-200">
                  Nuevo Plan - {selectedPlanData.nombre}:
                </h4>
                <div className="space-y-1 text-xs text-green-700 dark:text-green-300">
                  <div>• {selectedPlanData.max_instancias === 999 ? 'Instancias ilimitadas' : `${selectedPlanData.max_instancias} instancia(s)`}</div>
                  <div>• {selectedPlanData.max_contactos === 999999 ? 'Contactos ilimitados' : `${selectedPlanData.max_contactos.toLocaleString()} contactos`}</div>
                  <div>• {selectedPlanData.max_campanas === 999 ? 'Campañas ilimitadas' : `${selectedPlanData.max_campanas} campañas`}</div>
                  <div>• {selectedPlanData.max_conversaciones === 999999 ? 'Conversaciones ilimitadas' : `${selectedPlanData.max_conversaciones.toLocaleString()} conversaciones`}</div>
                  <div>• {selectedPlanData.max_mensajes === 999999 ? 'Mensajes ilimitados' : `${selectedPlanData.max_mensajes.toLocaleString()} mensajes`}</div>
                  {selectedPlanData.periodo === 'trial' && (
                    <div className="text-orange-600 dark:text-orange-400 font-medium">
                      • Válido por exactamente 3 días desde la activación
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button 
            onClick={handleCambiarPlan} 
            disabled={saving || !selectedPlan || selectedPlan === suscripcion?.plan_id}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Cambiando...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Cambiar Plan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CambiarPlanModal;
