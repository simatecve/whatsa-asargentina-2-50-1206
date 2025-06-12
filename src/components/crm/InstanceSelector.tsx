
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

interface Instance {
  id: string;
  nombre: string;
  estado: string;
}

interface InstanceSelectorProps {
  selectedInstanceId: string;
  onInstanceChange: (instanceId: string) => void;
}

export const InstanceSelector = ({ selectedInstanceId, onInstanceChange }: InstanceSelectorProps) => {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchInstances = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data, error } = await supabase
          .from('instancias')
          .select('id, nombre, estado')
          .eq('user_id', session.user.id)
          .eq('estado', 'connected')
          .order('nombre');

        if (error) throw error;
        setInstances(data || []);
      } catch (error) {
        console.error('Error fetching instances:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstances();
  }, []);

  if (loading) {
    return <div className="w-48 h-10 bg-gray-200 animate-pulse rounded" />;
  }

  const getPlaceholder = () => {
    if (isMobile) {
      return "Instancias";
    }
    return "Seleccionar instancia";
  };

  return (
    <Select value={selectedInstanceId} onValueChange={onInstanceChange}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder={getPlaceholder()} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas las instancias</SelectItem>
        {instances.map((instance) => (
          <SelectItem key={instance.id} value={instance.id}>
            {instance.nombre}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
