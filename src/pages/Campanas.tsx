
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampanasList } from "@/components/campanas/CampanasList";
import { CampanaForm } from "@/components/campanas/CampanaForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSubscriptionValidation } from "@/hooks/useSubscriptionValidation";
import { LimitReachedAlert } from "@/components/subscription/LimitReachedAlert";

const Campanas = () => {
  const [activeTab, setActiveTab] = useState("campanas");
  const [showForm, setShowForm] = useState(false);
  const { limits, suscripcionActiva, validateAndBlock, checkLimit, loading, isExpired } = useSubscriptionValidation();

  const handleCreateCampana = () => {
    if (validateAndBlock('campanas')) {
      setShowForm(true);
      setActiveTab("nueva");
    }
  };

  // Show loading only briefly
  if (loading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isAtCampanaLimit = limits ? checkLimit('campanas') : false;
  const showSubscriptionAlert = !loading && isExpired;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campañas de Envío Masivo</h1>
          <p className="text-muted-foreground">
            Gestiona y crea campañas para enviar mensajes masivos a tus contactos.
            {limits && (
              <span className="ml-2 text-sm">
                ({limits.currentCampanas}/{limits.maxCampanas} campañas)
              </span>
            )}
            {showSubscriptionAlert && (
              <span className="ml-2 text-sm text-red-600">
                - Plan vencido, funcionalidad limitada
              </span>
            )}
          </p>
        </div>
        <Button 
          onClick={handleCreateCampana}
          className="bg-green-500 hover:bg-green-600"
          disabled={isAtCampanaLimit && !showSubscriptionAlert}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Campaña
        </Button>
      </div>

      {/* Alerta discreta de suscripción vencida */}
      {showSubscriptionAlert && (
        <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-700">
            ⚠️ Tu plan ha vencido. Algunas funcionalidades pueden estar limitadas.{" "}
            <button 
              onClick={() => window.location.href = "/dashboard/planes"}
              className="text-red-800 underline hover:text-red-900"
            >
              Renovar plan
            </button>
          </div>
        </div>
      )}

      {/* Mostrar alerta si se alcanzó el límite y hay plan activo */}
      {isAtCampanaLimit && !showSubscriptionAlert && limits && (
        <LimitReachedAlert
          type="campanas"
          current={limits.currentCampanas}
          max={limits.maxCampanas}
          blocking={true}
        />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="campanas">Todas</TabsTrigger>
          <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
          <TabsTrigger value="enviadas">Enviadas</TabsTrigger>
          {showForm && <TabsTrigger value="nueva">Nueva Campaña</TabsTrigger>}
        </TabsList>

        <TabsContent value="campanas" className="space-y-4">
          <CampanasList estado="todas" onCreateNew={handleCreateCampana} />
        </TabsContent>

        <TabsContent value="pendientes" className="space-y-4">
          <CampanasList estado="pendiente" onCreateNew={handleCreateCampana} />
        </TabsContent>

        <TabsContent value="enviadas" className="space-y-4">
          <CampanasList estado="enviada" onCreateNew={handleCreateCampana} />
        </TabsContent>

        {showForm && (
          <TabsContent value="nueva" className="space-y-4">
            <CampanaForm 
              onCancel={() => {
                setShowForm(false);
                setActiveTab("campanas");
              }}
              onSuccess={() => {
                setShowForm(false);
                setActiveTab("campanas");
              }}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Campanas;
