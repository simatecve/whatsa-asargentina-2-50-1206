
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LinkIcon, QrCode, RefreshCw, Webhook, Trash2 } from "lucide-react";
import { setupInstanceWebhook, deleteInstance } from "@/services/apiService";
import { toast } from "@/components/ui/use-toast";
import { InstanceColorPicker } from "./InstanceColorPicker";

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

interface InstanceCardActionsProps {
  instance: Instance;
  onConnect: (instance: Instance) => void;
  onDisconnect: (instanceId: string) => void;
  onDelete: (instanceId: string) => void;
  onToggleWebhook: (instanceId: string) => void;
  onColorChange?: (instanceName: string, newColor: string) => void;
}

export const InstanceCardActions = ({
  instance,
  onConnect,
  onDisconnect,
  onDelete,
  onToggleWebhook,
  onColorChange
}: InstanceCardActionsProps) => {
  const [settingWebhook, setSettingWebhook] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    setConnecting(true);
    try {
      onConnect(instance);
    } finally {
      setConnecting(false);
    }
  };

  const handleSetupWebhook = async () => {
    setSettingWebhook(true);
    try {
      await setupInstanceWebhook(instance.nombre);
      onToggleWebhook(instance.id);
      toast({
        title: "Webhook configurado",
        description: "La configuración del webhook se completó correctamente"
      });
    } catch (error) {
      console.error("Error setting up webhook:", error);
      toast({
        title: "Error de configuración",
        description: "No se pudo configurar el webhook",
        variant: "destructive"
      });
    } finally {
      setSettingWebhook(false);
    }
  };

  const handleDeleteInstance = async () => {
    if (!confirm(`¿Está seguro de que desea eliminar la instancia "${instance.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    setDeleting(true);
    try {
      await deleteInstance(instance.nombre);
      onDelete(instance.id);
    } catch (error) {
      console.error("Error deleting instance:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleColorChange = (newColor: string) => {
    if (onColorChange) {
      onColorChange(instance.nombre, newColor);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {instance.estado === 'disconnected' && (
        <Button variant="outline" className="w-full" onClick={handleConnect} disabled={connecting}>
          {connecting ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Conectando...
            </>
          ) : (
            <>
              <QrCode className="h-4 w-4 mr-2" />
              Conectar con código QR
            </>
          )}
        </Button>
      )}

      {instance.estado === 'connected' && (
        <Button 
          size="sm" 
          variant="outline" 
          className="w-full text-xs" 
          onClick={handleSetupWebhook} 
          disabled={settingWebhook}
        >
          {settingWebhook ? (
            <>
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Configurando webhook...
            </>
          ) : (
            <>
              <Webhook className="h-3 w-3 mr-1" />
              {instance.webhook ? 'Reconfigurar webhook' : 'Configurar webhook'}
            </>
          )}
        </Button>
      )}

      <InstanceColorPicker
        instanceName={instance.nombre}
        currentColor={instance.color || '#10b981'}
        onColorChange={handleColorChange}
      />

      <Button size="sm" variant="destructive" className="w-full text-xs" onClick={handleDeleteInstance} disabled={deleting}>
        {deleting ? (
          <>
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Eliminando...
          </>
        ) : (
          <>
            <Trash2 className="h-3 w-3 mr-1" />
            Eliminar instancia
          </>
        )}
      </Button>
    </div>
  );
};
