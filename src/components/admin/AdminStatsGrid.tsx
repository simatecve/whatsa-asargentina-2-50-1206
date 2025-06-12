
import { BarChart, DollarSign, Users, MessageCircle, Bot, Send, Phone, Database } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";

interface AdminStatsGridProps {
  stats: {
    totalUsers: number;
    totalIncome: number;
    activeSubscriptions: number;
    totalInstances: number;
    connectedInstances: number;
    totalMessages: number;
    totalConversations: number;
    totalCampaigns: number;
    activeCampaigns: number;
    totalContacts: number;
    totalAgents: number;
    activeAgents: number;
    totalLeads: number;
  };
  loading: boolean;
}

export const AdminStatsGrid = ({ stats, loading }: AdminStatsGridProps) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="p-6 rounded-lg border bg-card animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-1"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Usuarios Totales" 
          value={formatNumber(stats.totalUsers)} 
          icon={Users} 
          iconColor="text-blue-500"
          description="Usuarios registrados en el sistema" 
        />
        
        <StatsCard 
          title="Ingresos Totales" 
          value={formatCurrency(stats.totalIncome)} 
          icon={DollarSign} 
          iconColor="text-green-500"
          description="Ingresos por pagos completados" 
        />
        
        <StatsCard 
          title="Suscripciones Activas" 
          value={formatNumber(stats.activeSubscriptions)} 
          icon={BarChart} 
          iconColor="text-purple-500"
          description="Usuarios con planes activos" 
        />
        
        <StatsCard 
          title="Instancias WhatsApp" 
          value={`${formatNumber(stats.connectedInstances)}/${formatNumber(stats.totalInstances)}`} 
          icon={Phone} 
          iconColor="text-orange-500"
          description="Conectadas/Total" 
        />
      </div>

      {/* Estadísticas de mensajería y comunicación */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Mensajes Procesados" 
          value={formatNumber(stats.totalMessages)} 
          icon={MessageCircle} 
          iconColor="text-cyan-500"
          description="Total de mensajes en el sistema" 
        />
        
        <StatsCard 
          title="Conversaciones" 
          value={formatNumber(stats.totalConversations)} 
          icon={MessageCircle} 
          iconColor="text-indigo-500"
          description="Conversaciones activas" 
        />
        
        <StatsCard 
          title="Campañas" 
          value={`${formatNumber(stats.activeCampaigns)}/${formatNumber(stats.totalCampaigns)}`} 
          icon={Send} 
          iconColor="text-pink-500"
          description="Activas/Total" 
        />
        
        <StatsCard 
          title="Contactos" 
          value={formatNumber(stats.totalContacts)} 
          icon={Users} 
          iconColor="text-emerald-500"
          description="Contactos en listas" 
        />
      </div>

      {/* Estadísticas de IA y leads */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard 
          title="Agentes IA" 
          value={`${formatNumber(stats.activeAgents)}/${formatNumber(stats.totalAgents)}`} 
          icon={Bot} 
          iconColor="text-violet-500"
          description="Activos/Total" 
        />
        
        <StatsCard 
          title="Leads Generados" 
          value={formatNumber(stats.totalLeads)} 
          icon={Database} 
          iconColor="text-amber-500"
          description="Leads capturados" 
        />
        
        <StatsCard 
          title="Eficiencia Instancias" 
          value={`${Math.round((stats.connectedInstances / Math.max(stats.totalInstances, 1)) * 100)}%`} 
          icon={BarChart} 
          iconColor="text-teal-500"
          description="Porcentaje de conexión" 
        />
      </div>
    </>
  );
};
