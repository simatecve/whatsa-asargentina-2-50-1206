
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectionTabs } from "@/components/connection/ConnectionTabs";
import { Wifi, Sparkles, TrendingUp, Zap } from "lucide-react";
import { useSubscriptionValidation } from "@/hooks/useSubscriptionValidation";

const Conexion = () => {
  const { suscripcionActiva, limits } = useSubscriptionValidation();

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
                  <Wifi className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    Conexión WhatsApp
                  </h1>
                  <p className="text-blue-100 text-lg mt-1">
                    Conecta y gestiona tus instancias de WhatsApp
                  </p>
                </div>
              </div>
              
              {limits && (
                <div className="flex items-center gap-6 text-blue-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">Instancias: {limits.currentInstancias}/{limits.maxInstancias}</span>
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
                <Zap className="h-12 w-12 text-white mb-2" />
                <p className="text-white/90 text-sm font-medium">Conexión</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-xl border-0 ring-1 ring-slate-200/50 dark:ring-slate-700/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                <Wifi className="h-5 w-5 text-white" />
              </div>
              Gestión de Instancias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ConnectionTabs />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Conexion;
