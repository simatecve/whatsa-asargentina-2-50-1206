
import { useState } from "react";
import { whatsappService } from "@/services/whatsappService";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Conversation } from "@/types/crm";
import { useBotContactStatus } from "./useBotContactStatus";

interface UseMessageSenderProps {
  conversation: Conversation;
  onMessageSent?: (message: string) => void;
  updateConversationAfterSend?: (conversation: Conversation, message: string) => Promise<void>;
}

export const useMessageSender = ({ conversation, onMessageSent, updateConversationAfterSend }: UseMessageSenderProps) => {
  const [sending, setSending] = useState(false);
  const { deactivateBotForContact } = useBotContactStatus();

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || sending) return;

    console.log('Sending message:', {
      conversation: conversation.id,
      instanceName: conversation.instancia_nombre,
      number: conversation.numero_contacto,
      message: messageText.trim()
    });

    setSending(true);
    
    try {
      const instanceName = conversation.instancia_nombre;
      
      if (!instanceName) {
        throw new Error("No se encontró el nombre de la instancia");
      }

      if (!conversation.numero_contacto) {
        throw new Error("No se encontró el número de contacto");
      }

      // Actualizar la conversación inmediatamente en la UI
      if (updateConversationAfterSend) {
        console.log('Updating conversation immediately in UI...');
        await updateConversationAfterSend(conversation, messageText);
      }

      // Callback para notificar que se envió el mensaje (esto actualiza la UI inmediatamente)
      if (onMessageSent) {
        onMessageSent(messageText);
      }

      console.log('Calling WhatsApp API...');
      const response = await whatsappService.sendText({
        instanceName: instanceName,
        number: conversation.numero_contacto,
        text: messageText,
        linkPreview: true
      });

      console.log('Message sent via API:', response);

      console.log('Saving message to database...');
      const { error: dbError } = await supabase.from('mensajes').insert({
        instancia: instanceName,
        numero: conversation.numero_contacto,
        pushname: conversation.nombre_contacto,
        mensaje: messageText,
        tipo_mensaje: 'texto',
        direccion: 'enviado',
        conversation_id: conversation.id,
        estado_lectura: false,
        created_at: new Date().toISOString()
      });

      if (dbError) {
        console.error('Error saving message to database:', dbError);
        throw dbError;
      } else {
        console.log('Message saved to database successfully');
      }

      // Desactivar bot para este contacto
      console.log('Deactivating bot for contact...');
      await deactivateBotForContact(conversation.numero_contacto, instanceName);

    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = "No se pudo enviar el mensaje. Intente nuevamente.";
      
      if (error instanceof Error) {
        if (error.message.includes('configurado') || error.message.includes('configuración')) {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error al enviar mensaje",
        description: errorMessage,
        variant: "destructive"
      });

      throw error;
    } finally {
      setSending(false);
    }
  };

  return { sendMessage, sending };
};
