
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentConfig {
  id?: string;
  provider: string;
  config_data: any;
  is_active?: boolean;
}

interface ApiConfigWithPayment {
  id: string;
  config_type: string | null;
  config_data: string | null;
  created_at: string;
  updated_at: string;
  api_key?: string | null;
  server_url?: string | null;
}

export const PaymentConfigurationPanel = () => {
  const [configs, setConfigs] = useState<PaymentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from payment_configurations table first
      const { data: paymentConfigs, error: paymentError } = await supabase
        .from('payment_configurations')
        .select('*')
        .order('provider');

      if (!paymentError && paymentConfigs && paymentConfigs.length > 0) {
        const formattedConfigs = paymentConfigs.map(config => ({
          id: config.id,
          provider: config.provider,
          config_data: config.config_data,
          is_active: config.is_active || false
        }));
        setConfigs(formattedConfigs);
      } else {
        // Fallback to api_config if payment_configurations is empty
        const { data: apiConfigs, error: apiError } = await supabase
          .from('api_config')
          .select('*')
          .in('config_type', ['mercadopago', 'paypal', 'stripe'])
          .order('config_type');

        if (apiError) throw apiError;
        
        const paymentConfigs = (apiConfigs || []).map((item: ApiConfigWithPayment) => ({
          id: item.id,
          provider: item.config_type || '',
          config_data: item.config_data ? JSON.parse(item.config_data) : {},
          is_active: item.config_data ? JSON.parse(item.config_data).is_active || false : false
        }));
        
        setConfigs(paymentConfigs);
      }
    } catch (error) {
      console.error('Error fetching configurations:', error);
      toast.error('Error al cargar las configuraciones');
    } finally {
      setLoading(false);
    }
  };

  const updateConfiguration = async (provider: string, updates: any) => {
    try {
      setSaving(provider);
      
      const existingConfig = configs.find(c => c.provider === provider);
      
      if (existingConfig) {
        // Update in payment_configurations table
        const { error } = await supabase
          .from('payment_configurations')
          .update({ 
            config_data: updates,
            is_active: updates.is_active || false,
            updated_at: new Date().toISOString()
          })
          .eq('provider', provider);
        
        if (error) throw error;
      } else {
        // Insert new configuration
        const { error } = await supabase
          .from('payment_configurations')
          .insert({ 
            provider: provider,
            config_data: updates,
            is_active: updates.is_active || false
          });
        
        if (error) throw error;
      }

      toast.success(`Configuración de ${provider} actualizada`);
      fetchConfigurations();
    } catch (error) {
      console.error('Error updating configuration:', error);
      toast.error('Error al actualizar la configuración');
    } finally {
      setSaving(null);
    }
  };

  const MercadoPagoConfig = () => {
    const config = configs.find(c => c.provider === 'mercadopago');
    const [formData, setFormData] = useState({
      environment: config?.config_data?.environment || 'sandbox',
      public_key: config?.config_data?.public_key || '',
      access_token: config?.config_data?.access_token || '',
      webhook_url: config?.config_data?.webhook_url || '',
      is_active: config?.config_data?.is_active || false,
    });

    const handleSave = () => {
      updateConfiguration('mercadopago', {
        environment: formData.environment,
        public_key: formData.public_key,
        access_token: formData.access_token,
        webhook_url: formData.webhook_url,
        is_active: formData.is_active,
      });
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuración MercadoPago</CardTitle>
          <CardDescription>
            Configura las credenciales de MercadoPago
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label>Habilitar MercadoPago</Label>
          </div>

          <div className="space-y-2">
            <Label>Ambiente</Label>
            <Select
              value={formData.environment}
              onValueChange={(value) => setFormData({ ...formData, environment: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">Sandbox (Pruebas)</SelectItem>
                <SelectItem value="production">Production (Producción)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Public Key</Label>
            <Input
              value={formData.public_key}
              onChange={(e) => setFormData({ ...formData, public_key: e.target.value })}
              placeholder="TEST-..."
            />
          </div>

          <div className="space-y-2">
            <Label>Access Token</Label>
            <Input
              type="password"
              value={formData.access_token}
              onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
              placeholder="TEST-..."
            />
          </div>

          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <Input
              value={formData.webhook_url}
              onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <Button onClick={handleSave} disabled={saving === 'mercadopago'}>
            {saving === 'mercadopago' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración de Pagos
          </CardTitle>
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración de Pagos
          </CardTitle>
          <CardDescription>
            Gestiona las configuraciones de los proveedores de pago
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="mercadopago">
        <TabsList>
          <TabsTrigger value="mercadopago">MercadoPago</TabsTrigger>
          <TabsTrigger value="paypal">PayPal</TabsTrigger>
          <TabsTrigger value="stripe">Stripe</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mercadopago">
          <MercadoPagoConfig />
        </TabsContent>
        
        <TabsContent value="paypal">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Configuración de PayPal próximamente...</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stripe">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Configuración de Stripe próximamente...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
