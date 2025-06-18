
import { MessageCircle, Users, Zap, Phone, Bot, Send, AlertCircle, TrendingUp, AlertTriangle } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStatsGridProps {
  stats: {
    totalInstances: number;
    connectedInstances: number;
    totalConversations: number;
    unreadMessages: number;
    totalLeads: number;
    newLeads: number;
    totalCampaigns: number;
    activeCampaigns: number;
    totalContacts: number;
    activeAgents: number;
    consumedMessages: number;
    maxMessages: number;
  };
  loading: boolean;
  error?: string | null;
  maxCampanas?: number;
  maxInstancias?: number;
}

export const DashboardStatsGrid = ({ stats, loading, error, maxCampanas, maxInstancias }: DashboardStatsGridProps) => {
  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="col-span-full p-4 text-center text-red-600 bg-red-50 rounded-lg">
          <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
          <p>Error al cargar las estadísticas</p>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="p-6 rounded-lg border bg-card">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    );
  }

  // Determinar el color del icono basado en el porcentaje de uso de mensajes
  const messageUsagePercentage = stats.maxMessages > 0 ? (stats.consumedMessages / stats.maxMessages) * 100 : 0;
  const messageIconColor = messageUsagePercentage >= 90 ? "text-red-500" : 
                          messageUsagePercentage >= 75 ? "text-orange-500" : 
                          "text-green-500";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Instancias WhatsApp"
        value={maxInstancias ? `${stats.connectedInstances}/${maxInstancias}` : stats.connectedInstances}
        description="Conectadas del plan"
        icon={Phone}
        iconColor="text-green-500"
      />
      
      <StatsCard
        title="Conversaciones"
        value={stats.totalConversations}
        description={`${stats.unreadMessages} mensajes sin leer`}
        icon={MessageCircle}
        iconColor="text-blue-500"
      />
      
      <StatsCard
        title="Leads"
        value={stats.totalLeads}
        description={`${stats.newLeads} nuevos leads`}
        icon={TrendingUp}
        iconColor="text-purple-500"
      />
      
      <StatsCard
        title="Contactos"
        value={stats.totalContacts}
        description="Total en listas"
        icon={Users}
        iconColor="text-orange-500"
      />
      
      <StatsCard
        title="Campañas Enviadas"
        value={maxCampanas ? `${stats.activeCampaigns}/${maxCampanas}` : stats.activeCampaigns}
        description="Dentro del plan"
        icon={Send}
        iconColor="text-pink-500"
      />
      
      <StatsCard
        title="Agentes IA"
        value={stats.activeAgents}
        description="Agentes activos"
        icon={Bot}
        iconColor="text-indigo-500"
      />
      
      <StatsCard
        title="Mensajes Recibidos"
        value={`${stats.consumedMessages}/${stats.maxMessages}`}
        description="Desde inicio de suscripción"
        icon={AlertCircle}
        iconColor={messageIconColor}
      />
      
      <StatsCard
        title="Eficiencia"
        value={`${Math.round((stats.connectedInstances / Math.max(stats.totalInstances, 1)) * 100)}%`}
        description="Instancias conectadas"
        icon={Zap}
        iconColor="text-yellow-500"
      />
    </div>
  );
};
