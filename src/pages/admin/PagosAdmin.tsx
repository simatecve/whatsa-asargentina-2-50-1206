
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentStatsCards } from "@/components/admin/payments/PaymentStatsCards";
import { PaymentTransactionsTable } from "@/components/admin/payments/PaymentTransactionsTable";
import { PaymentMethodsConfig } from "@/components/admin/PaymentMethodsConfig";
import MercadoPagoConfig from "@/components/admin/MercadoPagoConfig";
import { usePaymentTabs } from "@/hooks/usePaymentTabs";

const PagosAdmin = () => {
  const { activeTab, handleTabChange } = usePaymentTabs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Pagos</h1>
        <p className="text-muted-foreground mt-1">
          Administra transacciones, métodos de pago y configuraciones
        </p>
      </div>

      <PaymentStatsCards />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="transactions">Transacciones</TabsTrigger>
          <TabsTrigger value="methods">Métodos</TabsTrigger>
          <TabsTrigger value="mercadopago">MercadoPago</TabsTrigger>
          <TabsTrigger value="paypal">PayPal</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions" className="space-y-6">
          <PaymentTransactionsTable />
        </TabsContent>
        
        <TabsContent value="methods" className="space-y-6">
          <PaymentMethodsConfig />
        </TabsContent>
        
        <TabsContent value="mercadopago" className="space-y-6">
          <MercadoPagoConfig />
        </TabsContent>
        
        <TabsContent value="paypal" className="space-y-6">
          <div className="text-center text-muted-foreground py-8">
            Configuración de PayPal disponible en la pestaña "Métodos"
          </div>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6">
          <div className="text-center text-muted-foreground py-8">
            Reportes de pagos próximamente...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PagosAdmin;
