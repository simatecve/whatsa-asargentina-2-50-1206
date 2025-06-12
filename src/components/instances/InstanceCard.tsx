
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { InstanceCardHeader } from "./InstanceCardHeader";
import { InstanceCardActions } from "./InstanceCardActions";
import { InstanceStatus } from "./InstanceStatus";
import { getInstanceColorByName } from "@/utils/instanceColors";

interface Instance {
  id: string;
  nombre: string;
  estado: string;
  fecha_creacion: string;
  qr_code?: string;
  webhook?: string;
  is_active?: boolean;
  color?: string;
}

interface InstanceCardProps {
  instance: Instance;
  allInstances: Instance[];
  onConnect: (instance: Instance) => void;
  onDisconnect: (instanceId: string) => void;
  onDelete: (instanceId: string) => void;
  onToggleWebhook: (instanceId: string) => void;
  onColorChange?: (instanceName: string, newColor: string) => void;
}

export const InstanceCard = ({ 
  instance, 
  allInstances,
  onConnect, 
  onDisconnect, 
  onDelete, 
  onToggleWebhook,
  onColorChange
}: InstanceCardProps) => {
  const [colors, setColors] = useState({
    bg: 'bg-green-50',
    border: 'border-green-400',
    text: 'text-green-800',
    icon: 'text-green-600',
    name: 'Verde'
  });

  useEffect(() => {
    const loadColors = async () => {
      const instanceNames = allInstances.map(inst => inst.nombre);
      const instanceColors = await getInstanceColorByName(instance.nombre, instanceNames);
      setColors(instanceColors);
    };
    
    loadColors();
  }, [instance.nombre, instance.color, allInstances]);

  return (
    <Card className={`transition-all duration-200 hover:shadow-md border-l-4 ${colors.border} ${colors.bg}`}>
      <CardHeader className="pb-3">
        <InstanceCardHeader 
          instance={instance} 
          colors={colors}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        <InstanceStatus estado={instance.estado} />
        <InstanceCardActions
          instance={instance}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
          onDelete={onDelete}
          onToggleWebhook={onToggleWebhook}
          onColorChange={onColorChange}
        />
      </CardContent>
    </Card>
  );
};
