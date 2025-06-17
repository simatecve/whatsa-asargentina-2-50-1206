
import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMessageLimits } from "./useMessageLimits";
import { toast } from "sonner";

export const useBotAutoDisable = () => {
  const { isAtMessageLimit, messageUsage } = useMessageLimits();

  const disableAllBots = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('Disabling all bots due to message limit reached');

      const { error } = await supabase
        .from("agente_ia_config")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (error) {
        console.error("Error disabling bots:", error);
        return;
      }

      toast.warning("Todos los bots han sido desactivados automáticamente por alcanzar el límite de mensajes del plan");
    } catch (error) {
      console.error("Exception disabling bots:", error);
    }
  }, []);

  useEffect(() => {
    if (isAtMessageLimit && messageUsage.current >= messageUsage.max) {
      disableAllBots();
    }
  }, [isAtMessageLimit, messageUsage, disableAllBots]);

  return {
    isAtMessageLimit,
    messageUsage
  };
};
