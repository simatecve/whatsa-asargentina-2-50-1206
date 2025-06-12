
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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

interface CampanaFormNameProps {
  form: UseFormReturn<FormValues>;
}

export const CampanaFormName = ({ form }: CampanaFormNameProps) => {
  return (
    <FormField
      control={form.control}
      name="nombre"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nombre de la campaña</FormLabel>
          <FormControl>
            <Input placeholder="Ej: Promoción de Mayo" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
