
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, AlertTriangle } from "lucide-react";

interface PayPalConfigData {
  id?: string;
  enabled: boolean;
  client_id: string;
  client_secret: string;
  environment: 'sandbox' | 'production';
}

export const PayPalConfig = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [config, setConfig] = useState<PayPalConfigData>({
    enabled: false,
    client_id: '',
    client_secret: '',
    environment: 'sandbox'
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('api_config')
        .select('*')
        .eq('config_type', 'paypal')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.log('No PayPal config found, using defaults');
      }

      if (data && data.config_data) {
        try {
          const parsedConfig = JSON.parse(data.config_data);
          setConfig({
            id: data.id,
            enabled: parsedConfig.enabled || false,
            client_id: parsedConfig.client_id || '',
            client_secret: parsedConfig.client_secret || '',
            environment: parsedConfig.environment || 'sandbox'
          });
        } catch (parseError) {
          console.error('Error parsing PayPal config:', parseError);
        }
      }
    } catch (error) {
      console.error('Error fetching PayPal config:', error);
      toast.error('Error al cargar la configuración de PayPal');
    } finally {
      setLoading(false);
    }
  };

  const testPayPalConnection = async () => {
    if (!config.client_id || !config.client_secret) {
      toast.error('Client ID y Client Secret son requeridos para probar la conexión');
      return;
    }

    setTesting(true);
    try {
      const baseUrl = config.environment === 'sandbox' ? 'https://api.sandbox.paypal.com' : 'https://api.paypal.com';
      const credentials = btoa(`${config.client_id}:${config.client_secret}`);

      console.log('Probando conexión PayPal:', {
        environment: config.environment,
        baseUrl: baseUrl,
        hasClientId: !!config.client_id,
        hasClientSecret: !!config.client_secret
      });

      const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: 'grant_type=client_credentials'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Conexión PayPal exitosa:', data);
        toast.success('✅ Conexión con PayPal exitosa');
      } else {
        const errorText = await response.text();
        console.error('Error de conexión PayPal:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        if (response.status === 401) {
          toast.error('❌ Credenciales inválidas. Verifique Client ID y Client Secret');
        } else {
          toast.error(`❌ Error de conexión (${response.status}): ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('Error probando conexión PayPal:', error);
      toast.error('❌ Error al probar la conexión con PayPal');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (config.enabled && (!config.client_id || !config.client_secret)) {
        toast.error('Client ID y Client Secret son requeridos cuando PayPal está habilitado');
        return;
      }

      const configData = {
        enabled: config.enabled,
        client_id: config.client_id,
        client_secret: config.client_secret,
        environment: config.environment
      };

      const { error } = await supabase
        .from('api_config')
        .upsert([{
          id: config.id || crypto.randomUUID(),
          config_type: 'paypal',
          config_data: JSON.stringify(configData),
          updated_at: new Date().toISOString(),
          api_key: null,
          server_url: null
        }]);

      if (error) throw error;

      toast.success('Configuración de PayPal guardada correctamente');
      fetchConfig();
    } catch (error) {
      console.error('Error saving PayPal config:', error);
      toast.error('Error al guardar la configuración de PayPal');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuración de PayPal</CardTitle>
          <CardDescription>Configura las credenciales de PayPal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de PayPal</CardTitle>
        <CardDescription>
          Configura las credenciales de PayPal para procesar pagos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="paypal-enabled"
            checked={config.enabled}
            onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
          />
          <Label htmlFor="paypal-enabled">Habilitar PayPal</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="environment">Ambiente</Label>
          <select
            id="environment"
            value={config.environment}
            onChange={(e) => setConfig({ ...config, environment: e.target.value as 'sandbox' | 'production' })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="sandbox">Sandbox (Pruebas)</option>
            <option value="production">Production (Producción)</option>
          </select>
        </div>

        {config.environment === 'production' && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium text-sm">Modo Producción</span>
            </div>
            <p className="text-sm text-amber-700 mt-1">
              Estás configurando PayPal para pagos reales. Asegúrate de usar credenciales de producción válidas.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="client-id">Client ID</Label>
          <Input
            id="client-id"
            type="text"
            value={config.client_id}
            onChange={(e) => setConfig({ ...config, client_id: e.target.value })}
            placeholder="Ingresa el Client ID de PayPal"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="client-secret">Client Secret</Label>
          <Input
            id="client-secret"
            type="password"
            value={config.client_secret}
            onChange={(e) => setConfig({ ...config, client_secret: e.target.value })}
            placeholder="Ingresa el Client Secret de PayPal"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Configuración
              </>
            )}
          </Button>
          
          <Button 
            onClick={testPayPalConnection} 
            disabled={testing || !config.client_id || !config.client_secret}
            variant="outline"
          >
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Probando...
              </>
            ) : (
              'Probar Conexión'
            )}
          </Button>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Instrucciones:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>1. Ve a <a href="https://developer.paypal.com/" target="_blank" rel="noopener noreferrer" className="underline">PayPal Developer</a></li>
            <li>2. Crea una aplicación en tu dashboard</li>
            <li>3. Copia el Client ID y Client Secret</li>
            <li>4. Selecciona Sandbox para pruebas o Production para pagos reales</li>
            <li>5. Usa el botón "Probar Conexión" para verificar las credenciales</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
