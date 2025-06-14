
import { useState, useEffect } from "react";
import { fetchAPIConfig } from "@/services/apiService";
import QRModal from "@/components/QRModal";
import { ConnectionTabs } from "@/components/connection/ConnectionTabs";
import { ConnectionProvider, useConnection } from "@/contexts/ConnectionContext";

const ConexionContent = () => {
  const [activeTab, setActiveTab] = useState("instances");
  const [apiConfigExists, setApiConfigExists] = useState(false);
  const [checkingConfig, setCheckingConfig] = useState(true);
  const { currentQRCode, currentInstanceName, modalOpen, handleCloseModal } = useConnection();

  const checkAPIConfig = async () => {
    setCheckingConfig(true);
    try {
      console.log("Verificando configuración de API...");
      const config = await fetchAPIConfig();
      console.log("Configuración obtenida:", config);
      
      const configExists = !!(config && config.server_url && config.api_key);
      setApiConfigExists(configExists);
      
      console.log("¿Configuración válida?", configExists);
    } catch (error) {
      console.error("Error checking API config:", error);
      setApiConfigExists(false);
    } finally {
      setCheckingConfig(false);
    }
  };

  useEffect(() => {
    checkAPIConfig();
  }, []);

  if (checkingConfig) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-azul-100 to-azul-50 dark:from-azul-900 dark:to-gray-900 p-6 rounded-lg border border-azul-200 dark:border-azul-800 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight text-azul-700 dark:text-azul-300">
            Gestión de Conexiones
          </h1>
          <p className="text-muted-foreground mt-1">
            Verificando configuración de API Evolution...
          </p>
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-azul-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <QRModal
        open={modalOpen}
        onClose={handleCloseModal}
        qrCode={currentQRCode}
        instanceName={currentInstanceName}
      />

      <div className="bg-gradient-to-r from-azul-100 to-azul-50 dark:from-azul-900 dark:to-gray-900 p-6 rounded-lg border border-azul-200 dark:border-azul-800 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-azul-700 dark:text-azul-300">
          Gestión de Conexiones
        </h1>
        <p className="text-muted-foreground mt-1">
          Cree y administre sus instancias de WhatsApp conectadas a la API Evolution.
        </p>
        {!apiConfigExists && (
          <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-md">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ Configuración de API Evolution no encontrada en la base de datos. Contacte al administrador para configurar la conexión.
            </p>
          </div>
        )}
      </div>

      <ConnectionTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        apiConfigExists={apiConfigExists}
      />
    </div>
  );
};

const Conexion = () => {
  return (
    <ConnectionProvider>
      <ConexionContent />
    </ConnectionProvider>
  );
};

export default Conexion;
