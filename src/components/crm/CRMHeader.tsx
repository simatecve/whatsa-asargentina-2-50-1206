
import { MessageSquare } from "lucide-react";
import { InstanceSelector } from "./InstanceSelector";

interface CRMHeaderProps {
  selectedInstanceId: string;
  onInstanceChange: (instanceId: string) => void;
  messageUsage: {
    current: number;
    max: number;
  };
  isExpired?: boolean;
}

export const CRMHeader = ({
  selectedInstanceId,
  onInstanceChange,
  messageUsage,
  isExpired
}: CRMHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-white">
      {/* Desktop view */}
      <div className="hidden md:flex items-center space-x-2">
        <MessageSquare className="h-8 w-8 text-green-600" />
        <div>
          <p className="text-muted-foreground">
            Gestione todas sus conversaciones de WhatsApp
            <span className="ml-2 text-sm">
              ({messageUsage.current}/{messageUsage.max} mensajes recibidos)
            </span>
            {isExpired && (
              <span className="ml-2 text-sm text-red-600">
                - Plan vencido, funcionalidad limitada
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Mobile view */}
      <div className="md:hidden flex items-center justify-between w-full">
        <div className="text-sm text-muted-foreground">
          <span>Mensajes ({messageUsage.current}/{messageUsage.max})</span>
        </div>
      </div>

      <InstanceSelector 
        selectedInstanceId={selectedInstanceId} 
        onInstanceChange={onInstanceChange} 
      />
    </div>
  );
};
