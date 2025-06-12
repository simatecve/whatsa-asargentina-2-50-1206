
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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MessageSquare, Info } from "lucide-react";
import { normalizePhoneNumber } from "@/utils/contactValidation";

const formSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  phone_number: z
    .string()
    .min(1, "El número de teléfono es obligatorio")
    .regex(/^\+?[0-9]{8,15}$/, "Ingrese un número de teléfono válido"),
});

type ManualContactFormProps = {
  listId: string;
  onContactAdded: () => void;
};

export const ManualContactForm = ({ listId, onContactAdded }: ManualContactFormProps) => {
  const [loading, setLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone_number: "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      // Normalizar el número de teléfono si no tiene código de país
      let phoneNumber = normalizePhoneNumber(values.phone_number);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");
      
      const { error } = await supabase
        .from("contacts")
        .insert({
          list_id: listId,
          name: values.name,
          phone_number: phoneNumber,
          user_id: user.id
        });
        
      if (error) throw error;
      
      toast.success("Contacto agregado", { description: "El contacto ha sido agregado correctamente." });
      form.reset();
      onContactAdded();
    } catch (error) {
      console.error("Error al agregar contacto:", error);
      toast.error("Error al agregar el contacto");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="mr-2 h-5 w-5 text-green-500" />
          Añadir Contacto de WhatsApp
        </CardTitle>
        <CardDescription>
          Ingresa los datos del contacto para añadirlo a tu lista
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del contacto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Número de WhatsApp</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Incluye el código del país (ej: +34612345678)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormControl>
                    <Input 
                      placeholder="+34612345678" 
                      {...field} 
                      type="tel"
                      className="pl-10"
                    />
                  </FormControl>
                  <div className="relative -mt-9 left-3 pointer-events-none">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="mt-9"></div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full bg-green-500 hover:bg-green-600" disabled={loading}>
              <MessageSquare className="mr-2 h-4 w-4" />
              {loading ? "Añadiendo..." : "Añadir Contacto de WhatsApp"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
