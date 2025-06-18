
import { supabase } from "@/integrations/supabase/client";

export const useSubscriptionData = () => {
  const getSubscriptionData = async (userId: string) => {
    const { data: suscripcion, error: suscripcionError } = await supabase
      .from("suscripciones")
      .select(`
        *,
        planes(*)
      `)
      .eq("user_id", userId)
      .eq("estado", "activa")
      .gt("fecha_fin", new Date().toISOString())
      .order("fecha_fin", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (suscripcionError) {
      console.error("Error obteniendo suscripción:", suscripcionError);
    }

    return {
      suscripcion,
      maxMessages: suscripcion?.planes?.max_mensajes || 0,
      maxCampanas: suscripcion?.planes?.max_campanas || 0
    };
  };

  return { getSubscriptionData };
};
