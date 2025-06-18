
import { supabase } from "@/integrations/supabase/client";

export const useInstancesStats = () => {
  const getInstancesStats = async (userId: string) => {
    const { data: instances, error: instancesError } = await supabase
      .from('instancias')
      .select('estado, nombre')
      .eq('user_id', userId);

    if (instancesError) {
      console.error("Error obteniendo instancias:", instancesError);
      throw instancesError;
    }

    const totalInstances = instances?.length || 0;
    const connectedInstances = instances?.filter(i => i.estado === 'connected').length || 0;
    const instanceNames = instances?.map(i => i.nombre) || [];

    console.log(`Instancias: ${connectedInstances}/${totalInstances}`);

    return {
      totalInstances,
      connectedInstances,
      instanceNames
    };
  };

  return { getInstancesStats };
};
