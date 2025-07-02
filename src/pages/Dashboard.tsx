
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserProfile } from "@/components/UserProfile";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Send, Package, AlertTriangle, Sparkles, TrendingUp, Users, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useSubscriptionValidation } from "@/hooks/useSubscriptionValidation";
import { DashboardStatsGrid } from "@/components/dashboard/DashboardStatsGrid";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { LimitAlert } from "@/components/subscription/LimitAlert";

const Dashboard = () => {
  const [userData, setUserData] = useState<{
    nombre: string;
    email: string;
    perfil: string;
    created_at?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { stats, loading: statsLoading, error: statsError, refetch } = useDashboardStats();
  const { suscripcionActiva, limits, isExpired } = useSubscriptionValidation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Fetch user data
          const { data, error } = await supabase
            .from("usuarios")
            .select("*")
            .eq("user_id", session.user.id)
            .single();
          
          if (error) {
            console.error("Error fetching user data:", error);
            toast.error("Error al cargar los datos del usuario");
          } else if (data) {
            setUserData(data);
          }
        }
      } catch (err) {
        console.error("Exception fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) {
        fetchUserData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Refrescar estadísticas cuando los datos del usuario cambien
  useEffect(() => {
    if (userData) {
      refetch();
    }
  }, [userData, refetch]);

  const isSuscripcionExpired = suscripcionActiva && new Date(suscripcionActiva.fecha_fin) < new Date();

  // Función para verificar y mostrar alertas de límites
  const checkAndShowLimitAlerts = () => {
    if (!limits || !suscripcionActiva) return null;

    const alerts = [];
    
    // Verificar límite de instancias
    const instanciasPercentage = (limits.currentInstancias / limits.maxInstancias) * 100;
    if (instanciasPercentage >= 100) {
      alerts.push(
        <LimitAlert
          key="instancias-error"
          type="error"
          title="Límite de Instancias Alcanzado"
          description={`Has alcanzado el límite máximo de instancias para tu plan ${suscripcionActiva.planes.nombre}.`}
          current={limits.currentInstancias}
          max={limits.maxInstancias}
          planName={suscripcionActiva.planes.nombre}
        />
      );
    } else if (instanciasPercentage >= 80) {
      alerts.push(
        <LimitAlert
          key="instancias-warning"
          type="warning"
          title="Límite de Instancias Próximo"
          description={`Estás cerca del límite de instancias de tu plan ${suscripcionActiva.planes.nombre}.`}
          current={limits.currentInstancias}
          max={limits.maxInstancias}
          planName={suscripcionActiva.planes.nombre}
        />
      );
    }

    // Verificar límite de contactos
    const contactosPercentage = (limits.currentContactos / limits.maxContactos) * 100;
    if (contactosPercentage >= 100) {
      alerts.push(
        <LimitAlert
          key="contactos-error"
          type="error"
          title="Límite de Contactos Alcanzado"
          description={`Has alcanzado el límite máximo de contactos para tu plan ${suscripcionActiva.planes.nombre}.`}
          current={limits.currentContactos}
          max={limits.maxContactos}
          planName={suscripcionActiva.planes.nombre}
        />
      );
    } else if (contactosPercentage >= 80) {
      alerts.push(
        <LimitAlert
          key="contactos-warning"
          type="warning"
          title="Límite de Contactos Próximo"
          description={`Estás cerca del límite de contactos de tu plan ${suscripcionActiva.planes.nombre}.`}
          current={limits.currentContactos}
          max={limits.maxContactos}
          planName={suscripcionActiva.planes.nombre}
        />
      );
    }

    // Verificar límite de campañas
    const campanasPercentage = (limits.currentCampanas / limits.maxCampanas) * 100;
    if (campanasPercentage >= 100) {
      alerts.push(
        <LimitAlert
          key="campanas-error"
          type="error"
          title="Límite de Campañas Alcanzado"
          description={`Has alcanzado el límite máximo de campañas para tu plan ${suscripcionActiva.planes.nombre}.`}
          current={limits.currentCampanas}
          max={limits.maxCampanas}
          planName={suscripcionActiva.planes.nombre}
        />
      );
    } else if (campanasPercentage >= 80) {
      alerts.push(
        <LimitAlert
          key="campanas-warning"
          type="warning"
          title="Límite de Campañas Próximo"
          description={`Estás cerca del límite de campañas de tu plan ${suscripcionActiva.planes.nombre}.`}
          current={limits.currentCampanas}
          max={limits.maxCampanas}
          planName={suscripcionActiva.planes.nombre}
        />
      );
    }

    return alerts;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="space-y-8 p-6">
        {userData && (
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 rounded-2xl shadow-2xl border border-blue-200/20">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90"></div>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      ¡Bienvenido de vuelta, {userData.nombre}!
                    </h1>
                    <p className="text-blue-100 text-lg mt-1">
                      Gestiona tu negocio desde un solo lugar
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-blue-100">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">Perfil: {userData.perfil}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm">Sistema activo</span>
                  </div>
                </div>
              </div>
              
              <div className="hidden lg:block">
                <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                  <TrendingUp className="h-12 w-12 text-white mb-2" />
                  <p className="text-white/90 text-sm font-medium">Dashboard</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alertas de límites */}
        {checkAndShowLimitAlerts()}

        {/* Estadísticas principales */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
              <BarChart className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Resumen General</h2>
          </div>
          <DashboardStatsGrid 
            stats={stats} 
            loading={statsLoading} 
            error={statsError} 
            maxCampanas={suscripcionActiva?.planes?.max_campanas}
            maxInstancias={suscripcionActiva?.planes?.max_instancias}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Suscripción */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl shadow-xl border-0 ring-1 ring-slate-200/50 dark:ring-slate-700/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full -mr-10 -mt-10"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Su Suscripción</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Estado de su plan actual</p>
                </div>
              </div>
              
              {loading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                </div>
              ) : suscripcionActiva ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-700/50">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Plan:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{suscripcionActiva.planes.nombre}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Precio:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">${suscripcionActiva.planes.precio.toFixed(2)}/{suscripcionActiva.planes.periodo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Vence el:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{format(new Date(suscripcionActiva.fecha_fin), "dd/MM/yyyy")}</span>
                          {isSuscripcionExpired && (
                            <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full font-medium">
                              Vencido
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {limits && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Límites del Plan:</p>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <span className="text-xs text-slate-600 dark:text-slate-400">Instancias:</span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${limits.currentInstancias >= limits.maxInstancias ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {limits.currentInstancias}/{limits.maxInstancias}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <span className="text-xs text-slate-600 dark:text-slate-400">Contactos:</span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${limits.currentContactos >= limits.maxContactos ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {limits.currentContactos}/{limits.maxContactos}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <span className="text-xs text-slate-600 dark:text-slate-400">Campañas:</span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${limits.currentCampanas >= limits.maxCampanas ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {limits.currentCampanas}/{limits.maxCampanas}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200/50 dark:border-yellow-700/50">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-700 dark:text-slate-300">No tiene una suscripción activa. Adquiera un plan para acceder a todas las funcionalidades.</p>
                  </div>
                  <Button 
                    asChild
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg rounded-xl"
                  >
                    <Link to="/dashboard/planes">
                      Ver planes disponibles
                    </Link>
                  </Button>
                </div>
              )}
              
              {suscripcionActiva && (
                <div className="mt-4">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full rounded-xl border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <Link to="/dashboard/planes">
                      <Package className="mr-2 h-4 w-4" />
                      Administrar Plan
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Información de Cuenta */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl shadow-xl border-0 ring-1 ring-slate-200/50 dark:ring-slate-700/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full -mr-10 -mt-10"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Información de Cuenta</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Sus datos personales</p>
                </div>
              </div>
              
              {userData && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Usuario:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{userData.nombre}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Email:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate">{userData.email}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Perfil:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{userData.perfil}</span>
                  </div>
                  {userData.created_at && (
                    <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <span className="text-slate-600 dark:text-slate-400 text-sm">Miembro desde:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{format(new Date(userData.created_at), "MMM yyyy")}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Envío Masivo */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl shadow-xl border-0 ring-1 ring-slate-200/50 dark:ring-slate-700/50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full -mr-10 -mt-10"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                  <Send className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Envío Masivo</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Gestión de campañas</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-700/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Campañas enviadas:</span>
                    <span className="font-bold text-xl text-slate-800 dark:text-slate-200">
                      {suscripcionActiva?.planes?.max_campanas 
                        ? `${stats.activeCampaigns}/${suscripcionActiva.planes.max_campanas}`
                        : stats.activeCampaigns
                      }
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Envíe campañas masivas dentro de su límite del plan.
                  </p>
                </div>
                
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg rounded-xl"
                >
                  <Link to="/dashboard/campanas">
                    <Send className="mr-2 h-4 w-4" />
                    Ir a Campañas
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sección inferior con acciones rápidas y actividad reciente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <QuickActions />
          <RecentActivity />
        </div>

        {/* UserProfile conservado para funcionalidad existente */}
        <div className="mt-8">
          <UserProfile />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
