import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Calendar, Power } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type AgenteIA = {
  id: string;
  nombre_agente: string;
  instance_name: string;
  is_active: boolean;
  created_at: string;
  user_id: string;
  usuario_nombre: string;
  usuario_email: string;
};

export default function AgentesIAAdmin() {
  const [agentes, setAgentes] = useState<AgenteIA[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggleAllLoading, setToggleAllLoading] = useState(false);

  const fetchAgentes = async () => {
    try {
      setLoading(true);
      console.log("=== DEBUG: Iniciando fetchAgentes ===");
      
      // Primero vamos a verificar si hay datos en la tabla
      const { count, error: countError } = await supabase
        .from("agente_ia_config")
        .select("*", { count: 'exact', head: true });

      console.log("Total de registros en agente_ia_config:", count);
      console.log("Error al contar:", countError);

      // Ahora hagamos la consulta normal
      const { data, error } = await supabase
        .from("agente_ia_config")
        .select(`
          id,
          nombre_agente,
          instance_name,
          is_active,
          created_at,
          user_id
        `)
        .order("created_at", { ascending: false });

      console.log("=== Resultado de la consulta principal ===");
      console.log("Data:", data);
      console.log("Error:", error);
      console.log("Número de registros encontrados:", data?.length || 0);

      if (error) {
        console.error("Error loading agentes:", error);
        toast.error("Error al cargar los agentes: " + error.message);
        return;
      }

      if (!data || data.length === 0) {
        console.log("No hay agentes de IA en el sistema");
        toast.info("No hay agentes de IA registrados en el sistema");
        setAgentes([]);
        return;
      }

      console.log("=== Procesando datos de usuarios ===");
      // Fetch user data separately
      const userIds = [...new Set(data.map(agente => agente.user_id))];
      console.log("User IDs únicos encontrados:", userIds);
      
      const { data: usuarios, error: usuariosError } = await supabase
        .from("usuarios")
        .select("user_id, nombre, email")
        .in("user_id", userIds);

      console.log("Usuarios encontrados:", usuarios);
      console.log("Error al buscar usuarios:", usuariosError);

      if (usuariosError) {
        console.error("Error loading usuarios:", usuariosError);
        toast.error("Error al cargar información de usuarios: " + usuariosError.message);
        // Continuamos con los datos de agentes aunque no tengamos info de usuarios
      }

      // Create a map for quick user lookup
      const usuariosMap = new Map();
      usuarios?.forEach(usuario => {
        usuariosMap.set(usuario.user_id, usuario);
      });

      console.log("Mapa de usuarios creado:", usuariosMap);

      // Combine the data
      const formattedData = data.map(agente => {
        const usuario = usuariosMap.get(agente.user_id);
        console.log(`Procesando agente ${agente.id}:`, {
          agente,
          usuario,
          user_id: agente.user_id
        });
        
        return {
          ...agente,
          usuario_nombre: usuario?.nombre || 'Usuario no encontrado',
          usuario_email: usuario?.email || 'Email no disponible'
        };
      });

      console.log("=== Datos finales formateados ===");
      console.log("Número de agentes procesados:", formattedData.length);
      formattedData.forEach((agente, index) => {
        console.log(`Agente ${index + 1}:`, agente);
      });

      setAgentes(formattedData);
      toast.success(`Se cargaron ${formattedData.length} agentes correctamente`);
    } catch (error) {
      console.error("=== EXCEPCIÓN al cargar agentes ===", error);
      toast.error("Error inesperado al cargar los agentes");
    } finally {
      setLoading(false);
    }
  };

  const toggleAgenteStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("agente_ia_config")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) {
        console.error("Error updating agente status:", error);
        toast.error("Error al actualizar el estado del agente");
        return;
      }

      toast.success(`Agente ${!currentStatus ? "activado" : "desactivado"} correctamente`);
      fetchAgentes();
    } catch (error) {
      console.error("Exception updating agente status:", error);
      toast.error("Error al actualizar el estado del agente");
    }
  };

  const toggleAllAgentes = async (activate: boolean) => {
    if (!confirm(`¿Está seguro de ${activate ? "activar" : "desactivar"} TODOS los agentes?`)) {
      return;
    }

    try {
      setToggleAllLoading(true);
      
      // Necesitamos actualizar solo los registros existentes
      const { error } = await supabase
        .from("agente_ia_config")
        .update({ is_active: activate })
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Condición que siempre será verdadera

      if (error) {
        console.error("Error updating all agentes:", error);
        toast.error("Error al actualizar el estado de los agentes");
        return;
      }

      toast.success(`Todos los agentes ${activate ? "activados" : "desactivados"} correctamente`);
      fetchAgentes();
    } catch (error) {
      console.error("Exception updating all agentes:", error);
      toast.error("Error al actualizar el estado de los agentes");
    } finally {
      setToggleAllLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentes();
  }, []);

  const agentesActivos = agentes.filter(a => a.is_active).length;
  const agentesInactivos = agentes.filter(a => !a.is_active).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestión de Agentes IA
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra todos los agentes de IA del sistema
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => toggleAllAgentes(true)}
            disabled={toggleAllLoading}
            variant="outline"
            className="text-green-600 hover:text-green-700"
          >
            <Power className="mr-2 h-4 w-4" />
            Activar Todos
          </Button>
          <Button
            onClick={() => toggleAllAgentes(false)}
            disabled={toggleAllLoading}
            variant="outline"
            className="text-red-600 hover:text-red-700"
          >
            <Power className="mr-2 h-4 w-4" />
            Desactivar Todos
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{agentes.length}</p>
                <p className="text-sm text-gray-600">Total Agentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Power className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{agentesActivos}</p>
                <p className="text-sm text-gray-600">Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Power className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{agentesInactivos}</p>
                <p className="text-sm text-gray-600">Inactivos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Agentes */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agentes.map((agente) => (
          <Card key={agente.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Bot className="mr-2 h-5 w-5 text-blue-600" />
                  {agente.nombre_agente}
                </CardTitle>
                <Switch
                  checked={agente.is_active}
                  onCheckedChange={() => toggleAgenteStatus(agente.id, agente.is_active)}
                />
              </div>
              <CardDescription>
                Instancia: {agente.instance_name || 'No asignada'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={agente.is_active ? "default" : "secondary"}
                    className={agente.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {agente.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <User className="mr-2 h-4 w-4" />
                    <div>
                      <p className="font-medium">{agente.usuario_nombre}</p>
                      <p className="text-xs text-gray-500">{agente.usuario_email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>
                      {new Date(agente.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {agentes.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Bot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No hay agentes de IA registrados en el sistema
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Los usuarios pueden crear agentes desde la sección "Agente IA" en su dashboard
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
