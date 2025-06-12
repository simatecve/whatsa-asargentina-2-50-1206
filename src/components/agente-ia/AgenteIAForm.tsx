
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { agenteIASchema, AgenteIAForm as AgenteIAFormType } from "./agenteIASchema";
import { AgenteFormConfig } from "./form/AgenteFormConfig";
import { AgenteBotSettings } from "./form/AgenteBotSettings";
import { AgenteFormActions } from "./form/AgenteFormActions";
import { useAgenteFormSubmit } from "./form/useAgenteFormSubmit";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface AgenteIAFormProps {
  onBack: () => void;
  onSave: () => void;
  editingConfig?: any;
}

export const AgenteIAForm = ({ onBack, onSave, editingConfig }: AgenteIAFormProps) => {
  console.log("Editing config received:", editingConfig);

  const form = useForm<AgenteIAFormType>({
    resolver: zodResolver(agenteIASchema),
    defaultValues: {
      nombre_agente: editingConfig?.nombre_agente || "",
      instance_name: editingConfig?.instance_name || "",
      prompt: editingConfig?.prompt || "",
      stop_bot_from_me: Boolean(editingConfig?.stop_bot_from_me),
      is_active: editingConfig?.is_active !== undefined ? Boolean(editingConfig.is_active) : true
    }
  });

  console.log("Form default values:", form.getValues());

  const { saving, onSubmit } = useAgenteFormSubmit(editingConfig, onSave);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <h2 className="text-xl font-semibold">
          {editingConfig ? "Editar Agente IA" : "Crear Nuevo Agente IA"}
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuración del Agente</CardTitle>
          <CardDescription>
            Configure su agente de inteligencia artificial para una instancia específica de WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <AgenteFormConfig form={form} />
              <AgenteBotSettings form={form} />
              <AgenteFormActions 
                saving={saving} 
                editingConfig={editingConfig} 
                onBack={onBack} 
              />
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
