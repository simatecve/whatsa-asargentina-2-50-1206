
import { z } from "zod";

export const agenteIASchema = z.object({
  nombre_agente: z.string().min(1, "El nombre del agente es requerido"),
  instance_name: z.string().min(1, "Debe seleccionar una instancia"),
  prompt: z.string().min(1, "El prompt es requerido"),
  stop_bot_from_me: z.boolean().default(false),
  is_active: z.boolean().default(true)
});

export type AgenteIAForm = z.infer<typeof agenteIASchema>;
