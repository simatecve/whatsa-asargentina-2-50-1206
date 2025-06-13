import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface APIConfig {
  server_url: string;
  api_key: string;
}

interface CreateInstanceParams {
  instanceName: string;
  webhook?: string;
  qrcode?: boolean;
}

// Constant for webhook URL
const DEFAULT_WEBHOOK_URL = "https://n8n2025.nocodeveloper.com/webhook/webhook-inicial-argentina";

export const fetchAPIConfig = async (): Promise<APIConfig | null> => {
  try {
    console.log("Fetching API config from Supabase...");
    
    const { data, error } = await supabase
      .from("api_config")
      .select("server_url, api_key")
      .is('config_type', null)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error fetching API config:", error);
      return null;
    }

    // Si no hay datos o es un array vacío
    if (!data || data.length === 0) {
      console.log("No API config found in database");
      return null;
    }

    const config = data[0];
    console.log("API config found:", { 
      server_url: config.server_url ? "✓" : "✗", 
      api_key: config.api_key ? "✓" : "✗" 
    });

    // Verificar que ambos campos tengan valores válidos
    if (!config.server_url || !config.api_key || 
        config.server_url.trim() === "" || config.api_key.trim() === "") {
      console.log("API config incomplete");
      return null;
    }

    return {
      server_url: config.server_url.trim(),
      api_key: config.api_key.trim()
    };
  } catch (error) {
    console.error("Exception fetching API config:", error);
    return null;
  }
};

export const createInstance = async (params: CreateInstanceParams): Promise<any> => {
  const config = await fetchAPIConfig();
  
  if (!config) {
    toast({
      title: "Error de configuración",
      description: "No se encontró la configuración de la API. Por favor, configure la API primero.",
      variant: "destructive",
    });
    throw new Error("No se encontró la configuración de la API");
  }
  
  const { server_url, api_key } = config;

  const { data: userData } = await supabase.auth.getUser();
  const user_id = userData?.user?.id;

  if (!user_id) {
    throw new Error("Usuario no autenticado");
  }

  // Always use the default webhook URL
  const webhookUrl = DEFAULT_WEBHOOK_URL;

  // Create the local database record first
  const { data: dbInstance, error: dbError } = await supabase
    .from("instancias")
    .insert({
      nombre: params.instanceName,
      user_id: user_id,
      webhook: webhookUrl
    })
    .select()
    .single();

  if (dbError) {
    console.error("Error creating local instance record:", dbError);
    throw new Error("Error al crear el registro de instancia en la base de datos");
  }

  // Simplified API data with only webhook and event configuration
  const apiData = {
    instanceName: params.instanceName,
    qrcode: params.qrcode !== undefined ? params.qrcode : true,
    integration: "WHATSAPP-BAILEYS",
    webhook: {
      url: webhookUrl,
      byEvents: false,
      base64: true,
      headers: {
        "Content-Type": "application/json"
      },
      events: [
        "MESSAGES_UPSERT"
      ]
    }
  };

  try {
    const baseUrl = server_url.endsWith('/') ? server_url.slice(0, -1) : server_url;
    const fullUrl = `${baseUrl}/instance/create`;
    
    console.log(`Sending request to: ${fullUrl}`);
    console.log("Request data:", JSON.stringify(apiData, null, 2));
    console.log("Using API key:", api_key);
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': api_key
      },
      body: JSON.stringify(apiData)
    });

    if (!response.ok) {
      await supabase
        .from("instancias")
        .update({ estado: "error" })
        .eq("id", dbInstance.id);

      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      
      let errorMessage;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || "Error en la creación de la instancia";
      } catch (e) {
        errorMessage = `Error en la creación de la instancia: ${response.status} ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const apiResponse = await response.json();
    console.log("API Response:", apiResponse);

    let qrCodeData = null;
    if (apiResponse.qrcode) {
      qrCodeData = typeof apiResponse.qrcode === 'string' ? apiResponse.qrcode : String(apiResponse.qrcode);
    } else if (apiResponse.base64) {
      qrCodeData = typeof apiResponse.base64 === 'string' ? apiResponse.base64 : String(apiResponse.base64);
    }

    await supabase
      .from("instancias")
      .update({
        estado: "creada",
        qr_code: qrCodeData,
        configuracion: apiResponse
      })
      .eq("id", dbInstance.id);

    return { ...apiResponse, db_id: dbInstance.id };
  } catch (error) {
    console.error("Exception during API call:", error);
    
    await supabase
      .from("instancias")
      .update({ estado: "error" })
      .eq("id", dbInstance.id);

    throw error;
  }
};

export const setupInstanceWebhook = async (instanceName: string): Promise<void> => {
  const config = await fetchAPIConfig();
  
  if (!config) {
    toast({
      title: "Error de configuración",
      description: "No se encontró la configuración de la API.",
      variant: "destructive",
    });
    throw new Error("No se encontró la configuración de la API");
  }
  
  const { server_url, api_key } = config;

  const { data: instanceData, error: instanceError } = await supabase
    .from("instancias")
    .select("webhook")
    .eq("nombre", instanceName)
    .maybeSingle();
    
  if (instanceError) {
    console.error("Error finding instance:", instanceError);
    throw new Error("Error al obtener la información de la instancia");
  }
  
  const webhookUrl = instanceData?.webhook || DEFAULT_WEBHOOK_URL;
  
  const webhookConfig = {
    enabled: true,
    url: webhookUrl,
    webhookByEvents: true,
    webhookBase64: true,
    events: [
      "APPLICATION_STARTUP",
      "QRCODE_UPDATED", 
      "CONNECTION_UPDATE",
      "MESSAGES_UPSERT",
      "MESSAGES_UPDATE",
      "SEND_MESSAGE"
    ]
  };

  try {
    const baseUrl = server_url.endsWith('/') ? server_url.slice(0, -1) : server_url;
    const fullUrl = `${baseUrl}/webhook/set/${instanceName}`;
    
    console.log(`Configurando webhook para la instancia ${instanceName} en: ${fullUrl}`);
    console.log("Webhook config:", webhookConfig);
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': api_key
      },
      body: JSON.stringify(webhookConfig)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Webhook API Error:", errorText);
      throw new Error(`Error al configurar webhook en la API: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Webhook configuration response:", result);
    
    toast({
      title: "Webhook configurado",
      description: "La configuración del webhook se completó correctamente en la API"
    });
  } catch (error) {
    console.error("Error configuring webhook:", error);
    toast({
      title: "Error de configuración",
      description: error instanceof Error ? error.message : "No se pudo configurar el webhook",
      variant: "destructive"
    });
    throw error;
  }
};

