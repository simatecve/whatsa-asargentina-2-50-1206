
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Users, Send, Bot } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ActivityItem {
  id: string;
  type: 'message' | 'lead' | 'campaign' | 'agent';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

export const RecentActivity = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        // Obtener instancias del usuario
        const { data: userInstances } = await supabase
          .from('instancias')
          .select('nombre')
          .eq('user_id', session.user.id);

        const instanceNames = userInstances?.map(i => i.nombre) || [];
        const recentActivities: ActivityItem[] = [];

        // Mensajes recientes (últimas conversaciones)
        if (instanceNames.length > 0) {
          const { data: recentMessages } = await supabase
            .from('conversaciones')
            .select('numero_contacto, nombre_contacto, ultimo_mensaje_fecha, mensajes_no_leidos')
            .in('instancia_nombre', instanceNames)
            .order('ultimo_mensaje_fecha', { ascending: false })
            .limit(3);

          recentMessages?.forEach(msg => {
            if (msg.ultimo_mensaje_fecha) {
              recentActivities.push({
                id: `msg-${msg.numero_contacto}`,
                type: 'message',
                title: `Mensaje de ${msg.nombre_contacto || msg.numero_contacto}`,
                description: `${msg.mensajes_no_leidos || 0} mensajes sin leer`,
                timestamp: msg.ultimo_mensaje_fecha,
                status: msg.mensajes_no_leidos > 0 ? 'unread' : 'read'
              });
            }
          });
        }

        // Leads recientes
        if (instanceNames.length > 0) {
          const { data: recentLeads } = await supabase
            .from('leads')
            .select('id, pushname, status, created_at')
            .in('instancia', instanceNames)
            .order('created_at', { ascending: false })
            .limit(2);

          recentLeads?.forEach(lead => {
            recentActivities.push({
              id: `lead-${lead.id}`,
              type: 'lead',
              title: `Nuevo lead: ${lead.pushname || 'Sin nombre'}`,
              description: `Estado: ${lead.status}`,
              timestamp: lead.created_at,
              status: lead.status
            });
          });
        }

        // Campañas recientes
        const { data: recentCampaigns } = await supabase
          .from('campanas')
          .select('id, nombre, estado, created_at')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(2);

        recentCampaigns?.forEach(campaign => {
          recentActivities.push({
            id: `campaign-${campaign.id}`,
            type: 'campaign',
            title: `Campaña: ${campaign.nombre}`,
            description: `Estado: ${campaign.estado}`,
            timestamp: campaign.created_at,
            status: campaign.estado
          });
        });

        // Ordenar por fecha más reciente
        const sortedActivities = recentActivities
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5);

        setActivities(sortedActivities);
      } catch (error) {
        console.error("Error fetching recent activity:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'message': return MessageCircle;
      case 'lead': return Users;
      case 'campaign': return Send;
      case 'agent': return Bot;
      default: return MessageCircle;
    }
  };

  const getStatusColor = (type: string, status?: string) => {
    if (type === 'message' && status === 'unread') return 'bg-red-100 text-red-800';
    if (type === 'lead' && status === 'new') return 'bg-blue-100 text-blue-800';
    if (type === 'campaign' && status === 'activa') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No hay actividad reciente para mostrar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = getIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    {activity.status && (
                      <Badge 
                        variant="secondary" 
                        className={`ml-2 ${getStatusColor(activity.type, activity.status)}`}
                      >
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(activity.timestamp), "dd/MM/yyyy HH:mm", { locale: es })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
