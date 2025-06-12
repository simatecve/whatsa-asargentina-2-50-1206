import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

// Importar componentes refactorizados
import { formSchema, CampanaFormValues } from "./form/formSchema";
import { CampanaFormName } from "./form/CampanaFormName";
import { CampanaFormContactList } from "./form/CampanaFormContactList";
import { CampanaFormMessage } from "./form/CampanaFormMessage";
import { CampanaFormFileUpload } from "./form/CampanaFormFileUpload";
import { CampanaFormDeliveryConfig } from "./form/CampanaFormDeliveryConfig";
import { CampanaFormActions } from "./form/CampanaFormActions";
import { CampanaFormInstanceSelect } from "./form/CampanaFormInstanceSelect";

type CampanaFormProps = {
  onCancel: () => void;
  onSuccess: () => void;
};

export const CampanaForm = ({ onCancel, onSuccess }: CampanaFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [webhooks, setWebhooks] = useState<Array<{ id: string; nombre: string; url: string; }>>([]);
  
  const form = useForm<CampanaFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      mensaje: "",
      delay_minimo: 1,
      delay_maximo: 3,
      webhook_id: webhooks.length > 0 ? webhooks[0].id : undefined,
    },
  });
  
  const handleFileUploaded = (url: string) => {
    setFileUrl(url || null);
  };
  
  const onSubmit = async (values: CampanaFormValues) => {
    if (!values.mensaje && !fileUrl) {
      toast.error("Debe proporcionar un mensaje o adjuntar un archivo");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Obtener el ID del usuario actual
      const { data } = await supabase.auth.getUser();
      
      if (!data.user) {
        toast.error("Usuario no autenticado");
        return;
      }
      
      console.log('Creando campaña con archivo URL:', fileUrl);
      
      // Crear la campaña en la base de datos
      const { data: campana, error: campanaError } = await supabase
        .from("campanas")
        .insert({
          nombre: values.nombre,
          lista_id: values.lista_id,
          mensaje: values.mensaje,
          archivo_url: fileUrl,
          delay_minimo: values.delay_minimo,
          delay_maximo: values.delay_maximo,
          webhook_id: values.webhook_id,
          instance_id: values.instance_id,
          user_id: data.user.id,
          estado: "pendiente",
        })
        .select()
        .single();
        
      if (campanaError) {
        console.error('Error al crear campaña:', campanaError);
        throw campanaError;
      }
      
      console.log('Campaña creada exitosamente:', campana);
      
      // Si la campaña se creó correctamente, crear los registros de envíos
      if (campana) {
        const { data: contacts, error: contactsError } = await supabase
          .from("contacts")
          .select("id")
          .eq("list_id", values.lista_id);
          
        if (contactsError) throw contactsError;
        
        if (contacts && contacts.length > 0) {
          // Preparar los registros de envío para todos los contactos
          const envios = contacts.map(contact => ({
            campana_id: campana.id,
            contacto_id: contact.id,
            estado: "pendiente"
          }));
          
          // Insertar los registros de envío
          const { error: enviosError } = await supabase
            .from("campana_envios")
            .insert(envios);
            
          if (enviosError) throw enviosError;
        }

        // Obtener el webhook seleccionado
        const selectedWebhook = webhooks.find(w => w.id === values.webhook_id);
        
        // Si hay un webhook configurado, realizar la petición
        if (selectedWebhook) {
          try {
            const webhookUrl = selectedWebhook.url.startsWith('http') 
              ? selectedWebhook.url 
              : `https://${selectedWebhook.url}`;
              
            // Obtener datos de la instancia
            let instanceData = null;
            if (values.instance_id) {
              const { data: instance } = await supabase
                .from("instancias")
                .select("nombre, webhook")
                .eq("id", values.instance_id)
                .single();
                
              if (instance) {
                instanceData = {
                  id: values.instance_id,
                  nombre: instance.nombre,
                  webhook: instance.webhook
                };
              }
            }
            
            // Obtener los contactos de la lista
            const { data: contactList } = await supabase
              .from("contacts")
              .select("id, name, phone_number")
              .eq("list_id", values.lista_id);
              
            const webhookPayload = {
              campana_id: campana.id,
              nombre_campana: values.nombre,
              lista_id: values.lista_id,
              mensaje: values.mensaje,
              archivo_url: fileUrl,
              delay_minimo: values.delay_minimo,
              delay_maximo: values.delay_maximo,
              total_contactos: contactList?.length || 0,
              contactos: contactList || [],
              contactos_ids: contactList ? contactList.map(contacto => contacto.id) : [],
              instance_id: values.instance_id,
              instance: instanceData
            };
            
            const response = await fetch(webhookUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(webhookPayload)
            });
            
            if (!response.ok) {
              console.error("Error al enviar al webhook:", response.statusText);
              toast.error("La campaña se creó pero hubo un error al iniciar el proceso de envío");
            }
          } catch (webhookError) {
            console.error("Error al enviar al webhook:", webhookError);
            toast.error("La campaña se creó pero hubo un error al iniciar el proceso de envío");
          }
        }
        
        toast.success("Campaña creada correctamente", {
          description: `Se han programado ${contacts?.length || 0} mensajes para envío`,
        });
        
        onSuccess();
      }
    } catch (error) {
      console.error("Error al crear la campaña:", error);
      toast.error("Error al crear la campaña");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <CampanaFormName form={form} />
        <CampanaFormContactList form={form} />
        
        <div className="space-y-4">
          <CampanaFormMessage form={form} />
          <CampanaFormFileUpload 
            onFileUploaded={handleFileUploaded} 
            currentFileUrl={fileUrl}
          />
        </div>
        
        <Separator className="my-4" />
        
        <CampanaFormInstanceSelect form={form} />
        <CampanaFormDeliveryConfig form={form} webhooks={webhooks} />
        <CampanaFormActions onCancel={onCancel} isSubmitting={isSubmitting} />
      </form>
    </Form>
  );
};
