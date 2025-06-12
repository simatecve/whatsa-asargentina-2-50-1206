
import { supabase } from "@/integrations/supabase/client";
import { Campana } from "@/components/campanas/types";

export const fetchCampanasData = async (estado: string, userId: string) => {
  let query = supabase
    .from("campanas")
    .select("*, instancias(nombre)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  // Solo filtrar por estado si no es "todas"
  if (estado !== "todas") {
    query = query.eq("estado", estado);
  }

  const { data: campanasData, error } = await query;
  
  if (error) throw error;
  
  return campanasData || [];
};

export const enrichCampanaWithDetails = async (campana: any): Promise<Campana> => {
  // Obtener nombre de la lista
  const { data: listaData } = await supabase
    .from("contact_lists")
    .select("name")
    .eq("id", campana.lista_id)
    .single();
  
  // Obtener conteo de envíos
  const { count: totalContactos } = await supabase
    .from("campana_envios")
    .select("*", { count: "exact", head: true })
    .eq("campana_id", campana.id);
  
  const { count: enviadosCount } = await supabase
    .from("campana_envios")
    .select("*", { count: "exact", head: true })
    .eq("campana_id", campana.id)
    .eq("estado", "enviado");
  
  const pendientesCount = (totalContactos || 0) - (enviadosCount || 0);
  
  return {
    ...campana,
    lista_nombre: listaData?.name || "Lista desconocida",
    total_contactos: totalContactos || 0,
    enviados: enviadosCount || 0,
    pendientes: pendientesCount,
    instance_nombre: campana.instancias?.nombre || "Sin instancia"
  };
};

export const deleteCampana = async (id: string) => {
  // Primero eliminar los envíos asociados
  await supabase
    .from("campana_envios")
    .delete()
    .eq("campana_id", id);
  
  // Luego eliminar la campaña
  const { error } = await supabase
    .from("campanas")
    .delete()
    .eq("id", id);
  
  if (error) throw error;
};
