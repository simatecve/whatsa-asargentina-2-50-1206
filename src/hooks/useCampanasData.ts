
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Campana } from "@/components/campanas/types";
import { fetchCampanasData, enrichCampanaWithDetails, deleteCampana } from "@/services/campanasService";
import { useCampanasSend } from "./useCampanasSend";

export const useCampanasData = (estado: string) => {
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [loading, setLoading] = useState(true);
  const { sendingCampana, handleSendCampana } = useCampanasSend();
  
  const fetchCampanas = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Usuario no autenticado");
        return;
      }
      
      // Obtener las campañas base
      const campanasData = await fetchCampanasData(estado, user.id);
      
      // Enriquecer cada campaña con información adicional
      const campanasWithInfo = await Promise.all(
        campanasData.map(campana => enrichCampanaWithDetails(campana))
      );
      
      setCampanas(campanasWithInfo);
    } catch (error) {
      console.error("Error al cargar campañas:", error);
      toast.error("Error al cargar las campañas");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCampanas();
  }, [estado]);
  
  const handleDeleteCampana = async (id: string) => {
    if (window.confirm("¿Está seguro de que desea eliminar esta campaña? Esta acción no se puede deshacer.")) {
      try {
        await deleteCampana(id);
        toast.success("Campaña eliminada correctamente");
        fetchCampanas();
      } catch (error) {
        console.error("Error al eliminar campaña:", error);
        toast.error("Error al eliminar la campaña");
      }
    }
  };
  
  const handleSendCampanaWithRefresh = async (campana: Campana) => {
    await handleSendCampana(campana, fetchCampanas);
  };

  return {
    campanas,
    loading,
    sendingCampana,
    fetchCampanas,
    handleDeleteCampana,
    handleSendCampana: handleSendCampanaWithRefresh
  };
};
