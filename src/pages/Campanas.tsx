
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Send, Sparkles, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampanaForm } from "@/components/campanas/CampanaForm";
import { CampanasList } from "@/components/campanas/CampanasList";
import { CampanasEmptyState } from "@/components/campanas/CampanasEmptyState";
import { CampanasLoading } from "@/components/campanas/CampanasLoading";
import { useCampanas } from "@/hooks/useCampanas";
import { useSubscriptionValidation } from "@/hooks/useSubscriptionValidation";

const Campanas = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { campanas, loading, error, refetch } = useCampanas();
  const { suscripcionActiva, limits } = useSubscriptionValidation();

  const filteredCampanas = campanas.filter(campana =>
    campana.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCampanaCreated = () => {
    setShowForm(false);
    refetch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="space-y-8 p-6">
        {/* Header moderno con gradiente */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 rounded-2xl shadow-2xl border border-blue-200/20">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90"></div>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Send className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    Gestión de Campañas
                  </h1>
                  <p className="text-blue-100 text-lg mt-1">
                    Administra y ejecuta campañas de marketing masivo
                  </p>
                </div>
              </div>
              
              {limits && (
                <div className="flex items-center gap-6 text-blue-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">Campañas: {limits.currentCampanas}/{limits.maxCampanas}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm">Plan: {suscripcionActiva?.planes?.nombre}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="hidden lg:block">
              <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                <Send className="h-12 w-12 text-white mb-2" />
                <p className="text-white/90 text-sm font-medium">Campañas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs modernos */}
        <Tabs defaultValue="campanas" className="w-full">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 sm:items-center sm:justify-between mb-6">
            <TabsList className="grid w-full sm:w-auto grid-cols-2 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-lg">
              <TabsTrigger 
                value="campanas" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-lg font-medium transition-all duration-200"
              >
                Mis Campañas
              </TabsTrigger>
              <TabsTrigger 
                value="crear" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-lg font-medium transition-all duration-200"
              >
                Crear Campaña
              </TabsTrigger>
            </TabsList>
            
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar campañas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
                />
              </div>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg rounded-xl border-0 transition-all duration-200 hover:shadow-xl hover:scale-105"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nueva Campaña
              </Button>
            </div>
          </div>

          <TabsContent value="campanas" className="space-y-6">
            <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-xl border-0 ring-1 ring-slate-200/50 dark:ring-slate-700/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                    <Send className="h-5 w-5 text-white" />
                  </div>
                  Campañas Activas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <CampanasLoading />
                ) : error ? (
                  <div className="text-center py-8 text-red-500">
                    Error al cargar las campañas: {error}
                  </div>
                ) : filteredCampanas.length === 0 ? (
                  <CampanasEmptyState />
                ) : (
                  <CampanasList 
                    campanas={filteredCampanas} 
                    onRefetch={refetch}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crear" className="space-y-6">
            <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-xl border-0 ring-1 ring-slate-200/50 dark:ring-slate-700/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  Crear Nueva Campaña
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CampanaForm onSuccess={handleCampanaCreated} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Campanas;
