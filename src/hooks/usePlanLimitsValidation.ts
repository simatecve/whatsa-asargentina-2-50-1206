import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PlanLimits {
  maxInstancias: number;
  maxContactos: number;
  maxCampanas: number;
  maxConversaciones: number;
  currentInstancias: number;
  currentContactos: number;
  currentCampanas: number;
  currentConversaciones: number;
}

interface LimitCheck {
  isAtLimit: boolean;
  isNearLimit: boolean;
  current: number;
  max: number;
  percentage: number;
}

export const usePlanLimitsValidation = () => {
  const [limits, setLimits] = useState<PlanLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasActivePlan, setHasActivePlan] = useState(false);

  const fetchLimits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Obtener suscripción activa
      const { data: suscripcion, error: suscripcionError } = await supabase
        .from("suscripciones")
        .select(`
          *,
          planes(*)
        `)
        .eq("user_id", user.id)
        .eq("estado", "activa")
        .gt("fecha_fin", new Date().toISOString())
        .order("fecha_fin", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (suscripcionError) {
        console.error("Error fetching subscription:", suscripcionError);
        setHasActivePlan(false);
        setLimits(null);
        setLoading(false);
        return;
      }

      if (!suscripcion) {
        setHasActivePlan(false);
        setLimits(null);
        setLoading(false);
        return;
      }

      setHasActivePlan(true);

      // Obtener uso actual - Para campañas, contar solo las enviadas
      const [instancias, contactos, campanas, conversaciones] = await Promise.all([
        supabase.from("instancias").select("id", { count: 'exact' }).eq("user_id", user.id),
        supabase.from("contacts").select("id", { count: 'exact' }).eq("user_id", user.id),
        supabase.from("campanas").select("id", { count: 'exact' }).eq("user_id", user.id).eq("estado", "enviada"),
        supabase.from("conversaciones")
          .select("id", { count: 'exact' })
          .in("instancia_nombre", 
            (await supabase.from("instancias").select("nombre").eq("user_id", user.id))
              .data?.map(i => i.nombre) || []
          )
      ]);

      const currentLimits: PlanLimits = {
        maxInstancias: suscripcion.planes.max_instancias,
        maxContactos: suscripcion.planes.max_contactos,
        maxCampanas: suscripcion.planes.max_campanas,
        maxConversaciones: suscripcion.planes.max_conversaciones,
        currentInstancias: instancias.count || 0,
        currentContactos: contactos.count || 0,
        currentCampanas: campanas.count || 0,
        currentConversaciones: conversaciones.count || 0
      };

      setLimits(currentLimits);
    } catch (error) {
      console.error("Error fetching limits:", error);
      setHasActivePlan(false);
      setLimits(null);
    } finally {
      setLoading(false);
    }
  };

  const checkLimit = (type: 'instancias' | 'contactos' | 'campanas' | 'conversaciones'): LimitCheck => {
    if (!limits) {
      return { isAtLimit: true, isNearLimit: false, current: 0, max: 0, percentage: 100 };
    }

    let current: number, max: number;

    switch (type) {
      case 'instancias':
        current = limits.currentInstancias;
        max = limits.maxInstancias;
        break;
      case 'contactos':
        current = limits.currentContactos;
        max = limits.maxContactos;
        break;
      case 'campanas':
        current = limits.currentCampanas;
        max = limits.maxCampanas;
        break;
      case 'conversaciones':
        current = limits.currentConversaciones;
        max = limits.maxConversaciones;
        break;
      default:
        current = 0;
        max = 0;
    }

    const percentage = (current / max) * 100;

    return {
      isAtLimit: current >= max,
      isNearLimit: percentage >= 80,
      current,
      max,
      percentage
    };
  };

  const validateAndBlock = (type: 'instancias' | 'contactos' | 'campanas' | 'conversaciones'): boolean => {
    if (!hasActivePlan) {
      toast.error("No tienes un plan activo. Adquiere un plan para acceder a esta funcionalidad.", {
        duration: 5000,
        action: {
          label: "Ver Planes",
          onClick: () => window.location.href = "/dashboard/planes"
        }
      });
      return false;
    }

    // Para campañas, no bloquear la creación, solo mostrar advertencia si está cerca del límite de envío
    if (type === 'campanas') {
      return true; // Siempre permitir crear campañas
    }

    const limitCheck = checkLimit(type);

    if (limitCheck.isAtLimit) {
      const typeLabels = {
        instancias: 'instancias',
        contactos: 'contactos', 
        campanas: 'campañas',
        conversaciones: 'conversaciones'
      };

      toast.error(
        `Has alcanzado el límite de ${typeLabels[type]} (${limitCheck.current}/${limitCheck.max}). Actualiza tu plan para continuar.`,
        {
          duration: 5000,
          action: {
            label: "Ver Planes",
            onClick: () => window.location.href = "/dashboard/planes"
          }
        }
      );
      return false;
    }

    if (limitCheck.isNearLimit) {
      const typeLabels = {
        instancias: 'instancias',
        contactos: 'contactos',
        campanas: 'campañas', 
        conversaciones: 'conversaciones'
      };

      toast.warning(
        `Te estás acercando al límite de ${typeLabels[type]} (${limitCheck.current}/${limitCheck.max}). Considera actualizar tu plan.`,
        {
          duration: 4000,
          action: {
            label: "Ver Planes",
            onClick: () => window.location.href = "/dashboard/planes"
          }
        }
      );
    }

    return true;
  };

  // Nueva función para validar límites de envío de campañas
  const validateCampanaSend = (): boolean => {
    if (!hasActivePlan) {
      toast.error("No tienes un plan activo. Adquiere un plan para enviar campañas.", {
        duration: 5000,
        action: {
          label: "Ver Planes",
          onClick: () => window.location.href = "/dashboard/planes"
        }
      });
      return false;
    }

    const limitCheck = checkLimit('campanas');

    if (limitCheck.isAtLimit) {
      toast.error(
        `Has alcanzado el límite de campañas enviadas (${limitCheck.current}/${limitCheck.max}). Actualiza tu plan para enviar más campañas.`,
        {
          duration: 5000,
          action: {
            label: "Ver Planes",
            onClick: () => window.location.href = "/dashboard/planes"
          }
        }
      );
      return false;
    }

    return true;
  };

  useEffect(() => {
    fetchLimits();
  }, []);

  return {
    limits,
    loading,
    hasActivePlan,
    checkLimit,
    validateAndBlock,
    validateCampanaSend,
    refetch: fetchLimits
  };
};
