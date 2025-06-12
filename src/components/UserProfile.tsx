
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type UserData = {
  nombre: string;
  email: string;
  perfil: string;
  created_at?: string;
};

export function UserProfile() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Configurar el detector de cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (currentSession?.user) {
          setTimeout(() => {
            fetchUserData(currentSession.user.id);
          }, 0);
        } else {
          setUserData(null);
          setIsLoading(false);
        }
      }
    );

    // Verificar si ya existe una sesión
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (currentSession?.user) {
        fetchUserData(currentSession.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error al cargar datos del usuario:", error);
        toast.error("No se pudieron cargar los datos de usuario");
      } else if (data) {
        setUserData(data);
      }
    } catch (e) {
      console.error("Error inesperado:", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Perfil de Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Perfil de Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No hay información de usuario disponible. Por favor inicie sesión.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil de Usuario</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Nombre</p>
            <p className="text-lg font-semibold">{userData.nombre}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="text-lg">{userData.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Perfil</p>
            <p className="text-lg">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {userData.perfil || "Usuario"}
              </span>
            </p>
          </div>
          {userData.created_at && (
            <div className="col-span-1 md:col-span-3">
              <p className="text-sm font-medium text-gray-500">Miembro desde</p>
              <p className="text-sm">{new Date(userData.created_at).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
