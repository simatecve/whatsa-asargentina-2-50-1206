
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const WebhookSetupGuide = () => {
  const projectId = "telslaeykvfpmcrrnprb";
  const mercadopagoWebhookUrl = `https://${projectId}.supabase.co/functions/v1/webhook-mercadopago`;
  const paypalWebhookUrl = `https://${projectId}.supabase.co/functions/v1/webhook-paypal`;

  const copyToClipboard = (text: string, name: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`URL de ${name} copiada al portapapeles`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Configuración de Webhooks
          </CardTitle>
          <CardDescription>
            Los webhooks están desplegados y listos para usar. Configura las URLs en cada plataforma de pago.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* MercadoPago Webhook */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                MercadoPago
              </Badge>
              <span className="text-sm font-medium">Webhook URL</span>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg border">
              <div className="flex items-center justify-between">
                <code className="text-sm break-all">{mercadopagoWebhookUrl}</code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(mercadopagoWebhookUrl, "MercadoPago")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Configuración en MercadoPago:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Ve a tu cuenta de MercadoPago → Integraciones → Webhooks</li>
                  <li>Agrega la URL del webhook</li>
                  <li>Selecciona el evento: <code>payment</code></li>
                  <li>Activa el webhook</li>
                </ol>
              </AlertDescription>
            </Alert>
          </div>

          {/* PayPal Webhook */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                PayPal
              </Badge>
              <span className="text-sm font-medium">Webhook URL</span>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg border">
              <div className="flex items-center justify-between">
                <code className="text-sm break-all">{paypalWebhookUrl}</code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(paypalWebhookUrl, "PayPal")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Configuración en PayPal:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Ve a PayPal Developer → Apps & Credentials → Tu App</li>
                  <li>En la sección Webhooks, agrega la URL</li>
                  <li>Selecciona los eventos:</li>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><code>CHECKOUT.ORDER.APPROVED</code></li>
                    <li><code>PAYMENT.CAPTURE.COMPLETED</code></li>
                    <li><code>CHECKOUT.ORDER.COMPLETED</code></li>
                  </ul>
                  <li>Guarda y activa el webhook</li>
                </ol>
              </AlertDescription>
            </Alert>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">Funcionalidad Implementada</h4>
                <p className="text-sm text-green-700 mt-1">
                  Los webhooks procesarán automáticamente los pagos y activarán los planes de suscripción.
                  Una vez configurados, el sistema funcionará de manera completamente automática.
                </p>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};
