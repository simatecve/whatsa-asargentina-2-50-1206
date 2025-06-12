
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscriptionValidation } from "./useSubscriptionValidation";

export const useMessageLimits = () => {
  const { limits, suscripcionActiva, loading } = useSubscriptionValidation();
  const [isAtMessageLimit, setIsAtMessageLimit] = useState(false);
  const [messageUsage, setMessageUsage] = useState({ current: 0, max: 0 });

  const checkMessageLimit = useCallback(async () => {
    if (!limits || !suscripcionActiva || loading) return false;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Get user's instances
      const { data: userInstances } = await supabase
        .from("instancias")
        .select("nombre")
        .eq("user_id", user.id);

      if (!userInstances || userInstances.length === 0) return false;

      const instanceNames = userInstances.map(inst => inst.nombre);

      // Count received messages for this user's instances
      const { count: currentMessages } = await supabase
        .from("mensajes")
        .select("id", { count: 'exact' })
        .eq("direccion", "recibido")
        .in("instancia", instanceNames);

      const current = currentMessages || 0;
      const max = limits.maxMensajes;
      const atLimit = current >= max;

      setMessageUsage({ current, max });
      setIsAtMessageLimit(atLimit);

      return atLimit;
    } catch (error) {
      console.error("Error checking message limit:", error);
      return false;
    }
  }, [limits, suscripcionActiva, loading]);

  useEffect(() => {
    checkMessageLimit();
  }, [checkMessageLimit]);

  const validateMessageReceive = useCallback(async (): Promise<boolean> => {
    const atLimit = await checkMessageLimit();
    return !atLimit;
  }, [checkMessageLimit]);

  return {
    isAtMessageLimit,
    messageUsage,
    validateMessageReceive,
    checkMessageLimit
  };
};
