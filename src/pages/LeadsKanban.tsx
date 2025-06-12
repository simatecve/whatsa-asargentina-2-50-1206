
import { useEffect, useState } from "react";
import { ConnectionProvider } from "@/contexts/ConnectionContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import KanbanBoard from "@/components/leads/KanbanBoard";
import { Lead } from "@/types/lead";
import { useLeadNavigation } from "@/hooks/useLeadNavigation";

const LeadsKanbanContent = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInstances, setUserInstances] = useState<string[]>([]);
  const { navigateToConversation } = useLeadNavigation();

  // Fetch the logged in user's instances
  useEffect(() => {
    const fetchUserInstances = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError("No hay sesión activa");
        setLoading(false);
        return;
      }

      const { data: instances, error: instancesError } = await supabase
        .from("instancias")
        .select("nombre")
        .eq("user_id", session.user.id);

      if (instancesError) {
        console.error("Error fetching instances:", instancesError);
        setError("Error al cargar las instancias");
        setLoading(false);
        return;
      }

      if (instances && instances.length > 0) {
        const instanceNames = instances.map(inst => inst.nombre);
        setUserInstances(instanceNames);
      } else {
        setError("No hay instancias disponibles");
        setLoading(false);
      }
    };

    fetchUserInstances();
  }, []);

  // Fetch leads for user's instances
  useEffect(() => {
    if (userInstances.length === 0) return;

    const fetchLeads = async () => {
      try {
        setLoading(true);
        
        const { data, error: leadsError } = await supabase
          .from("leads")
          .select("*")
          .in("instancia", userInstances);

        if (leadsError) {
          console.error("Error fetching leads:", leadsError);
          setError("Error al cargar los leads");
          toast.error("Error al cargar los leads");
        } else {
          setLeads(data || []);
        }
      } catch (err) {
        console.error("Exception fetching leads:", err);
        setError("Ocurrió un error al conectar con la base de datos");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();

    // Set up realtime subscription to listen for changes
    const channel = supabase
      .channel('leads-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'leads',
          filter: `instancia=in.(${userInstances.map(i => `'${i}'`).join(',')})` 
        }, 
        (payload) => {
          console.log('Change received!', payload);
          
          if (payload.eventType === 'INSERT') {
            setLeads(prev => [...prev, payload.new as Lead]);
          } else if (payload.eventType === 'UPDATE') {
            setLeads(prev => prev.map(lead => 
              lead.id === payload.new.id ? payload.new as Lead : lead
            ));
            
            // Show a toast notification when a lead status is updated
            if ((payload.old as Lead).status !== (payload.new as Lead).status) {
              toast.success(`Lead actualizado: ${(payload.new as Lead).pushname || 'Sin nombre'}`);
            }
          } else if (payload.eventType === 'DELETE') {
            setLeads(prev => prev.filter(lead => lead.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userInstances]);

  // Function to update a lead's status
  const updateLeadStatus = async (leadId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) {
        console.error("Error updating lead status:", error);
        toast.error("Error al actualizar el estado del lead");
        return false;
      }

      // We don't need to update the state here as the realtime subscription will handle it
      return true;
    } catch (err) {
      console.error("Exception updating lead:", err);
      toast.error("Error al actualizar el lead");
      return false;
    }
  };

  // Handle lead click to navigate to CRM
  const handleLeadClick = (lead: Lead) => {
    toast.success(`Navegando al CRM para ${lead.pushname || 'Sin nombre'}...`);
    navigateToConversation(lead);
  };

  if (loading) {
    return (
      <Card className="w-full h-[calc(100vh-120px)] bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <Skeleton className="w-full h-full" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full h-[calc(100vh-120px)] bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">Error</h3>
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-120px)] bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm p-6">
      <KanbanBoard 
        leads={leads} 
        onUpdateStatus={updateLeadStatus}
        onLeadClick={handleLeadClick}
      />
    </div>
  );
};

const LeadsKanban = () => {
  return (
    <ConnectionProvider>
      <div className="h-full">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Leads Kanban</h1>
        <LeadsKanbanContent />
      </div>
    </ConnectionProvider>
  );
};

export default LeadsKanban;
