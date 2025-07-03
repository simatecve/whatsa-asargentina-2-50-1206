import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import KanbanBoard from "@/components/leads/KanbanBoard";
import { Kanban, Sparkles, TrendingUp, Target } from "lucide-react";
import { useSubscriptionValidation } from "@/hooks/useSubscriptionValidation";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Lead } from "@/types/lead";

const LeadsKanban = () => {
  const { suscripcionActiva } = useSubscriptionValidation();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Obtener leads del usuario
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        setLeads([]);
        return;
      }

      // Primero obtener los nombres de las instancias del usuario
      const { data: instancesData, error: instancesError } = await supabase
        .from("instancias")
        .select("nombre")
        .eq("user_id", userData.user.id);

      if (instancesError) {
        console.error("Error fetching instances:", instancesError);
        setLeads([]);
        return;
      }

      if (!instancesData || instancesData.length === 0) {
        setLeads([]);
        return;
      }

      // Extraer los nombres de las instancias
      const instanceNames = instancesData.map(instance => instance.nombre);

      // Obtener leads de las instancias del usuario
      const { data: leadsData, error } = await supabase
        .from("leads")
        .select("*")
        .in("instancia", instanceNames)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching leads:", error);
        setLeads([]);
      } else {
        setLeads(leadsData || []);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleUpdateStatus = async (leadId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({ status: newStatus })
        .eq("id", leadId);

      if (error) {
        console.error("Error updating lead status:", error);
        return false;
      }

      // Actualizar el estado local
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        )
      );

      return true;
    } catch (error) {
      console.error("Error updating lead status:", error);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="space-y-8 p-6">
        {/* Header moderno con gradiente */}
        <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-blue-600 to-indigo-600 p-8 rounded-2xl shadow-2xl border border-green-200/20">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 to-indigo-600/90"></div>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Kanban className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    Kanban de Leads
                  </h1>
                  <p className="text-green-100 text-lg mt-1">
                    Gestiona tu pipeline de ventas de forma visual
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-green-100">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span className="text-sm">Pipeline de ventas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm">Plan: {suscripcionActiva?.planes?.nombre || 'Básico'}</span>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                <TrendingUp className="h-12 w-12 text-white mb-2" />
                <p className="text-white/90 text-sm font-medium">Kanban</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-xl border-0 ring-1 ring-slate-200/50 dark:ring-slate-700/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                <Kanban className="h-5 w-5 text-white" />
              </div>
              Pipeline de Ventas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-gray-500">Cargando leads...</p>
                </div>
              </div>
            ) : (
              <KanbanBoard 
                leads={leads}
                onUpdateStatus={handleUpdateStatus}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeadsKanban;