export const fetchUserInstances = async () => {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData?.user) {
    return [];
  }

  const { data, error } = await supabase
    .from("instancias")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("fecha_creacion", { ascending: false });

  if (error) {
    console.error("Error fetching instances:", error);
    return [];
  }

  return data.map(instance => ({
    ...instance,
    qr_code: instance.qr_code ? String(instance.qr_code) : null
  }));
};

export const checkConnectionState = async (instanceName: string): Promise<boolean> => {
  const config = await fetchAPIConfig();
  
  if (!config) {
    toast({
      title: "Error de configuración",
      description: "No se encontró la configuración de la API.",
      variant: "destructive",
    });
    throw new Error("No se encontró la configuración de la API");
  }
  
  const { server_url, api_key } = config;
  const baseUrl = server_url.endsWith('/') ? server_url.slice(0, -1) : server_url;
  const fullUrl = `${baseUrl}/instance/connectionState/${instanceName}`;
  
  try {
    console.log(`Checking connection state for ${instanceName} at ${fullUrl}`);
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'apikey': api_key
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Connection State API Error:", errorText);
      return false;
    }

    const data = await response.json();
    console.log("Connection state response:", data);
    
    const isConnected = 
      (data.instance && data.instance.state === "open") || 
      data.connected === true;
      
    return isConnected;
  } catch (error) {
    console.error("Error checking connection state:", error);
    return false;
  }
};

