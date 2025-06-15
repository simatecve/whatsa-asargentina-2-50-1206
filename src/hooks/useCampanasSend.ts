
import { useState } from "react";
import { toast } from "sonner";
import { Campana } from "@/components/campanas/types";
import { 
  validateCampanaForSending, 
  getContactsForCampana, 
  sendToWebhook, 
  updateCampanaStatus 
} from "@/services/campanaSendService";

export const useCampanasSend = () => {
  const [sendingCampana, setSendingCampana] = useState<string | null>(null);
  
  const handleSendCampana = async (campana: Campana, onSuccess?: () => void) => {
    try {
      setSendingCampana(campana.id);
      
      console.log('Iniciando envío de campaña con ID:', campana.id);
      
      // Validar la campaña y obtener la instancia
      const instance = await validateCampanaForSending(campana);
      
      // Obtener los contactos
      const contactos = await getContactsForCampana(campana.lista_id);
      
      // Preparar los datos para enviar al webhook
      const webhookData = {
        campana_id: campana.id, // ID principal de la campaña
        id_campana: campana.id, // ID alternativo por compatibilidad
        nombre_campana: campana.nombre,
        lista_id: campana.lista_id,
        lista_nombre: campana.lista_nombre,
        mensaje: campana.mensaje,
        archivo_url: campana.archivo_url,
        delay_minimo: campana.delay_minimo,
        delay_maximo: campana.delay_maximo,
        total_contactos: campana.total_contactos,
        contactos: contactos,
        contactos_ids: contactos.map(contacto => contacto.id),
        instance_id: campana.instance_id,
        instance: {
          id: campana.instance_id,
          nombre: instance.nombre,
          webhook: instance.webhook
        }
      };
      
      console.log('Datos del webhook preparados:', {
        campana_id: webhookData.campana_id,
        total_contactos: webhookData.total_contactos,
        instance_nombre: webhookData.instance.nombre
      });
      
      // Enviar los datos al webhook
      await sendToWebhook(webhookData);
      
      // Actualizar el estado de la campaña
      await updateCampanaStatus(campana.id, "en_progreso");
      
      toast.success("Campaña enviada correctamente", {
        description: `Se ha iniciado el proceso de envío para ${campana.total_contactos} contactos usando la instancia ${instance.nombre}.`,
      });
      
      // Llamar callback de éxito si se proporciona
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error("Error al enviar campaña:", error);
      toast.error(error instanceof Error ? error.message : "Error al enviar la campaña");
    } finally {
      setSendingCampana(null);
    }
  };

  return {
    sendingCampana,
    handleSendCampana
  };
};
