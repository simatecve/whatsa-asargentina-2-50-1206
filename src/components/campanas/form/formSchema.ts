
import * as z from "zod";

export const formSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  lista_id: z.string().min(1, "Debe seleccionar una lista de contactos"),
  mensaje: z.string().optional(),
  delay_minimo: z.coerce.number().min(1, "El delay mínimo debe ser al menos 1 segundo"),
  delay_maximo: z.coerce.number().min(1, "El delay máximo debe ser al menos 1 segundo"),
  webhook_id: z.string().optional(),
  instance_id: z.string().min(1, "Debe seleccionar una instancia para el envío"),
});

export type CampanaFormValues = z.infer<typeof formSchema>;
