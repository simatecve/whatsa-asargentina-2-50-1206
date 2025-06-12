
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PlanLimits {
  maxInstancias: number;
  maxContactos: number;
  maxCampanas: number;
  maxConversaciones: number;
  maxMensajes: number;
  currentInstancias: number;
  currentContactos: number;
  currentCampanas: number;
  currentConversaciones: number;
  currentMensajes: number;
}

export const useSubscriptionValidation = () => {
  const [suscripcionActiva, setSuscripcionActiva] = useState<any>(null);
  const [limits, setLimits] = useState<PlanLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);

  const checkLimit = (type: 'instancias' | 'contactos' | 'campanas' | 'conversaciones' | 'mensajes'): boolean => {
    if (!limits) return true; // Block if limits haven't loaded yet
    
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
      case 'mensajes':
        current = limits.currentMensajes;
        max = limits.maxMensajes;
        break;
      default:
        return true;
    }

    return current >= max;
  };

  const validateAndBlock = (type: 'instancias' | 'contactos' | 'campanas' | 'conversaciones' | 'mensajes'): boolean => {
    if (!suscripcionActiva) {
      toast.error("No tienes un plan activo. Adquiere un plan para acceder a esta funcionalidad.", {
        duration: 5000,
        action: {
          label: "Ver Planes",
          onClick: () => window.location.href = "/dashboard/planes"
        }
      });
      return false;
    }

    const isAtLimit = checkLimit(type);

    if (isAtLimit) {
      const typeLabels = {
        instancias: 'instancias',
        contactos: 'contactos', 
        campanas: 'campañas',
        conversaciones: 'conversaciones',
        mensajes: 'mensajes recibidos'
      };

      const current = type === 'instancias' ? limits?.currentInstancias : 
                    type === 'contactos' ? limits?.currentContactos :
                    type === 'campanas' ? limits?.currentCampanas : 
                    type === 'conversaciones' ? limits?.currentConversaciones :
                    limits?.currentMensajes;
      const max = type === 'instancias' ? limits?.maxInstancias : 
                  type === 'contactos' ? limits?.maxContactos :
                  type === 'campanas' ? limits?.maxCampanas : 
                  type === 'conversaciones' ? limits?.maxConversaciones :
                  limits?.maxMensajes;

      toast.error(
        `Has alcanzado el límite de ${typeLabels[type]} (${current}/${max}). Actualiza tu plan para continuar.`,
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
    let mounted = true;

    const validateSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          if (mounted) {
            setIsExpired(true);
            setLoading(false);
          }
          return;
        }

        // Fetch active subscription with plan details
        const { data: suscripcion, error } = await supabase
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

        if (error) {
          console.error("Error fetching subscription:", error);
          if (mounted) {
            setIsExpired(true);
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          if (suscripcion && suscripcion.planes) {
            // Get current usage counts
            const [instancias, contactos, campanas, conversaciones, mensajes] = await Promise.all([
              supabase.from("instancias").select("id", { count: 'exact' }).eq("user_id", user.id),
              supabase.from("contacts").select("id", { count: 'exact' }).eq("user_id", user.id),
              supabase.from("campanas").select("id", { count: 'exact' }).eq("user_id", user.id),
              supabase.from("conversaciones")
                .select("id", { count: 'exact' })
                .in("instancia_nombre", 
                  (await supabase.from("instancias").select("nombre").eq("user_id", user.id))
                    .data?.map(i => i.nombre) || []
                ),
              supabase.from("mensajes")
                .select("id", { count: 'exact' })
                .eq("direccion", "recibido")
                .in("instancia", 
                  (await supabase.from("instancias").select("nombre").eq("user_id", user.id))
                    .data?.map(i => i.nombre) || []
                )
            ]);

            // Active subscription found
            setSuscripcionActiva(suscripcion);
            setLimits({
              maxInstancias: suscripcion.planes.max_instancias,
              maxContactos: suscripcion.planes.max_contactos,
              maxCampanas: suscripcion.planes.max_campanas,
              maxConversaciones: suscripcion.planes.max_conversaciones,
              maxMensajes: suscripcion.planes.max_mensajes || 1000,
              currentInstancias: instancias.count || 0,
              currentContactos: contactos.count || 0,
              currentCampanas: campanas.count || 0,
              currentConversaciones: conversaciones.count || 0,
              currentMensajes: mensajes.count || 0,
            });
            setIsExpired(false);
          } else {
            // No active subscription
            setIsExpired(true);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Error validating subscription:", error);
        if (mounted) {
          setIsExpired(true);
          setLoading(false);
        }
      }
    };

    // Start validation immediately
    validateSubscription();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    suscripcionActiva,
    limits,
    loading,
    isExpired,
    checkLimit,
    validateAndBlock
  };
};
