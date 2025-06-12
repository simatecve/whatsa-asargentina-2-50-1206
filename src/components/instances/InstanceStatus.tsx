
import { Wifi, WifiOff } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface InstanceStatusProps {
  estado: string;
}

export const InstanceStatus = ({ estado }: InstanceStatusProps) => {
  return (
    <div className="flex items-center justify-center h-32 bg-gray-50 border rounded-md">
      {estado === 'disconnected' ? (
        <div className="text-center">
          <WifiOff className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Instancia desconectada</p>
        </div>
      ) : estado === 'connected' ? (
        <div className="text-center">
          <Wifi className="h-8 w-8 mx-auto text-green-500 mb-2" />
          <p className="text-sm text-gray-500">Instancia conectada</p>
        </div>
      ) : (
        <Wifi className="h-10 w-10 text-gray-300" />
      )}
    </div>
  );
};
