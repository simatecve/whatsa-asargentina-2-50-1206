
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnalisisIndividual from "@/components/analytics/AnalisisIndividual";
import { BarChart, TrendingUp, Sparkles, Target, Activity } from "lucide-react";
import { useSubscriptionValidation } from "@/hooks/useSubscriptionValidation";

const Analiticas = () => {
  const { suscripcionActiva } = useSubscriptionValidation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="space-y-8 p-6">
        {/* Header moderno con gradiente */}
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 p-8 rounded-2xl shadow-2xl border border-orange-200/20">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 to-pink-600/90"></div>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <BarChart className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    Analíticas y Reportes
                  </h1>
                  <p className="text-orange-100 text-lg mt-1">
                    Analiza el rendimiento de tus campañas y estrategias
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-orange-100">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span className="text-sm">Métricas avanzadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm">Plan: {suscripcionActiva?.planes?.nombre || 'Básico'}</span>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                <Activity className="h-12 w-12 text-white mb-2" />
                <p className="text-white/90 text-sm font-medium">Analytics</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs modernos */}
        <Tabs defaultValue="individual" className="w-full">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 sm:items-center sm:justify-between mb-6">
            <TabsList className="grid w-full sm:w-auto grid-cols-1 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-lg">
              <TabsTrigger 
                value="individual" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all duration-200"
              >
                Análisis Individual
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="individual" className="space-y-6">
            <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-xl border-0 ring-1 ring-slate-200/50 dark:ring-slate-700/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  Análisis de Rendimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnalisisIndividual />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analiticas;
