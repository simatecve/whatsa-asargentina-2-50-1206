
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const APIConfigForm = ({ onConfigSaved }: { onConfigSaved?: () => void }) => {
  const [serverUrl, setServerUrl] = useState("");
  const [apiKey, setApiKey] = useState("429683C4C977415CAAFCCE10F7D57E11");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('api_config')
        .select('server_url, api_key')
        .single();

      if (data) {
        setServerUrl(data.server_url || "");
        setApiKey(data.api_key || "429683C4C977415CAAFCCE10F7D57E11");
      }
    } catch (error) {
      console.log("No config found, using defaults");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!serverUrl.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor ingrese la URL del servidor",
        variant: "destructive",
      });
      return;
    }

    // Validar formato de URL
    try {
      // Asegurar que la URL comienza con http:// o https://
      const urlToValidate = serverUrl.startsWith('http') ? serverUrl : `https://${serverUrl}`;
      new URL(urlToValidate);
    } catch (e) {
      toast({
        title: "URL inválida",
        description: "Por favor ingrese una URL válida",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Primero eliminar cualquier configuración existente
      await supabase.from("api_config").delete().neq("id", "00000000-0000-0000-0000-000000000000");

      // Luego insertar la nueva configuración
      const { error } = await supabase.from("api_config").insert({
        server_url: serverUrl.startsWith('http') ? serverUrl : `https://${serverUrl}`,
        api_key: apiKey
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Configuración guardada",
        description: "La configuración de la API se ha guardado correctamente"
      });

      if (onConfigSaved) {
        onConfigSaved();
      }
    } catch (error) {
      console.error("Error saving API config:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuración de API Evolution</CardTitle>
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
        <CardTitle>Configuración de API Evolution</CardTitle>
        <CardDescription>
          Configure los parámetros de conexión a la API Evolution para enviar mensajes de WhatsApp.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="server-url">URL del Servidor Evolution</Label>
          <Input
            id="server-url"
            placeholder="https://su-servidor-evolution-api.com"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            URL completa del servidor Evolution API (incluyendo https:// si aplica)
          </p>
        </div>

        <div>
          <Label htmlFor="api-key">API Key</Label>
          <Input
            id="api-key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            type="password"
            readOnly
          />
          <p className="text-xs text-gray-500 mt-1">
            Clave de autenticación para acceder a la API (configurada por defecto)
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

export default APIConfigForm;
