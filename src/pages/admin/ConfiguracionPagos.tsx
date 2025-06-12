
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ConfiguracionPagos = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/admin/pagos')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Pagos
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configuración de Pagos</h1>
          <p className="text-muted-foreground mt-1">
            Esta página ha sido integrada en la gestión principal de pagos
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración Integrada
          </CardTitle>
          <CardDescription>
            La configuración de pagos ahora está disponible en la página principal de gestión de pagos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Para acceder a la configuración de métodos de pago, dirígete a:
          </p>
          <div className="grid gap-3">
            <Button 
              onClick={() => navigate('/admin/pagos?tab=methods')}
              variant="outline"
              className="justify-start"
            >
              <Settings className="mr-2 h-4 w-4" />
              Configurar Métodos de Pago
            </Button>
            <Button 
              onClick={() => navigate('/admin/pagos?tab=mercadopago')}
              variant="outline"
              className="justify-start"
            >
              <Settings className="mr-2 h-4 w-4" />
              Configurar MercadoPago
            </Button>
            <Button 
              onClick={() => navigate('/admin/pagos?tab=paypal')}
              variant="outline"
              className="justify-start"
            >
              <Settings className="mr-2 h-4 w-4" />
              Configurar PayPal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfiguracionPagos;