export const connectInstance = async (instanceName: string): Promise<string | null> => {
  const config = await fetchAPIConfig();
  
  if (!config) {
    toast({
      title: "Error de configuración",
      description: "No se encontró la configuración de la API.",
      variant: "destructive",
    });
    throw new Error("No se encontró la configuración de la API");
  }
  
  const { server_url, api_key } = config;
  const baseUrl = server_url.endsWith('/') ? server_url.slice(0, -1) : server_url;
  const fullUrl = `${baseUrl}/instance/connect/${instanceName}`;
  
  try {
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'apikey': api_key
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Connect Instance API Error:", errorText);
      return null;
    }

    const data = await response.json();
    console.log("Connect instance response:", data);
    
    if (data.base64) {
      const { data: instanceData, error } = await supabase
        .from("instancias")
        .select("id")
        .eq("nombre", instanceName)
        .single();
      
      if (!error && instanceData) {
        await supabase
          .from("instancias")
          .update({
            qr_code: typeof data.base64 === 'string' ? data.base64 : String(data.base64)
          })
          .eq("id", instanceData.id);
      }
      
      return typeof data.base64 === 'string' ? data.base64 : String(data.base64);
    }
    
    return null;
  } catch (error) {
    console.error("Error connecting instance:", error);
    return null;
  }
};

export const updateInstanceConnectionStatus = async (instanceName: string, isConnected: boolean) => {
  try {
    const { data: instanceData, error } = await supabase
      .from("instancias")
      .select("id")
      .eq("nombre", instanceName)
      .single();
    
    if (error) {
      console.error("Error finding instance:", error);
      return;
    }
    
    await supabase
      .from("instancias")
      .update({
        estado: isConnected ? "connected" : "disconnected"
      })
      .eq("id", instanceData.id);
  } catch (error) {
    console.error("Error updating instance status:", error);
  }
};

export const connectToCRM = async (instanceName: string, userData: any): Promise<boolean> => {
  try {
    await setupInstanceWebhook(instanceName);
    
    toast({
      title: "Conexión exitosa",
      description: "La instancia ha sido conectada al CRM correctamente.",
    });
    
    return true;
  } catch (error) {
    console.error(`Error connecting to CRM for instance ${instanceName}:`, error);
    toast({
      title: "Error de conexión",
      description: "Ocurrió un error al intentar conectar la instancia al CRM.",
      variant: "destructive"
    });
    throw error;
  }
};

export const deleteInstance = async (instanceName: string): Promise<void> => {
  const config = await fetchAPIConfig();
  
  if (!config) {
    toast({
      title: "Error de configuración",
      description: "No se encontró la configuración de la API.",
      variant: "destructive",
    });
    throw new Error("No se encontró la configuración de la API");
  }
  
  const { server_url, api_key } = config;
  const baseUrl = server_url.endsWith('/') ? server_url.slice(0, -1) : server_url;
  const fullUrl = `${baseUrl}/instance/delete/${instanceName}`;
  
  try {
    console.log(`Deleting instance ${instanceName} at ${fullUrl}`);
    
    const response = await fetch(fullUrl, {
      method: 'DELETE',
      headers: {
        'apikey': api_key
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Delete Instance API Error:", errorText);
      throw new Error(`Error al eliminar la instancia de la API: ${response.status} ${response.statusText}`);
    }

    console.log("Instance deleted from API successfully");
    
    const { error: dbError } = await supabase
      .from("instancias")
      .delete()
      .eq("nombre", instanceName);

    if (dbError) {
      console.error("Error deleting instance from database:", dbError);
      throw new Error("Error al eliminar la instancia de la base de datos");
    }

    console.log("Instance deleted from database successfully");
    
    toast({
      title: "Instancia eliminada",
      description: "La instancia se ha eliminado correctamente",
    });
  } catch (error) {
    console.error("Error deleting instance:", error);
    toast({
      title: "Error al eliminar instancia",
      description: error instanceof Error ? error.message : "Ocurrió un error al eliminar la instancia.",
      variant: "destructive"
    });
    throw error;
  }
};

export const updateInstanceColor = async (instanceName: string, color: string): Promise<void> => {
  const { data: config } = await supabase
    .from('api_config')
    .select('server_url, api_key')
    .limit(1)
    .single();

  if (!config?.server_url || !config?.api_key) {
    throw new Error('API Evolution no configurada');
  }

  // Update color in local database
  const { error } = await supabase
    .from('instancias')
    .update({ color })
    .eq('nombre', instanceName);

  if (error) {
    console.error('Error updating instance color:', error);
    throw new Error('No se pudo actualizar el color de la instancia');
  }
};
