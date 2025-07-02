
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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-r border-slate-200/60 dark:border-slate-700/60 transition-all duration-300 ease-in-out flex flex-col shadow-xl",
          // Para móviles, usar ancho fijo más pequeño
          isMobile ? "w-72" : (isCollapsed ? "w-16" : "w-64"),
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header with Logo */}
        <SidebarHeader isCollapsed={isCollapsed && !isMobile} />

        {/* Toggle Button - Solo mostrar en desktop */}
        {!isMobile && (
          <div className="flex justify-end px-2 py-2 border-b border-slate-200/60 dark:border-slate-700/60 shrink-0 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-200 shadow-sm" 
              onClick={toggleSidebar}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        )}

        {/* Toggle Button para móviles */}
        {isMobile && (
          <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200/60 dark:border-slate-700/60 shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Menú Principal</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-xl hover:bg-white/60 dark:hover:bg-slate-600/60 transition-all duration-200" 
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
        <div className="p-3 border-t border-slate-200/60 dark:border-slate-700/60 shrink-0 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700">
          <Button 
            variant="outline" 
            className={cn(
              "w-full justify-start text-left gap-3 text-red-600 hover:text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/20 dark:hover:to-red-800/20 border-red-200 dark:border-red-800 rounded-xl transition-all duration-200 shadow-sm font-medium", 
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
