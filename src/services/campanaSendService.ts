
import { supabase } from "@/integrations/supabase/client";
import { Campana } from "@/components/campanas/types";

export const validateCampanaForSending = async (campana: Campana) => {
  // Verificar que la campaña tenga una instancia asignada
  if (!campana.instance_id) {
    throw new Error("Esta campaña no tiene una instancia asignada para el envío");
  }
  
  // Obtener la instancia seleccionada
  const { data: instance, error: instanceError } = await supabase
    .from("instancias")
    .select("nombre, webhook, estado")
    .eq("id", campana.instance_id)
    .single();
  
  if (instanceError || !instance) {
    throw new Error("No se pudo obtener información de la instancia");
  }
  
  // Verificar que la instancia esté conectada
  if (instance.estado !== "connected") {
    throw new Error(`La instancia ${instance.nombre} no está conectada. Por favor, conéctela primero.`);
  }
  
  return instance;
};

export const getContactsForCampana = async (listaId: string) => {
  const { data: contactos, error: contactosError } = await supabase
    .from("contacts")
    .select("id, name, phone_number")
    .eq("list_id", listaId);
  
  if (contactosError) throw contactosError;
  
  return contactos || [];
};

export const sendToWebhook = async (webhookData: any) => {
  const webhookUrl = `https://n8n2025.nocodeveloper.com/webhook/f7ea0c8e-75fe-40e8-9b1c-20ba2054c064`;
  
  console.log('Enviando al webhook con ID de campaña:', webhookData.campana_id);
  
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...webhookData,
      // Asegurar que el campana_id esté siempre presente
      campana_id: webhookData.campana_id,
      id_campana: webhookData.campana_id // Alternativa por si necesitan otro nombre
    })
  });
  
  if (!response.ok) {
    throw new Error(`Error en la respuesta del webhook: ${response.statusText}`);
  }
  
  return response;
};

export const updateCampanaStatus = async (campanaId: string, estado: string) => {
  const { error: updateError } = await supabase
    .from("campanas")
    .update({
      estado: estado,
      fecha_inicio: new Date().toISOString()
    })
    .eq("id", campanaId);
  
  if (updateError) throw updateError;
};
