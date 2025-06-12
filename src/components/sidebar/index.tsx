
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import SidebarMenu from "./SidebarMenu";
import SidebarMobileMenu from "./SidebarMobileMenu";
import { SidebarCopyright } from "./SidebarCopyright";
import { SidebarHeader } from "./SidebarHeader";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error al cerrar sesión:", error);
        toast.error("Error al cerrar sesión");
        return;
      }
      
      toast.success("Sesión cerrada", {
        description: "Ha cerrado sesión exitosamente.",
      });
      navigate("/login");
    } catch (error) {
      console.error("Error inesperado al cerrar sesión:", error);
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
          // Para móviles, usar ancho fijo más pequeño
          isMobile ? "w-72" : (isCollapsed ? "w-16" : "w-64"),
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header with Logo */}
        <SidebarHeader isCollapsed={isCollapsed && !isMobile} />

        {/* Toggle Button - Solo mostrar en desktop */}
        {!isMobile && (
          <div className="flex justify-end px-2 py-1 border-b border-gray-200 dark:border-gray-800 shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={toggleSidebar}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        )}

        {/* Toggle Button para móviles */}
        {isMobile && (
          <div className="flex justify-between items-center px-3 py-2 border-b border-gray-200 dark:border-gray-800 shrink-0">
            <h2 className="text-lg font-semibold text-azul-700">Menú</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={closeMobileSidebar}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Menu items - Diferentes para móvil y desktop */}
        {isMobile ? (
          <SidebarMobileMenu collapsed={false} />
        ) : (
          <SidebarMenu collapsed={isCollapsed} />
        )}

        {/* Copyright - Solo en desktop */}
        {!isMobile && (
          <div className="shrink-0">
            <SidebarCopyright isCollapsed={isCollapsed} />
          </div>
        )}

        {/* Logout button */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 shrink-0">
          <Button 
            variant="outline" 
            className={cn(
              "w-full justify-start text-left gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950", 
              isCollapsed && !isMobile && "justify-center px-2"
            )}
            onClick={handleLogout}
            title={isCollapsed && !isMobile ? "Cerrar sesión" : undefined}
          >
            <LogOut className="h-5 w-5" />
            {(!isCollapsed || isMobile) && <span>Cerrar sesión</span>}
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
