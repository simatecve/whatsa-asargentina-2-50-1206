
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
});

type ContactListFormProps = {
  list?: {
    id: string;
    name: string;
    description: string | null;
  } | null;
  onClose: () => void;
};

export const ContactListForm = ({ list, onClose }: ContactListFormProps) => {
  const [loading, setLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: list?.name || "",
      description: list?.description || "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      if (list) {
        // Actualizar lista existente
        const { error } = await supabase
          .from("contact_lists")
          .update({
            name: values.name,
            description: values.description || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", list.id);
          
        if (error) throw error;
        toast.success("Lista actualizada", { description: "La lista ha sido actualizada correctamente." });
      } else {
        // Crear nueva lista
        const { error } = await supabase
          .from("contact_lists")
          .insert({
            name: values.name,
            description: values.description || null,
            user_id: (await supabase.auth.getUser()).data.user?.id
          });
          
        if (error) throw error;
        toast.success("Lista creada", { description: "La lista ha sido creada correctamente." });
      }
      
      onClose();
    } catch (error) {
      console.error("Error al guardar lista:", error);
      toast.error(`Error al ${list ? "actualizar" : "crear"} la lista`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Ingrese el nombre de la lista" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Ingrese una descripción opcional para la lista" 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : list ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
