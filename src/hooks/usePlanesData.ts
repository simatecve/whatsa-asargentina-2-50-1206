
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePlanesData = () => {
  const [planes, setPlanes] = useState([]);
  const [suscripcionActual, setSuscripcionActual] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      console.log('Usuario actual:', user.id);

      // Fetch available plans (exclude trial plans for regular users)
      const { data: planesData, error: planesError } = await supabase
        .from("planes")
        .select("*")
        .eq("estado", true)
        .neq("periodo", "trial") // Exclude trial plans from user view
        .order("precio");

      if (planesError) throw planesError;
      console.log('Planes obtenidos:', planesData);
      setPlanes(planesData || []);

      // Fetch current subscription
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

      if (suscripcionError && suscripcionError.code !== 'PGRST116') {
        console.error("Error fetching subscription:", suscripcionError);
        throw suscripcionError;
      }

      if (suscripcion) {
        setSuscripcionActual(suscripcion);
        console.log('Suscripción actual encontrada:', suscripcion);
      } else {
        setSuscripcionActual(null);
        console.log('No se encontró suscripción activa');
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    planes,
    suscripcionActual,
    loading,
    refetchData: fetchData
  };
};
