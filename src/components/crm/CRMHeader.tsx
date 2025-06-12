
import { MessageSquare } from "lucide-react";
import { InstanceSelector } from "./InstanceSelector";

interface CRMHeaderProps {
  selectedInstanceId: string;
  onInstanceChange: (instanceId: string) => void;
  conversationsCount: number;
  maxConversations?: number;
  isExpired?: boolean;
}

export const CRMHeader = ({
  selectedInstanceId,
  onInstanceChange,
  conversationsCount,
  maxConversations,
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
            {maxConversations && (
              <span className="ml-2 text-sm">
                ({conversationsCount}/{maxConversations} conversaciones activas)
              </span>
            )}
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
          {maxConversations ? (
            <span>Activas ({conversationsCount}/{maxConversations})</span>
          ) : (
            <span>Activas ({conversationsCount})</span>
          )}
        </div>
      </div>

      <InstanceSelector 
        selectedInstanceId={selectedInstanceId} 
        onInstanceChange={onInstanceChange} 
      />
    </div>
  );
};
