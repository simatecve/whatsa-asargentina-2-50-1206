import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserProfile } from "@/components/UserProfile";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Send, Package, AlertTriangle } from "lucide-react";
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
    <div className="space-y-6">
      {userData && (
        <div className="bg-gradient-to-r from-azul-100 to-azul-50 dark:from-azul-900 dark:to-gray-900 p-6 rounded-lg border border-azul-200 dark:border-azul-800 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight text-azul-700 dark:text-azul-300">
            ¡Bienvenido de vuelta, {userData.nombre}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Aquí tienes un resumen de tu actividad y el estado de tus instancias de WhatsApp.
          </p>
        </div>
      )}

      {/* Alertas de límites */}
      {checkAndShowLimitAlerts()}

      {/* Estadísticas principales */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Resumen General</h2>
        <DashboardStatsGrid stats={stats} loading={statsLoading} error={statsError} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Suscripción */}
        <Card className="p-6 relative">
          <h3 className="text-lg font-medium flex items-center">
            <Package className="mr-2 h-5 w-5 text-blue-500" />
            Su Suscripción
          </h3>
          <p className="text-gray-500 mt-1">Estado de su plan actual</p>
          
          {loading ? (
            <p className="mt-4 text-sm">Cargando información...</p>
          ) : suscripcionActiva ? (
            <div className="mt-4 text-sm">
              <p>
                Plan: <span className="font-medium">{suscripcionActiva.planes.nombre}</span>
              </p>
              <p>
                Precio: <span className="font-medium">${suscripcionActiva.planes.precio.toFixed(2)}/{suscripcionActiva.planes.periodo}</span>
              </p>
              <p>
                Vence el: <span className="font-medium">{format(new Date(suscripcionActiva.fecha_fin), "dd/MM/yyyy")}</span>
                {isSuscripcionExpired && (
                  <span className="ml-2 text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">
                    Vencido
                  </span>
                )}
              </p>
              {limits && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Instancias:</span>
                    <span className={`font-medium ${limits.currentInstancias >= limits.maxInstancias ? 'text-red-500' : ''}`}>
                      {limits.currentInstancias}/{limits.maxInstancias}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Contactos:</span>
                    <span className={`font-medium ${limits.currentContactos >= limits.maxContactos ? 'text-red-500' : ''}`}>
                      {limits.currentContactos}/{limits.maxContactos}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Campañas:</span>
                    <span className={`font-medium ${limits.currentCampanas >= limits.maxCampanas ? 'text-red-500' : ''}`}>
                      {limits.currentCampanas}/{limits.maxCampanas}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                <p className="text-sm">No tiene una suscripción activa. Adquiera un plan para acceder a todas las funcionalidades.</p>
              </div>
              <Button 
                asChild
                variant="outline"
                size="sm"
              >
                <Link to="/dashboard/planes">
                  Ver planes disponibles
                </Link>
              </Button>
            </div>
          )}
          
          {suscripcionActiva && (
            <div className="absolute bottom-6 right-6">
              <Button
                asChild
                variant="outline"
                size="sm"
              >
                <Link to="/dashboard/planes">
                  <Package className="mr-2 h-4 w-4" />
                  Administrar Plan
                </Link>
              </Button>
            </div>
          )}
        </Card>

        {/* Perfil de usuario mejorado */}
        <Card className="p-6">
          <h3 className="text-lg font-medium">Información de Cuenta</h3>
          <p className="text-gray-500 mt-1">Sus datos personales</p>
          {userData && (
            <div className="mt-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Usuario:</span>
                <span className="font-medium">{userData.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{userData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Perfil:</span>
                <span className="font-medium capitalize">{userData.perfil}</span>
              </div>
              {userData.created_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Miembro desde:</span>
                  <span className="font-medium">{format(new Date(userData.created_at), "MMM yyyy")}</span>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Acceso rápido a campañas */}
        <Card className="p-6 relative">
          <h3 className="text-lg font-medium">Envío Masivo</h3>
          <p className="text-gray-500 mt-1">Gestión de campañas</p>
          <div className="mt-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span>Campañas activas:</span>
              <span className="font-medium">{stats.activeCampaigns}</span>
            </div>
            <div className="flex justify-between">
              <span>Total campañas:</span>
              <span className="font-medium">{stats.totalCampaigns}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Cree y gestione campañas de envío masivo para sus listas de contactos.
            </p>
          </div>
          <div className="absolute bottom-6 right-6">
            <Button
              asChild
              className="bg-green-500 hover:bg-green-600"
            >
              <Link to="/dashboard/campanas">
                <Send className="mr-2 h-4 w-4" />
                Ir a Campañas
              </Link>
            </Button>
          </div>
        </Card>
      </div>

      {/* Sección inferior con acciones rápidas y actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions />
        <RecentActivity />
      </div>

      {/* UserProfile conservado para funcionalidad existente */}
      <div className="mt-8">
        <UserProfile />
      </div>
    </div>
  );
};

export default Dashboard;
