
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DashboardStats } from "./dashboard/types";
import { useSubscriptionData } from "./dashboard/useSubscriptionData";
import { useInstancesStats } from "./dashboard/useInstancesStats";
import { useMessagesStats } from "./dashboard/useMessagesStats";
import { useConversationsStats } from "./dashboard/useConversationsStats";
import { useLeadsStats } from "./dashboard/useLeadsStats";
import { useCampaignsStats } from "./dashboard/useCampaignsStats";
import { useContactsStats } from "./dashboard/useContactsStats";
import { useAgentsStats } from "./dashboard/useAgentsStats";

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalInstances: 0,
    connectedInstances: 0,
    totalConversations: 0,
    unreadMessages: 0,
    totalLeads: 0,
    newLeads: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalContacts: 0,
    activeAgents: 0,
    consumedMessages: 0,
    maxMessages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getSubscriptionData } = useSubscriptionData();
  const { getInstancesStats } = useInstancesStats();
  const { getMessagesStats } = useMessagesStats();
  const { getConversationsStats } = useConversationsStats();
  const { getLeadsStats } = useLeadsStats();
  const { getCampaignsStats } = useCampaignsStats();
  const { getContactsStats } = useContactsStats();
  const { getAgentsStats } = useAgentsStats();

  const fetchStats = async () => {
    try {
      console.log("Iniciando fetch de estadísticas...");
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.log("No hay sesión de usuario");
        setLoading(false);
        return;
      }

      console.log("Usuario encontrado:", session.user.id);

      // Obtener datos de suscripción
      const { suscripcion, maxMessages, maxCampanas } = await getSubscriptionData(session.user.id);

      // Obtener estadísticas de instancias
      const { totalInstances, connectedInstances, instanceNames } = await getInstancesStats(session.user.id);

      // Obtener estadísticas de mensajes
      const { consumedMessages } = await getMessagesStats(instanceNames, suscripcion, maxMessages);

      // Obtener estadísticas de conversaciones
      const { totalConversations, unreadMessages } = await getConversationsStats(instanceNames);

      // Obtener estadísticas de leads
      const { totalLeads, newLeads } = await getLeadsStats(instanceNames);

      // Obtener estadísticas de campañas
      const { totalCampaigns, activeCampaigns } = await getCampaignsStats(session.user.id, maxCampanas);

      // Obtener estadísticas de contactos
      const { totalContacts } = await getContactsStats(session.user.id);

      // Obtener estadísticas de agentes IA
      const { activeAgents } = await getAgentsStats(session.user.id);

      const newStats = {
        totalInstances,
        connectedInstances,
        totalConversations,
        unreadMessages,
        totalLeads,
        newLeads,
        totalCampaigns,
        activeCampaigns,
        totalContacts,
        activeAgents,
        consumedMessages,
        maxMessages
      };

      console.log("Estadísticas finales:", newStats);
      setStats(newStats);

    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setError("Error al cargar las estadísticas del dashboard");
      toast.error("Error al cargar las estadísticas del dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
};
