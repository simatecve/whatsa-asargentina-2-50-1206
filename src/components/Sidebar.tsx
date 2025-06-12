
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  Wifi,
  Database,
  Users,
  BarChart,
  Kanban
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarCopyright } from "./sidebar/SidebarCopyright";
import { SidebarHeader } from "./sidebar/SidebarHeader";

type SidebarItemProps = {
  icon: React.ReactNode;
  title: string;
  to: string;
  collapsed: boolean;
};

const SidebarItem = ({ icon, title, to, collapsed }: SidebarItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-azul-100 dark:hover:bg-azul-900 relative",
        isActive ? "bg-azul-100 text-azul-700 dark:bg-azul-900 dark:text-azul-300" : "text-gray-500 dark:text-gray-400",
        collapsed && "justify-center py-3 px-2"
      )
    }
    title={collapsed ? title : undefined}
  >
    <div className={cn("shrink-0", collapsed && "flex justify-center")}>
      {icon}
    </div>
    {!collapsed && <span className="truncate">{title}</span>}
  </NavLink>
);

export const Sidebar = ({ 
  mobileOpen, 
  setMobileOpen, 
  collapsed,
  setCollapsed 
}: { 
  mobileOpen: boolean; 
  setMobileOpen: (open: boolean) => void;
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
}) => {
  // Use the prop value if provided, otherwise use internal state
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = collapsed !== undefined ? collapsed : internalCollapsed;
  
  const navigate = useNavigate();
  const [userData, setUserData] = useState<{
    nombre: string;
    email: string;
    perfil: string;
  } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data, error } = await supabase
          .from("usuarios")
          .select("nombre, email, perfil")
          .eq("user_id", session.user.id)
          .single();
        
        if (!error && data) {
          setUserData(data);
        }
      }
    };

    fetchUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserData();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Sesión cerrada", {
        description: "Ha cerrado sesión exitosamente.",
      });
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Error al cerrar sesión");
    }
  };

  const toggleSidebar = () => {
    if (setCollapsed) {
      setCollapsed(!isCollapsed);
    } else {
      setInternalCollapsed(!isCollapsed);
    }
  };

  const closeMobileSidebar = () => {
    setMobileOpen(false);
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

  // Menú items
  const menuItems = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      title: "Panel Principal",
      to: "/dashboard"
    },
    {
      icon: <Wifi className="h-5 w-5" />,
      title: "Conexión",
      to: "/dashboard/conexion"
    },
    {
      icon: <Database className="h-5 w-5" />,
      title: "CRM",
      to: "/dashboard/crm"
    },
    {
      icon: <Kanban className="h-5 w-5" />,
      title: "Leads Kanban",
      to: "/dashboard/leads-kanban"
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Contactos",
      to: "/dashboard/contactos"
    },
    {
      icon: <BarChart className="h-5 w-5" />,
      title: "Analíticas",
      to: "/dashboard/analiticas"
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Informes",
      to: "/dashboard/informes"
    },
    {
      icon: <Settings className="h-5 w-5" />,
      title: "Configuración",
      to: "/dashboard/configuracion"
    },
  ];

  return (
    <>
      {/* Overlay para dispositivos móviles */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out dark:bg-gray-950 dark:border-gray-800 flex flex-col",
          isCollapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header with Logo */}
        <SidebarHeader isCollapsed={isCollapsed} />

        {/* Toggle Button */}
        <div className="flex justify-end px-2 py-1 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:flex hidden h-6 w-6" 
            onClick={toggleSidebar}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden flex h-6 w-6" 
            onClick={closeMobileSidebar}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Perfil de usuario */}
        {userData && (
          <div className={cn(
            "flex px-3 py-4 gap-3 border-b border-gray-200 dark:border-gray-800 shrink-0",
            isCollapsed && "flex-col items-center px-2"
          )}>
            <Avatar className={cn("h-10 w-10", isCollapsed && "h-8 w-8")}>
              <AvatarImage src="" alt="Avatar" />
              <AvatarFallback className="bg-azul-100 text-azul-700">{getInitials()}</AvatarFallback>
            </Avatar>
            
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <h3 className="font-medium text-sm truncate">{userData.nombre}</h3>
                <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                <span className="text-xs px-2 py-0.5 mt-1 inline-block rounded-full bg-azul-100 text-azul-700 dark:bg-azul-900 dark:text-azul-300">
                  {userData.perfil}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Navigation Menu */}
        <div className="flex-1 overflow-auto pt-3 px-2">
          <nav className="flex flex-col gap-1">
            {menuItems.map((item, index) => (
              <SidebarItem
                key={index}
                icon={item.icon}
                title={item.title}
                to={item.to}
                collapsed={isCollapsed}
              />
            ))}
          </nav>
        </div>

        {/* Copyright */}
        <div className="shrink-0">
          <SidebarCopyright isCollapsed={isCollapsed} />
        </div>

        {/* Logout Button */}
        <div className="p-3 border-t shrink-0">
          <Button 
            variant="outline" 
            className={cn(
              "w-full justify-start text-left gap-2", 
              isCollapsed && "justify-center px-2"
            )}
            onClick={handleLogout}
            title={isCollapsed ? "Cerrar sesión" : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>Cerrar sesión</span>}
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
