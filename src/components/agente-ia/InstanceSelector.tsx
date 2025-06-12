
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { Smartphone } from "lucide-react";
import { toast } from "sonner";
import { AgenteIAForm } from "./agenteIASchema";

type Instance = {
  id: string;
  nombre: string;
  estado: string;
};

interface InstanceSelectorProps {
  form: UseFormReturn<AgenteIAForm>;
}

export const InstanceSelector = ({ form }: InstanceSelectorProps) => {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchInstances = async () => {
      try {
        setLoading(true);
        
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData?.user) {
          toast.error("Usuario no autenticado");
          return;
        }
        
        const { data, error } = await supabase
          .from("instancias")
          .select("id, nombre, estado")
          .eq("user_id", userData.user.id)
          .eq("is_active", true)
          .order("nombre");
          
        if (error) {
          throw error;
        }
        
        setInstances(data || []);
      } catch (error) {
        console.error("Error al cargar instancias:", error);
        toast.error("Error al cargar las instancias disponibles");
      } finally {
        setLoading(false);
      }
    };
    
    fetchInstances();
  }, []);
  
  return (
    <div>
      <div className="flex items-center mb-2">
        <Smartphone className="mr-2 h-4 w-4 text-green-500" />
        <h3 className="font-medium">Seleccionar Instancia de WhatsApp</h3>
      </div>
      
      <FormField
        control={form.control}
        name="instance_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Instancia para el Agente IA *</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
              disabled={loading || instances.length === 0}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={
                    loading 
                      ? "Cargando instancias..." 
                      : instances.length === 0 
                        ? "No hay instancias conectadas" 
                        : "Seleccione una instancia"
                  } />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {instances.map((instance) => (
                  <SelectItem key={instance.id} value={instance.nombre}>
                    {instance.nombre} {instance.estado === "connected" ? "✅" : "⚠️"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {instances.length === 0 && !loading && (
        <div className="mt-2 text-sm text-yellow-600">
          No tiene instancias conectadas. Por favor, configure una instancia primero en la sección de Conexión.
        </div>
      )}
    </div>
  );
};
