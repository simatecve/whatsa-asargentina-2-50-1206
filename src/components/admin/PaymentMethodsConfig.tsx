
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, CreditCard } from "lucide-react";
import { PayPalConfig } from "./PayPalConfig";

interface PaymentMethodsData {
  id?: string;
  mercadopago_enabled: boolean;
  paypal_enabled: boolean;
}

// Extended type for api_config with payment fields
interface ApiConfigWithPayment {
  id: string;
  config_type: string;
  config_data: string;
  created_at: string;
  updated_at: string;
  api_key?: string;
  server_url?: string;
}

export const PaymentMethodsConfig = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [methods, setMethods] = useState<PaymentMethodsData>({
    mercadopago_enabled: true,
    paypal_enabled: false
  });

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      // Usar la tabla api_config para almacenar configuraciones de métodos de pago
      const { data, error } = await supabase
        .from('api_config')
        .select('*')
        .eq('config_type', 'payment_methods')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.log('No payment methods config found, using defaults');
      }

      if (data && (data as ApiConfigWithPayment).config_data) {
        try {
          const parsedConfig = JSON.parse((data as ApiConfigWithPayment).config_data);
          setMethods({
            id: data.id,
            mercadopago_enabled: parsedConfig.mercadopago_enabled ?? true,
            paypal_enabled: parsedConfig.paypal_enabled ?? false
          });
        } catch (parseError) {
          console.error('Error parsing payment methods config:', parseError);
        }
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('Error al cargar los métodos de pago');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const configData = {
        mercadopago_enabled: methods.mercadopago_enabled,
        paypal_enabled: methods.paypal_enabled
      };

      const { error } = await supabase
        .from('api_config')
        .upsert([{
          id: methods.id || crypto.randomUUID(),
          config_type: 'payment_methods',
          config_data: JSON.stringify(configData),
          updated_at: new Date().toISOString(),
          api_key: null,
          server_url: null
        } as any]);

      if (error) throw error;

      toast.success('Métodos de pago actualizados correctamente');
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error saving payment methods:', error);
      toast.error('Error al guardar los métodos de pago');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pago</CardTitle>
            <CardDescription>Configura los métodos de pago disponibles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Métodos de Pago
          </CardTitle>
          <CardDescription>
            Habilita o deshabilita los métodos de pago disponibles para los usuarios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="mercadopago-enabled"
              checked={methods.mercadopago_enabled}
              onCheckedChange={(checked) => setMethods({ ...methods, mercadopago_enabled: checked })}
            />
            <Label htmlFor="mercadopago-enabled">MercadoPago</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="paypal-enabled"
              checked={methods.paypal_enabled}
              onCheckedChange={(checked) => setMethods({ ...methods, paypal_enabled: checked })}
            />
            <Label htmlFor="paypal-enabled">PayPal</Label>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {methods.paypal_enabled && <PayPalConfig />}
    </div>
  );
};
