
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PlanFormData {
  nombre: string;
  descripcion: string;
  precio: string;
  moneda: string;
  periodo: string;
  max_instancias: string;
  max_contactos: string;
  max_campanas: string;
  max_conversaciones: string;
  max_mensajes: string;
  estado: boolean;
}

interface Plan {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  moneda: string;
  periodo: string;
  max_instancias: number;
  max_contactos: number;
  max_campanas: number;
  max_conversaciones: number;
  max_mensajes: number;
  estado: boolean;
}

export const usePlanOperations = () => {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlanes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("planes")
        .select("*")
        .order("precio");

      if (error) throw error;
      setPlanes(data || []);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Error al cargar los planes");
    } finally {
      setLoading(false);
    }
  };

  const savePlan = async (formData: PlanFormData, editPlan: Plan | null) => {
    try {
      if (!formData.nombre || !formData.precio) {
        toast.error("Por favor complete todos los campos requeridos");
        return false;
      }

      const planData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        moneda: formData.moneda,
        periodo: formData.periodo,
        max_instancias: parseInt(formData.max_instancias),
        max_contactos: parseInt(formData.max_contactos),
        max_campanas: parseInt(formData.max_campanas),
        max_conversaciones: parseInt(formData.max_conversaciones),
        max_mensajes: parseInt(formData.max_mensajes),
        estado: formData.estado
      };

      if (editPlan) {
        const { error } = await supabase
          .from("planes")
          .update(planData)
          .eq("id", editPlan.id);

        if (error) throw error;
        toast.success("Plan actualizado correctamente");
      } else {
        const { error } = await supabase
          .from("planes")
          .insert(planData);

        if (error) throw error;
        toast.success("Plan creado correctamente");
      }

      fetchPlanes();
      return true;
    } catch (error) {
      console.error("Error saving plan:", error);
      toast.error("Error al guardar el plan");
      return false;
    }
  };

  const deletePlan = async (planId: string) => {
    if (window.confirm("¿Está seguro de eliminar este plan? Esta acción no se puede deshacer.")) {
      try {
        // Verificar si hay suscripciones activas asociadas a este plan
        const { data: suscripciones, error: checkError } = await supabase
          .from("suscripciones")
          .select("id")
          .eq("plan_id", planId)
          .eq("estado", "activa");

        if (checkError) throw checkError;

        if (suscripciones && suscripciones.length > 0) {
          toast.error("No se puede eliminar el plan porque tiene suscripciones activas asociadas");
          return;
        }

        // Verificar si hay pagos asociados a este plan
        const { data: pagos, error: pagosError } = await supabase
          .from("pagos")
          .select("id")
          .eq("plan_id", planId);

        if (pagosError) throw pagosError;

        if (pagos && pagos.length > 0) {
          toast.error("No se puede eliminar el plan porque tiene pagos asociados. Debe eliminar primero los pagos relacionados.");
          return;
        }

        // Si no hay suscripciones activas ni pagos, proceder con la eliminación
        const { error } = await supabase
          .from("planes")
          .delete()
          .eq("id", planId);

        if (error) throw error;
        
        toast.success("Plan eliminado correctamente");
        fetchPlanes();
      } catch (error) {
        console.error("Error deleting plan:", error);
        toast.error("Error al eliminar el plan: " + (error as any).message);
      }
    }
  };

  return {
    planes,
    loading,
    fetchPlanes,
    savePlan,
    deletePlan
  };
};
