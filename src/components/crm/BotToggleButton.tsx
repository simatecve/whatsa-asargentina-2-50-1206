
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bot, BotOff } from "lucide-react";
import { useBotContactStatus } from "@/hooks/crm/useBotContactStatus";

interface BotToggleButtonProps {
  numeroContacto: string;
  instanciaNombre: string;
}

export const BotToggleButton = ({ numeroContacto, instanciaNombre }: BotToggleButtonProps) => {
  const { fetchContactStatus, toggleBotStatus, loading } = useBotContactStatus();
  const [botActive, setBotActive] = useState<boolean>(true); // Por defecto activo
  const [isInitialized, setIsInitialized] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  console.log('BotToggleButton Debug:', {
    numeroContacto,
    instanciaNombre,
    botActive,
    loading,
    localLoading,
    isInitialized
  });

  // Función para obtener el estado actual desde la BD
  const refreshStatus = async () => {
    try {
      const data = await fetchContactStatus(numeroContacto, instanciaNombre);
      // Si existe registro = bot desactivado, si no existe = bot activo
      const isActive = !data; // true si NO existe registro, false si SÍ existe
      setBotActive(isActive);
      console.log('Bot status refreshed from DB:', { data, isActive });
    } catch (error) {
      console.error('Error refreshing bot status:', error);
      setBotActive(true); // Por defecto activo en caso de error
    }
  };

  useEffect(() => {
    const initializeStatus = async () => {
      await refreshStatus();
      setIsInitialized(true);
    };

    initializeStatus();
  }, [numeroContacto, instanciaNombre]);

  // Escuchar cambios de estado del bot en tiempo real
  useEffect(() => {
    const handleBotStatusChange = (event: CustomEvent) => {
      const { numero_contacto, instancia_nombre } = event.detail;
      if (numero_contacto === numeroContacto && instancia_nombre === instanciaNombre) {
        console.log('Bot status changed for current contact, refreshing...');
        // Re-fetch status desde la BD para asegurar sincronización
        refreshStatus();
      }
    };

    window.addEventListener('bot-status-changed', handleBotStatusChange as EventListener);

    return () => {
      window.removeEventListener('bot-status-changed', handleBotStatusChange as EventListener);
    };
  }, [numeroContacto, instanciaNombre]);

  const handleToggle = async (checked: boolean) => {
    console.log('Toggle clicked:', { checked, currentStatus: botActive });
    
    if (localLoading || loading) {
      console.log('Toggle blocked by loading state');
      return;
    }

    setLocalLoading(true);
    try {
      await toggleBotStatus(numeroContacto, instanciaNombre);
      console.log('Toggle completed successfully');
      // Refrescar el estado desde la BD después del toggle
      await refreshStatus();
    } catch (error) {
      console.error('Error toggling bot status:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center space-y-1">
        <span className="text-xs text-muted-foreground">
          Cargando...
        </span>
        <div className="flex items-center space-x-1">
          <Bot className="h-3 w-3 text-gray-400" />
          <Switch disabled className="h-4 w-7" />
        </div>
      </div>
    );
  }

  const isDisabled = loading || localLoading;

  return (
    <div className="flex flex-col items-center space-y-1">
      <span className="text-xs text-muted-foreground text-center">
        {isDisabled ? 'Cambiando...' : `Bot ${botActive ? 'ON' : 'OFF'}`}
      </span>
      <div className="flex items-center space-x-1">
        {botActive ? (
          <Bot className="h-3 w-3 text-green-600" />
        ) : (
          <BotOff className="h-3 w-3 text-gray-400" />
        )}
        <Switch
          checked={botActive}
          onCheckedChange={handleToggle}
          disabled={isDisabled}
          className="h-4 w-7"
        />
      </div>
    </div>
  );
};
