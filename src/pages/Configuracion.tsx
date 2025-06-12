import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PerfilUsuario from "@/components/configuracion/PerfilUsuario";

type DatosNegocio = {
  id?: string;
  nombre_empresa: string;
  direccion: string | null;
  horario_apertura: string | null;
  horario_cierre: string | null;
  dias_laborables: string[] | null;
  telefono: string | null;
  correo: string | null;
  sitio_web: string | null;
  descripcion: string | null;
};

const diasSemana = [
  { id: "lunes", label: "Lunes" },
  { id: "martes", label: "Martes" },
  { id: "miercoles", label: "Miércoles" },
  { id: "jueves", label: "Jueves" },
  { id: "viernes", label: "Viernes" },
  { id: "sabado", label: "Sábado" },
  { id: "domingo", label: "Domingo" },
];

const Configuracion = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<DatosNegocio>({
    nombre_empresa: "",
    direccion: null,
    horario_apertura: null,
    horario_cierre: null,
    dias_laborables: [],
    telefono: null,
    correo: null,
    sitio_web: null,
    descripcion: null,
  });

  useEffect(() => {
    fetchDatosNegocio();
  }, []);

  const fetchDatosNegocio = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("No se pudo verificar tu sesión", {
          description: "Por favor, inicia sesión nuevamente.",
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('datos_negocio')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setFormData({
          id: data.id,
          nombre_empresa: data.nombre_empresa || "",
          direccion: data.direccion || null,
          horario_apertura: data.horario_apertura || null,
          horario_cierre: data.horario_cierre || null,
          dias_laborables: data.dias_laborables || [],
          telefono: data.telefono || null,
          correo: data.correo || null,
          sitio_web: data.sitio_web || null,
          descripcion: data.descripcion || null,
        });
      }
    } catch (error) {
      console.error("Error al obtener datos del negocio:", error);
      toast.error("Error al cargar los datos", {
        description: "No se pudieron cargar los datos del negocio.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof DatosNegocio, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleDiaChange = (dia: string, checked: boolean) => {
    const currentDays = formData.dias_laborables || [];
    
    if (checked) {
      handleInputChange('dias_laborables', [...currentDays, dia]);
    } else {
      handleInputChange('dias_laborables', currentDays.filter(d => d !== dia));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (!formData.nombre_empresa) {
        toast.error("Datos incompletos", {
          description: "El nombre de la empresa es obligatorio.",
        });
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("No se pudo verificar tu sesión", {
          description: "Por favor, inicia sesión nuevamente.",
        });
        return;
      }
      
      const dataToSave = {
        ...formData,
        user_id: session.user.id,
        updated_at: new Date().toISOString(),
      };
      
      let result;
      
      if (formData.id) {
        result = await supabase
          .from('datos_negocio')
          .update(dataToSave)
          .eq('id', formData.id);
      } else {
        result = await supabase
          .from('datos_negocio')
          .insert([dataToSave]);
      }
      
      const { error } = result;
      
      if (error) throw error;
      
      toast.success("Datos guardados", {
        description: "Los datos de tu negocio se guardaron correctamente.",
      });
      
      fetchDatosNegocio();
      
    } catch (error) {
      console.error("Error al guardar datos del negocio:", error);
      toast.error("Error al guardar", {
        description: "No se pudieron guardar los datos. Intenta nuevamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona tu perfil y la información de tu negocio
        </p>
      </div>

      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="perfil">Mi Perfil</TabsTrigger>
          <TabsTrigger value="negocio">Datos del Negocio</TabsTrigger>
        </TabsList>
        
        <TabsContent value="perfil" className="space-y-6">
          <PerfilUsuario />
        </TabsContent>
        
        <TabsContent value="negocio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
              <CardDescription>
                Datos básicos de su empresa o negocio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4 mt-4"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="nombreEmpresa">Nombre de la Empresa *</Label>
                    <Input
                      id="nombreEmpresa"
                      value={formData.nombre_empresa}
                      onChange={(e) => handleInputChange("nombre_empresa", e.target.value)}
                      placeholder="Ingrese el nombre de su empresa"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      value={formData.descripcion || ""}
                      onChange={(e) => handleInputChange("descripcion", e.target.value)}
                      placeholder="Breve descripción de su negocio"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      value={formData.direccion || ""}
                      onChange={(e) => handleInputChange("direccion", e.target.value)}
                      placeholder="Dirección completa"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Horario de Atención</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="horarioApertura" className="text-xs text-gray-500">Apertura</Label>
                        <Input
                          id="horarioApertura"
                          type="time"
                          value={formData.horario_apertura || ""}
                          onChange={(e) => handleInputChange("horario_apertura", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="horarioCierre" className="text-xs text-gray-500">Cierre</Label>
                        <Input
                          id="horarioCierre"
                          type="time"
                          value={formData.horario_cierre || ""}
                          onChange={(e) => handleInputChange("horario_cierre", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Días Laborables</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                      {diasSemana.map((dia) => (
                        <div key={dia.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={dia.id} 
                            checked={formData.dias_laborables?.includes(dia.id) || false}
                            onCheckedChange={(checked) => 
                              handleDiaChange(dia.id, checked === true)}
                          />
                          <label
                            htmlFor={dia.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {dia.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            
            <CardHeader className="pt-0">
              <CardTitle className="text-lg">Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono || ""}
                      onChange={(e) => handleInputChange("telefono", e.target.value)}
                      placeholder="Número de contacto"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="correo">Correo Electrónico</Label>
                    <Input
                      id="correo"
                      type="email"
                      value={formData.correo || ""}
                      onChange={(e) => handleInputChange("correo", e.target.value)}
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sitioWeb">Sitio Web</Label>
                    <Input
                      id="sitioWeb"
                      value={formData.sitio_web || ""}
                      onChange={(e) => handleInputChange("sitio_web", e.target.value)}
                      placeholder="https://www.ejemplo.com"
                    />
                  </div>
                </>
              )}
            </CardContent>
            
            <CardFooter>
              <Button 
                onClick={handleSave} 
                className="bg-azul-700 hover:bg-azul-800"
                disabled={loading || saving}
              >
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Configuracion;
