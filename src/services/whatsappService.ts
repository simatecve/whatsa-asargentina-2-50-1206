
interface SendTextParams {
  instanceName: string;
  number: string;
  text: string;
  delay?: number;
  linkPreview?: boolean;
  mentionsEveryOne?: boolean;
  mentioned?: string[];
  quoted?: {
    key: { id: string };
    message: { conversation: string };
  };
}

interface RequestData {
  number: string;
  text: string;
  delay?: number;
  linkPreview?: boolean;
  mentionsEveryOne?: boolean;
  mentioned?: string[];
  quoted?: {
    key: { id: string };
    message: { conversation: string };
  };
}

class WhatsAppService {
  private async getApiConfig() {
    console.log('Getting API configuration...');
    
    try {
      // Usar la función edge de Supabase directamente
      const response = await fetch('https://efa7d258-2720-4686-b6c0-cdf0c25c0595.supabase.co/functions/v1/api-config', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmYTdkMjU4LTI3MjAtNDY4Ni1iNmMwLWNkZjBjMjVjMDU5NSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzQ4MTYzNDA4LCJleHAiOjIwNjM3MzkzOTB9.g_5Rvq2_xvZTH2cYJJcB6qwUaqGV6wpJX7X2TqoZkC4',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.log('Supabase function failed with status:', response.status);
        // Fallback a configuración hardcodeada conocida
        console.log('Using fallback configuration');
        return {
          server_url: 'https://cursos-evolution-api.rddxeh.easypanel.host',
          api_key: '429683C4C977415CAAFCCE10F7D57E11'
        };
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType);
        // Fallback a configuración hardcodeada conocida
        console.log('Using fallback configuration due to non-JSON response');
        return {
          server_url: 'https://cursos-evolution-api.rddxeh.easypanel.host',
          api_key: '429683C4C977415CAAFCCE10F7D57E11'
        };
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.error('API config error:', data.error);
        // Fallback a configuración hardcodeada conocida
        console.log('Using fallback configuration due to API error');
        return {
          server_url: 'https://cursos-evolution-api.rddxeh.easypanel.host',
          api_key: '429683C4C977415CAAFCCE10F7D57E11'
        };
      }

      if (!data.server_url || !data.api_key) {
        console.log('Incomplete API config, using fallback');
        return {
          server_url: 'https://cursos-evolution-api.rddxeh.easypanel.host',
          api_key: '429683C4C977415CAAFCCE10F7D57E11'
        };
      }
      
      console.log('API config obtained successfully');
      return data;
      
    } catch (error) {
      console.error('Failed to get API configuration:', error);
      // Fallback a configuración hardcodeada conocida
      console.log('Using fallback configuration due to exception');
      return {
        server_url: 'https://cursos-evolution-api.rddxeh.easypanel.host',
        api_key: '429683C4C977415CAAFCCE10F7D57E11'
      };
    }
  }

  private async makeRequest(endpoint: string, data?: any) {
    console.log('Making request to:', endpoint);
    console.log('Request data:', data);
    
    try {
      const config = await this.getApiConfig();
      
      if (!config.server_url || !config.api_key) {
        throw new Error('Configuración de API incompleta. Falta URL del servidor o clave API.');
      }
      
      // Asegurar que la URL base no termine con una barra
      const baseUrl = config.server_url.endsWith('/') ? config.server_url.slice(0, -1) : config.server_url;
      const fullUrl = `${baseUrl}${endpoint}`;
      
      console.log('Full URL:', fullUrl);
      console.log('Using API Key:', config.api_key);
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.api_key,
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Error en la API de WhatsApp: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('API Response:', result);
      return result;
      
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  async sendText(params: SendTextParams) {
    const { instanceName, ...data } = params;
    
    // Preparar los datos según la especificación de la API
    const requestData: RequestData = {
      number: data.number,
      text: data.text
    };
    
    // Agregar campos opcionales solo si están definidos
    if (data.delay !== undefined) requestData.delay = data.delay;
    if (data.linkPreview !== undefined) requestData.linkPreview = data.linkPreview;
    if (data.mentionsEveryOne !== undefined) requestData.mentionsEveryOne = data.mentionsEveryOne;
    if (data.mentioned && data.mentioned.length > 0) requestData.mentioned = data.mentioned;
    if (data.quoted) requestData.quoted = data.quoted;
    
    console.log('Sending request with data:', requestData);
    
    return this.makeRequest(`/message/sendText/${instanceName}`, requestData);
  }
}

export const whatsappService = new WhatsAppService();
