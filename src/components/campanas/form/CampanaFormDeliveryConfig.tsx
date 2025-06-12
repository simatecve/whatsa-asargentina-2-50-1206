
import { Clock } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface Webhook {
  id: string;
  nombre: string;
  url: string;
}

interface CampanaFormDeliveryConfigProps {
  form: UseFormReturn<FormValues>;
  webhooks: Webhook[];
}

export const CampanaFormDeliveryConfig = ({ form, webhooks }: CampanaFormDeliveryConfigProps) => {
  return (
    <div>
      <div className="flex items-center mb-2">
        <Clock className="mr-2 h-4 w-4 text-azul-500" />
        <h3 className="font-medium">Configuración de envío</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="delay_minimo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delay mínimo (segundos)</FormLabel>
              <FormControl>
                <Input type="number" min={1} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="delay_maximo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delay máximo (segundos)</FormLabel>
              <FormControl>
                <Input type="number" min={1} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {webhooks.length > 0 && (
        <FormField
          control={form.control}
          name="webhook_id"
          render={({ field }) => (
            <FormItem className="mt-4">
              <FormLabel>Webhook de procesamiento</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un webhook" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {webhooks.map((webhook) => (
                    <SelectItem key={webhook.id} value={webhook.id}>
                      {webhook.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};
