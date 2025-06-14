import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DashboardStats {
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
}

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
    activeAgents: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      console.log("Iniciando fetch de estadísticas...");
      setLoading(true);
      setError(null);

      // Obtener usuario actual de la sesión (sin simulación)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No hay usuario autenticado");
        setLoading(false);
        return;
      }

      const currentUserId = user.id;
      console.log("Usuario encontrado:", currentUserId);

      // Obtener estadísticas de instancias
      const { data: instances, error: instancesError } = await supabase
        .from('instancias')
        .select('estado')
        .eq('user_id', currentUserId);

      if (instancesError) {
        console.error("Error obteniendo instancias:", instancesError);
        throw instancesError;
      }

      const totalInstances = instances?.length || 0;
      const connectedInstances = instances?.filter(i => i.estado === 'connected').length || 0;

      console.log(`Instancias: ${connectedInstances}/${totalInstances}`);

      // Obtener nombres de instancias del usuario para filtrar datos relacionados
      const { data: userInstances, error: userInstancesError } = await supabase
        .from('instancias')
        .select('nombre')
        .eq('user_id', currentUserId);

      if (userInstancesError) {
        console.error("Error obteniendo nombres de instancias:", userInstancesError);
        throw userInstancesError;
      }

      const instanceNames = userInstances?.map(i => i.nombre) || [];
      console.log("Nombres de instancias:", instanceNames);

      // Obtener estadísticas de conversaciones
      let totalConversations = 0;
      let unreadMessages = 0;
      
      if (instanceNames.length > 0) {
        const { data: conversations, error: conversationsError } = await supabase
          .from('conversaciones')
          .select('mensajes_no_leidos')
          .in('instancia_nombre', instanceNames);

        if (conversationsError) {
          console.error("Error obteniendo conversaciones:", conversationsError);
        } else {
          totalConversations = conversations?.length || 0;
          unreadMessages = conversations?.reduce((acc, conv) => acc + (conv.mensajes_no_leidos || 0), 0) || 0;
          console.log(`Conversaciones: ${totalConversations}, Mensajes no leídos: ${unreadMessages}`);
        }
      }

      // Obtener estadísticas de leads
      let totalLeads = 0;
      let newLeads = 0;
      
      if (instanceNames.length > 0) {
        const { data: leads, error: leadsError } = await supabase
          .from('leads')
          .select('status')
          .in('instancia', instanceNames);

        if (leadsError) {
          console.error("Error obteniendo leads:", leadsError);
        } else {
          totalLeads = leads?.length || 0;
          newLeads = leads?.filter(l => l.status === 'new').length || 0;
          console.log(`Leads: ${totalLeads}, Nuevos: ${newLeads}`);
        }
      }

      // Obtener estadísticas de campañas
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campanas')
        .select('estado')
        .eq('user_id', currentUserId);

      if (campaignsError) {
        console.error("Error obteniendo campañas:", campaignsError);
        throw campaignsError;
      }

      const totalCampaigns = campaigns?.length || 0;
      const activeCampaigns = campaigns?.filter(c => c.estado === 'activa').length || 0;

      console.log(`Campañas: ${activeCampaigns}/${totalCampaigns}`);

      // Obtener estadísticas de contactos
      const { count: contactsCount, error: contactsError } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', currentUserId);

      if (contactsError) {
        console.error("Error obteniendo contactos:", contactsError);
        throw contactsError;
      }

      const totalContacts = contactsCount || 0;
      console.log(`Contactos: ${totalContacts}`);

      // Obtener estadísticas de agentes IA
      const { data: agents, error: agentsError } = await supabase
        .from('agente_ia_config')
        .select('is_active')
        .eq('user_id', currentUserId);

      if (agentsError) {
        console.error("Error obteniendo agentes IA:", agentsError);
        throw agentsError;
      }

      const activeAgents = agents?.filter(a => a.is_active).length || 0;
      console.log(`Agentes IA activos: ${activeAgents}`);

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
        activeAgents
      };

      console.log("Estadísticas finales:", newStats);
      setStats(newStats);

    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError("Error al cargar las estadísticas");
      toast.error("Error al cargar las estadísticas del dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};
