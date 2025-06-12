
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { AgenteIAForm } from "../agenteIASchema";

interface AgenteBotSettingsProps {
  form: UseFormReturn<AgenteIAForm>;
}

export const AgenteBotSettings = ({ form }: AgenteBotSettingsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Estado del Agente</h3>
        
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Agente Activo
                </FormLabel>
                <div className="text-sm text-muted-foreground">
                  Activar o desactivar el agente IA para esta instancia
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Configuración de Control</h3>
        
        <FormField
          control={form.control}
          name="stop_bot_from_me"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Detener Bot con Mis Mensajes
                </FormLabel>
                <div className="text-sm text-muted-foreground">
                  Sus mensajes pueden detener el bot automáticamente
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
