
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart } from "lucide-react";
import { toast } from "sonner";

interface MensajeStats {
  numero: string;
  pushname: string;
  total: number;
}

const AnalisisIndividual = () => {
  const [instancias, setInstancias] = useState<{ nombre: string, id: string }[]>([]);
  const [selectedInstancia, setSelectedInstancia] = useState<string>("");
  const [mensajesStats, setMensajesStats] = useState<MensajeStats[]>([]);
  const [totalMensajes, setTotalMensajes] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);

  // Cargar instancias
  useEffect(() => {
    const fetchInstancias = async () => {
      try {
        const { data, error } = await supabase
          .from("instancias")
          .select("id, nombre")
          .order("nombre");

        if (error) throw error;
        setInstancias(data || []);
        if (data && data.length > 0) {
          setSelectedInstancia(data[0].nombre);
        }
      } catch (error) {
        console.error("Error al cargar instancias:", error);
        toast.error("No se pudieron cargar las instancias");
      } finally {
        setLoading(false);
      }
    };

    fetchInstancias();
  }, []);

  // Cargar estadísticas cuando cambia la instancia seleccionada
  useEffect(() => {
    if (!selectedInstancia) return;
    
    const fetchMensajesStats = async () => {
      setLoadingStats(true);
      try {
        // Primero, obtenemos todos los mensajes de la instancia seleccionada
        const { data, error } = await supabase
          .from("mensajes")
          .select("numero, pushname")
          .eq("instancia", selectedInstancia)
          .not("numero", "is", null);

        if (error) throw error;
        
        // Luego calculamos manualmente el conteo por número
        const countByNumber: Record<string, {count: number, pushname: string}> = {};
        data.forEach(msg => {
          // Limpiar el número eliminando el sufijo @s.whatsapp.net
          const cleanNumber = msg.numero ? msg.numero.replace(/@s\.whatsapp\.net$/, '') : 'Desconocido';
          
          // Si ya existe una entrada para este número, incrementar el contador
          if (countByNumber[cleanNumber]) {
            countByNumber[cleanNumber].count += 1;
          } else {
            // Si no existe, crear una nueva entrada con el pushname
            countByNumber[cleanNumber] = {
              count: 1,
              pushname: msg.pushname || 'Sin nombre'
            };
          }
        });
        
        // Convertimos el objeto a un array de objetos con la estructura deseada
        const statsData: MensajeStats[] = Object.entries(countByNumber).map(
          ([numero, { count, pushname }]) => ({
            numero,
            pushname,
            total: count
          })
        );
        
        // Ordenar de mayor a menor
        statsData.sort((a, b) => b.total - a.total);
        
        setMensajesStats(statsData);
        
        // Calcular el total de mensajes
        const total = statsData.reduce((sum, item) => sum + item.total, 0);
        setTotalMensajes(total);
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
        toast.error("No se pudieron cargar las estadísticas de mensajes");
      } finally {
        setLoadingStats(false);
      }
    };

    fetchMensajesStats();
  }, [selectedInstancia]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="w-full md:w-64">
          <Select 
            value={selectedInstancia} 
            onValueChange={setSelectedInstancia}
            disabled={loading || instancias.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una instancia" />
            </SelectTrigger>
            <SelectContent>
              {instancias.map((instancia) => (
                <SelectItem key={instancia.id} value={instancia.nombre}>
                  {instancia.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card className="w-full md:w-auto">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
              <BarChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total mensajes</p>
              <p className="text-xl font-bold">{loadingStats ? <Skeleton className="h-6 w-16" /> : totalMensajes}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Análisis de Mensajes por Número</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStats ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : mensajesStats.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay mensajes para esta instancia.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-12 font-medium text-sm text-muted-foreground">
                <div className="col-span-3 md:col-span-2">Número</div>
                <div className="col-span-3 md:col-span-6">Nombre</div>
                <div className="col-span-4 md:col-span-3">Total Mensajes</div>
                <div className="col-span-2 md:col-span-1">%</div>
              </div>
              <div className="divide-y">
                {mensajesStats.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 py-2">
                    <div className="col-span-3 md:col-span-2 truncate">
                      {item.numero}
                    </div>
                    <div className="col-span-3 md:col-span-6 truncate">
                      {item.pushname}
                    </div>
                    <div className="col-span-4 md:col-span-3 font-medium">
                      {item.total}
                    </div>
                    <div className="col-span-2 md:col-span-1 text-sm text-muted-foreground">
                      {totalMensajes > 0 ? `${Math.round((item.total / totalMensajes) * 100)}%` : '0%'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalisisIndividual;
