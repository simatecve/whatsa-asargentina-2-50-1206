
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { InstanceSelector } from "../InstanceSelector";
import { AgenteIAForm } from "../agenteIASchema";

interface AgenteFormConfigProps {
  form: UseFormReturn<AgenteIAForm>;
}

export const AgenteFormConfig = ({ form }: AgenteFormConfigProps) => {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="nombre_agente"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre del Agente *</FormLabel>
            <FormControl>
              <Input
                placeholder="Ej: Agente de Ventas, Soporte Técnico..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <InstanceSelector form={form} />

      <FormField
        control={form.control}
        name="prompt"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Prompt del Agente *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ingrese el prompt que definirá el comportamiento del agente IA..."
                className="min-h-[360px]"
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
