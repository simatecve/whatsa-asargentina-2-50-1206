
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
    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
      {/* Desktop view */}
      <div className="hidden md:flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-sm">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Centro de Mensajería
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gestione todas sus conversaciones de WhatsApp
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {messageUsage.current}/{messageUsage.max} mensajes
            </span>
          </div>
          {isExpired && (
            <div className="px-4 py-2 bg-red-50 dark:bg-red-900 rounded-lg border border-red-200 dark:border-red-700">
              <span className="text-sm font-medium text-red-600 dark:text-red-300">
                Plan vencido - Funcionalidad limitada
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile view */}
      <div className="md:hidden flex items-center justify-between w-full">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Mensajería</h1>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <span>{messageUsage.current}/{messageUsage.max} mensajes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center">
        <InstanceSelector 
          selectedInstanceId={selectedInstanceId} 
          onInstanceChange={onInstanceChange} 
        />
      </div>
    </div>
  );
};
