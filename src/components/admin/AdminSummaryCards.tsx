
import { Card } from "@/components/ui/card";

interface AdminSummaryCardsProps {
  stats: {
    totalUsers: number;
    totalIncome: number;
    activeSubscriptions: number;
    totalMessages: number;
    totalConversations: number;
    totalLeads: number;
    totalInstances: number;
    totalAgents: number;
    activeAgents: number;
    totalCampaigns: number;
    totalContacts: number;
  };
}

export const AdminSummaryCards = ({ stats }: AdminSummaryCardsProps) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Resumen del Sistema</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total de usuarios:</span>
            <span className="font-medium">{formatNumber(stats.totalUsers)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Usuarios con suscripciones:</span>
            <span className="font-medium">{formatNumber(stats.activeSubscriptions)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tasa de conversión:</span>
            <span className="font-medium">
              {stats.totalUsers > 0 ? ((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(1) : '0'}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Ingreso promedio por usuario:</span>
            <span className="font-medium">
              {formatCurrency(stats.activeSubscriptions > 0 ? stats.totalIncome / stats.activeSubscriptions : 0)}
            </span>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Actividad de Comunicación</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Mensajes por conversación:</span>
            <span className="font-medium">
              {stats.totalConversations > 0 ? (stats.totalMessages / stats.totalConversations).toFixed(1) : '0'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Leads por instancia:</span>
            <span className="font-medium">
              {stats.totalInstances > 0 ? (stats.totalLeads / stats.totalInstances).toFixed(1) : '0'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Eficiencia de agentes:</span>
            <span className="font-medium">
              {stats.totalAgents > 0 ? ((stats.activeAgents / stats.totalAgents) * 100).toFixed(1) : '0'}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Contactos por campaña:</span>
            <span className="font-medium">
              {stats.totalCampaigns > 0 ? (stats.totalContacts / stats.totalCampaigns).toFixed(1) : '0'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
