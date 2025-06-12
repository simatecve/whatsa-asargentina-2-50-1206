
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MercadoPagoConfig = () => {
  const [accessToken, setAccessToken] = useState("TEST-7740486138128835-052616-437e49a9f1b29db41bb4d5eb313f1afd-28065745");
  const [publicKey, setPublicKey] = useState("TEST-42e24870-43ec-4e92-bc35-624fd2d5c844");
  const [environment, setEnvironment] = useState("test");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('mercadopago_config')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error("Error loading config:", error);
        toast.error("Error al cargar la configuración");
      } else if (data) {
        setAccessToken(data.access_token || "");
        setPublicKey(data.public_key || "");
        setEnvironment(data.environment || "test");
      }
    } catch (error) {
      console.log("No config found, using defaults");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!accessToken.trim() || !publicKey.trim()) {
      toast.error("Por favor complete todos los campos requeridos");
      return;
    }

    setSaving(true);
    try {
      // First check if config exists
      const { data: existingConfig } = await supabase
        .from("mercadopago_config")
        .select("id")
        .maybeSingle();

      if (existingConfig) {
        // Update existing config
        const { error } = await supabase
          .from("mercadopago_config")
          .update({
            access_token: accessToken,
            public_key: publicKey,
            environment: environment,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingConfig.id);

        if (error) {
          throw error;
        }
      } else {
        // Insert new config
        const { error } = await supabase
          .from("mercadopago_config")
          .insert({
            access_token: accessToken,
            public_key: publicKey,
            environment: environment
          });

        if (error) {
          throw error;
        }
      }

      toast.success("Configuración de MercadoPago guardada correctamente");
    } catch (error) {
      console.error("Error saving MercadoPago config:", error);
      toast.error("No se pudo guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuración de MercadoPago</CardTitle>
          <CardDescription>Cargando configuración...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de MercadoPago</CardTitle>
        <CardDescription>
          Configure las credenciales de MercadoPago para procesar los pagos de suscripciones.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 mb-1">Credenciales de prueba configuradas</p>
              <p className="text-yellow-700">
                Estas son credenciales de prueba de MercadoPago. Para producción, reemplácelas con sus credenciales reales.
              </p>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="environment">Ambiente</Label>
          <select
            id="environment"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="test">Test (Pruebas)</option>
            <option value="production">Producción</option>
          </select>
        </div>

        <div>
          <Label htmlFor="access-token">Access Token</Label>
          <Input
            id="access-token"
            placeholder="TEST-7740486138128835-052616-..."
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            type="password"
          />
          <p className="text-xs text-gray-500 mt-1">
            Token de acceso para la API de MercadoPago
          </p>
        </div>

        <div>
          <Label htmlFor="public-key">Public Key</Label>
          <Input
            id="public-key"
            placeholder="TEST-42e24870-43ec-4e92-bc35-..."
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Clave pública para la integración con MercadoPago
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSaveConfig} 
          disabled={saving}
          className="w-full"
        >
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : "Guardar Configuración"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MercadoPagoConfig;
