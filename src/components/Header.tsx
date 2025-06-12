import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
const Header = ({
  setMobileOpen
}: {
  setMobileOpen: (open: boolean) => void;
}) => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [userData, setUserData] = useState<{
    nombre: string;
    email: string;
    perfil: string;
  } | null>(null);
  useEffect(() => {
    // Configurar el detector de cambios de sesión
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);

      // Si hay una sesión, cargar los datos del usuario
      if (currentSession?.user) {
        setTimeout(() => {
          fetchUserData(currentSession.user.id);
        }, 0);
      } else {
        setUserData(null);
      }
    });

    // Verificar si ya existe una sesión
    supabase.auth.getSession().then(({
      data: {
        session: currentSession
      }
    }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        fetchUserData(currentSession.user.id);
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  const fetchUserData = async (userId: string) => {
    try {
      const {
        data,
        error
      } = await supabase.from("usuarios").select("nombre, email, perfil").eq("user_id", userId).single();
      if (error) {
        console.error("Error al cargar datos del usuario:", error);
        toast.error("No se pudieron cargar los datos de usuario");
      } else if (data) {
        setUserData(data);
      }
    } catch (e) {
      console.error("Error inesperado:", e);
    }
  };
  const handleLogout = async () => {
    try {
      const {
        error
      } = await supabase.auth.signOut();
      if (error) {
        console.error("Error al cerrar sesión:", error);
        toast.error("Error al cerrar sesión");
        return;
      }
      toast.success("Sesión cerrada", {
        description: "Ha cerrado sesión exitosamente."
      });
      navigate("/login");
    } catch (error) {
      console.error("Error inesperado al cerrar sesión:", error);
      toast.error("Error al cerrar sesión");
    }
  };

  // Obtener las iniciales para el avatar
  const getInitials = () => {
    if (userData?.nombre) {
      const nameParts = userData.nombre.split(" ");
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      }
      return userData.nombre.substring(0, 2).toUpperCase();
    }
    return "US";
  };
  return <header className="sticky top-0 z-30 h-14 flex items-center bg-white border-b border-gray-200 px-4 dark:bg-gray-950 dark:border-gray-800">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
        <Menu className="h-5 w-5" />
      </Button>
      
      {userData && <div className="ml-4 flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
          <h1 className="text-lg font-semibold hidden md:inline">
            ¡Bienvenido, <span className="text-azul-600">{userData.nombre}</span>!
          </h1>
          <span className="md:hidden font-medium">Hola, {userData.nombre}</span>
          <span className="hidden md:inline text-xs px-2 py-1 rounded-full bg-azul-100 text-azul-700 dark:bg-azul-900 dark:text-azul-300">
            {userData.perfil}
          </span>
        </div>}
      
      <div className="ml-auto flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt="Avatar" />
                <AvatarFallback className="bg-azul-100 text-azul-700">{getInitials()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userData?.nombre || "Usuario"}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userData?.email || "usuario@ejemplo.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => navigate("/dashboard/configuracion")}>
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>;
};
export default Header;