
import React from "react";
import { CardTitle } from "@/components/ui/card";
import { Smartphone } from "lucide-react";

interface Instance {
  id: string;
  nombre: string;
  estado: string;
  fecha_creacion: string;
  qr_code?: string;
  webhook?: string;
  is_active?: boolean;
}

interface InstanceCardHeaderProps {
  instance: Instance;
  colors: {
    bg: string;
    border: string;
    text: string;
    icon: string;
    name: string;
  };
}

export const InstanceCardHeader = ({ instance, colors }: InstanceCardHeaderProps) => {
  return (
    <div className="flex items-center space-x-3">
      <div className={`p-2 rounded-lg bg-white border ${colors.border}`}>
        <Smartphone className={`h-5 w-5 ${colors.icon}`} />
      </div>
      <div className="flex-1">
        <CardTitle className={`text-lg ${colors.text}`}>
          {instance.nombre}
        </CardTitle>
        <p className="text-sm text-gray-600">
          Creada: {new Date(instance.fecha_creacion).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};
