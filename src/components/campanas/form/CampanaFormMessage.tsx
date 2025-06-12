
import { MessageSquare } from "lucide-react";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  lista_id: z.string().min(1, "Debe seleccionar una lista de contactos"),
  mensaje: z.string().optional(),
  delay_minimo: z.coerce.number().min(1, "El delay mínimo debe ser al menos 1 segundo"),
  delay_maximo: z.coerce.number().min(1, "El delay máximo debe ser al menos 1 segundo"),
  webhook_id: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CampanaFormMessageProps {
  form: UseFormReturn<FormValues>;
}

export const CampanaFormMessage = ({ form }: CampanaFormMessageProps) => {
  return (
    <div>
      <div className="flex items-center mb-2">
        <MessageSquare className="mr-2 h-4 w-4 text-azul-500" />
        <h3 className="font-medium">Mensaje</h3>
      </div>
      <FormField
        control={form.control}
        name="mensaje"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Textarea 
                placeholder="Escriba el mensaje que desea enviar..." 
                className="h-32"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
