
import { Bot } from "lucide-react";

export const AgenteIAHeader = () => {
  return (
    <div className="flex items-center space-x-2">
      <Bot className="h-8 w-8 text-blue-600" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Agentes IA</h1>
        <p className="text-muted-foreground">
          Configure agentes de inteligencia artificial para sus instancias de WhatsApp
        </p>
      </div>
    </div>
  );
};
