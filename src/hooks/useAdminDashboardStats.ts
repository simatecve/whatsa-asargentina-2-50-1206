
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminStats {
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
}

export const useAdminDashboardStats = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalIncome: 0,
    activeSubscriptions: 0,
    totalInstances: 0,
    connectedInstances: 0,
    totalMessages: 0,
    totalConversations: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalContacts: 0,
    totalAgents: 0,
    activeAgents: 0,
    totalLeads: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        console.log("=== DEBUG: Iniciando fetch de estadísticas del admin ===");

        // Fetch total users
        const { count: usersCount } = await supabase
          .from('usuarios')
          .select('*', { count: 'exact', head: true });

        // Fetch total completed payments
        const { data: payments } = await supabase
          .from('pagos')
          .select('monto')
          .eq('estado', 'completado');
        
        const totalIncome = payments?.reduce((acc, payment) => acc + Number(payment.monto), 0) || 0;

        // Fetch active subscriptions
        const { count: subscriptionsCount } = await supabase
          .from('suscripciones')
          .select('*', { count: 'exact', head: true })
          .eq('estado', 'activa');

        // Fetch total instances - CORREGIDO: obtener todas las instancias del sistema
        const { count: instancesCount } = await supabase
          .from('instancias')
          .select('*', { count: 'exact', head: true });

        // Fetch connected instances - CORREGIDO: obtener todas las instancias conectadas
        const { count: connectedInstancesCount } = await supabase
          .from('instancias')
          .select('*', { count: 'exact', head: true })
          .eq('estado', 'connected');

        // Fetch total messages
        const { count: messagesCount } = await supabase
          .from('mensajes')
          .select('*', { count: 'exact', head: true });

        // Fetch total conversations
        const { count: conversationsCount } = await supabase
          .from('conversaciones')
          .select('*', { count: 'exact', head: true });

        // Fetch total campaigns
        const { count: campaignsCount } = await supabase
          .from('campanas')
          .select('*', { count: 'exact', head: true });

        // Fetch active campaigns
        const { count: activeCampaignsCount } = await supabase
          .from('campanas')
          .select('*', { count: 'exact', head: true })
          .eq('estado', 'activa');

        // Fetch total contacts - CORREGIDO: obtener todos los contactos del sistema
        const { count: contactsCount } = await supabase
          .from('contacts')
          .select('*', { count: 'exact', head: true });

        // Fetch total AI agents
        const { count: agentsCount } = await supabase
          .from('agente_ia_config')
          .select('*', { count: 'exact', head: true });

        // Fetch active AI agents
        const { count: activeAgentsCount } = await supabase
          .from('agente_ia_config')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        // Fetch total leads
        const { count: leadsCount } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true });

        console.log("=== Estadísticas obtenidas ===", {
          usersCount,
          totalIncome,
          subscriptionsCount,
          instancesCount,
          connectedInstancesCount,
          messagesCount,
          conversationsCount,
          campaignsCount,
          activeCampaignsCount,
          contactsCount,
          agentsCount,
          activeAgentsCount,
          leadsCount
        });

        setStats({
          totalUsers: usersCount || 0,
          totalIncome,
          activeSubscriptions: subscriptionsCount || 0,
          totalInstances: instancesCount || 0,
          connectedInstances: connectedInstancesCount || 0,
          totalMessages: messagesCount || 0,
          totalConversations: conversationsCount || 0,
          totalCampaigns: campaignsCount || 0,
          activeCampaigns: activeCampaignsCount || 0,
          totalContacts: contactsCount || 0,
          totalAgents: agentsCount || 0,
          activeAgents: activeAgentsCount || 0,
          totalLeads: leadsCount || 0
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
};
