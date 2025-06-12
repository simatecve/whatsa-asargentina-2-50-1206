
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useSuscripcionesData = () => {
  const [suscripciones, setSuscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todas");

  const fetchSuscripciones = async () => {
    setLoading(true);
    try {
      const { data: suscripcionesData, error: suscripcionesError } = await supabase
        .from("suscripciones")
        .select(`
          *,
          planes!inner(*),
          usuarios!inner(user_id, nombre, email)
        `)
        .order("created_at", { ascending: false });

      if (suscripcionesError) throw suscripcionesError;
      setSuscripciones(suscripcionesData || []);
    } catch (error) {
      console.error("Error fetching suscripciones:", error);
      toast.error("Error al cargar las suscripciones");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSuscripcion = async (id: string) => {
    if (window.confirm("¿Está seguro de cancelar esta suscripción?")) {
      try {
        const { error } = await supabase
          .from("suscripciones")
          .update({ estado: "cancelada" })
          .eq("id", id);

        if (error) throw error;
        toast.success("Suscripción cancelada correctamente");
        fetchSuscripciones();
      } catch (error) {
        console.error("Error canceling subscription:", error);
        toast.error("Error al cancelar la suscripción");
      }
    }
  };

  const handleEliminarSuscripcion = async (id: string) => {
    try {
      const { error } = await supabase
        .from("suscripciones")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Suscripción eliminada correctamente");
      fetchSuscripciones();
    } catch (error) {
      console.error("Error deleting subscription:", error);
      toast.error("Error al eliminar la suscripción");
    }
  };

  const handleExtenderSuscripcion = async (id: string, meses = 1) => {
    try {
      const { data: suscripcion, error: fetchError } = await supabase
        .from("suscripciones")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const fechaFinActual = new Date(suscripcion.fecha_fin);
      const nuevaFechaFin = new Date(fechaFinActual);
      nuevaFechaFin.setMonth(nuevaFechaFin.getMonth() + meses);

      const { error } = await supabase
        .from("suscripciones")
        .update({
          fecha_fin: nuevaFechaFin.toISOString(),
          estado: "activa"
        })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Suscripción extendida por ${meses} mes(es)`);
      fetchSuscripciones();
    } catch (error) {
      console.error("Error extending subscription:", error);
      toast.error("Error al extender la suscripción");
    }
  };

  const filteredSuscripciones = suscripciones.filter(suscripcion => {
    if (filter !== "todas" && suscripcion.estado !== filter) return false;

    const searchTerm = search.toLowerCase();
    return (
      suscripcion.usuarios?.nombre?.toLowerCase().includes(searchTerm) ||
      suscripcion.usuarios?.email?.toLowerCase().includes(searchTerm) ||
      suscripcion.planes?.nombre?.toLowerCase().includes(searchTerm)
    );
  });

  useEffect(() => {
    fetchSuscripciones();
  }, []);

  return {
    suscripciones: filteredSuscripciones,
    loading,
    search,
    filter,
    setSearch,
    setFilter,
    fetchSuscripciones,
    handleCancelSuscripcion,
    handleEliminarSuscripcion,
    handleExtenderSuscripcion
  };
};
