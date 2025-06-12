
import React from "react";
import { NavLink } from "react-router-dom";
import { 
  Users, 
  CreditCard, 
  Package, 
  Home,
  LogOut,
  Bot,
  Settings,
  Receipt,
  Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error al cerrar sesión:", error);
        toast.error("Error al cerrar sesión");
        return;
      }
      
      toast.success("Sesión cerrada correctamente");
      navigate("/login");
    } catch (error) {
      console.error("Error inesperado al cerrar sesión:", error);
      toast.error("Error al cerrar sesión");
    }
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col min-h-screen">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-azul-700 dark:text-azul-300">
          Panel Admin
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Gestión del sistema
        </p>
      </div>

      <nav className="flex-1 mt-6 px-3">
        <NavLink 
          to="/admin"
          className={({ isActive }) => 
            `flex items-center px-4 py-3 mb-2 rounded-md ${
              isActive 
                ? "bg-azul-100 text-azul-700 dark:bg-azul-900 dark:text-azul-300" 
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`
          }
          end
        >
          <Home className="mr-3 h-5 w-5" />
          Dashboard
        </NavLink>

        <NavLink 
          to="/admin/usuarios"
          className={({ isActive }) => 
            `flex items-center px-4 py-3 mb-2 rounded-md ${
              isActive 
                ? "bg-azul-100 text-azul-700 dark:bg-azul-900 dark:text-azul-300" 
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`
          }
        >
          <Users className="mr-3 h-5 w-5" />
          Usuarios
        </NavLink>

        <NavLink 
          to="/admin/agentes-ia"
          className={({ isActive }) => 
            `flex items-center px-4 py-3 mb-2 rounded-md ${
              isActive 
                ? "bg-azul-100 text-azul-700 dark:bg-azul-900 dark:text-azul-300" 
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`
          }
        >
          <Bot className="mr-3 h-5 w-5" />
          Agentes IA
        </NavLink>

        <NavLink 
          to="/admin/planes"
          className={({ isActive }) => 
            `flex items-center px-4 py-3 mb-2 rounded-md ${
              isActive 
                ? "bg-azul-100 text-azul-700 dark:bg-azul-900 dark:text-azul-300" 
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`
          }
        >
          <Package className="mr-3 h-5 w-5" />
          Planes
        </NavLink>

        <NavLink 
          to="/admin/suscripciones"
          className={({ isActive }) => 
            `flex items-center px-4 py-3 mb-2 rounded-md ${
              isActive 
                ? "bg-azul-100 text-azul-700 dark:bg-azul-900 dark:text-azul-300" 
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`
          }
        >
          <CreditCard className="mr-3 h-5 w-5" />
          Suscripciones
        </NavLink>

        <NavLink 
          to="/admin/pagos"
          className={({ isActive }) => 
            `flex items-center px-4 py-3 mb-2 rounded-md ${
              isActive 
                ? "bg-azul-100 text-azul-700 dark:bg-azul-900 dark:text-azul-300" 
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`
          }
        >
          <Receipt className="mr-3 h-5 w-5" />
          Pagos
        </NavLink>

        <NavLink 
          to="/admin/consumo-tokens"
          className={({ isActive }) => 
            `flex items-center px-4 py-3 mb-2 rounded-md ${
              isActive 
                ? "bg-azul-100 text-azul-700 dark:bg-azul-900 dark:text-azul-300" 
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`
          }
        >
          <Activity className="mr-3 h-5 w-5" />
          Consumo Tokens
        </NavLink>

        <NavLink 
          to="/admin/pagos?tab=methods"
          className={({ isActive }) => 
            `flex items-center px-4 py-3 mb-2 rounded-md ${
              isActive 
                ? "bg-azul-100 text-azul-700 dark:bg-azul-900 dark:text-azul-300" 
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`
          }
        >
          <Settings className="mr-3 h-5 w-5" />
          Config. Pagos
        </NavLink>
      </nav>

      <div className="mt-auto p-3 border-t border-gray-200 dark:border-gray-700">
        <Button 
          variant="outline" 
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  );
};
