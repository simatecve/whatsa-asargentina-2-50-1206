
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";

type PerfilData = {
  nombre: string;
  email: string;
};

const PerfilUsuario = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [formData, setFormData] = useState<PerfilData>({
    nombre: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchPerfilData();
  }, []);

  const fetchPerfilData = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("No se pudo verificar tu sesión");
        return;
      }
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('nombre, email')
        .eq('user_id', session.user.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setFormData({
          nombre: data.nombre || "",
          email: data.email || "",
        });
      }
    } catch (error) {
      console.error("Error al obtener datos del perfil:", error);
      toast.error("Error al cargar los datos del perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof PerfilData, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData({
      ...passwordData,
      [field]: value,
    });
  };

  const handleSavePerfil = async () => {
    try {
      setSaving(true);
      
      if (!formData.nombre.trim()) {
        toast.error("El nombre es obligatorio");
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("No se pudo verificar tu sesión");
        return;
      }
      
      // Actualizar datos en la tabla usuarios
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({
          nombre: formData.nombre.trim(),
          email: formData.email.trim(),
        })
        .eq('user_id', session.user.id);
      
      if (updateError) throw updateError;
      
      // Si el email cambió, actualizar también en auth
      if (formData.email !== session.user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email.trim()
        });
        
        if (emailError) {
          console.warn("Error al actualizar email en auth:", emailError);
          toast.warning("Perfil actualizado, pero verifica tu nuevo email");
        }
      }
      
      toast.success("Perfil actualizado correctamente");
      
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      toast.error("Error al actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setChangingPassword(true);
      
      if (!passwordData.newPassword || !passwordData.confirmPassword) {
        toast.error("Por favor completa todos los campos de contraseña");
        return;
      }
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error("Las contraseñas no coinciden");
        return;
      }
      
      if (passwordData.newPassword.length < 6) {
        toast.error("La contraseña debe tener al menos 6 caracteres");
        return;
      }
      
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      
      if (error) throw error;
      
      toast.success("Contraseña actualizada correctamente");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      toast.error("Error al cambiar la contraseña");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>
            Actualiza tu información personal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4 mt-4"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre completo *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  placeholder="Tu nombre completo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="tu@email.com"
                />
              </div>
            </>
          )}
        </CardContent>
        
        <CardFooter>
          <Button 
            onClick={handleSavePerfil} 
            className="bg-azul-700 hover:bg-azul-800"
            disabled={loading || saving}
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cambiar Contraseña</CardTitle>
          <CardDescription>
            Actualiza tu contraseña de acceso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva contraseña</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
              placeholder="Repite la nueva contraseña"
            />
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            onClick={handleChangePassword} 
            variant="outline"
            disabled={changingPassword}
          >
            {changingPassword ? "Cambiando..." : "Cambiar Contraseña"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PerfilUsuario;
