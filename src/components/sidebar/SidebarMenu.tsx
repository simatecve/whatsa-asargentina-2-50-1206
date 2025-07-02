
import React, { useState, useEffect } from "react";
import SidebarItem from "./SidebarItem";
import {
  LayoutDashboard,
  Plug,
  Users,
  Send,
  Megaphone,
  Settings,
  BarChart,
  CreditCard,
  MessageSquare,
  Bot,
  Kanban
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SidebarMenu = ({ collapsed }) => {
  const [userPerfil, setUserPerfil] = useState(null);

  useEffect(() => {
    const fetchUserPerfil = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data, error } = await supabase
            .from("usuarios")
            .select("perfil")
            .eq("user_id", session.user.id)
            .single();
          
          if (!error && data) {
            setUserPerfil(data.perfil);
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserPerfil();
  }, []);

  return (
    <div className="flex-1 px-3 py-4 overflow-y-auto bg-gradient-to-b from-transparent to-slate-50/30 dark:to-slate-800/30">
      <nav className="space-y-2">
        <div className="mb-6">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-3">
            Principal
          </div>
          <ul className="space-y-1">
            <li>
              <SidebarItem
                icon={<LayoutDashboard className="h-5 w-5" />}
                title="Dashboard"
                href="/dashboard"
                collapsed={collapsed}
              />
            </li>
            
            <li>
              <SidebarItem
                icon={<Plug className="h-5 w-5" />}
                title="Conexión"
                href="/dashboard/conexion"
                collapsed={collapsed}
              />
            </li>
            
            <li>
              <SidebarItem
                icon={<MessageSquare className="h-5 w-5" />}
                title="Mensajería"
                href="/dashboard/crm"
                collapsed={collapsed}
                badge="CRM"
                badgeColor="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              />
            </li>
          </ul>
        </div>

        <div className="mb-6">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-3">
            Gestión
          </div>
          <ul className="space-y-1">
            <li>
              <SidebarItem
                icon={<Kanban className="h-5 w-5" />}
                title="Leads Kanban"
                href="/dashboard/leads-kanban"
                collapsed={collapsed}
              />
            </li>
            
            <li>
              <SidebarItem
                icon={<Users className="h-5 w-5" />}
                title="Contactos"
                href="/dashboard/contactos"
                collapsed={collapsed}
              />
            </li>
            
            <li>
              <SidebarItem
                icon={<Send className="h-5 w-5" />}
                title="Campañas"
                href="/dashboard/campanas"
                collapsed={collapsed}
              />
            </li>
          </ul>
        </div>

        <div className="mb-6">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-3">
            Automatización
          </div>
          <ul className="space-y-1">
            <li>
              <SidebarItem
                icon={<Bot className="h-5 w-5" />}
                title="Agente IA"
                href="/dashboard/agente-ia"
                collapsed={collapsed}
                badge="IA"
                badgeColor="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
              />
            </li>
            
            <li>
              <SidebarItem
                icon={<BarChart className="h-5 w-5" />}
                title="Analíticas"
                href="/dashboard/analiticas"
                collapsed={collapsed}
              />
            </li>
          </ul>
        </div>

        <div className="mb-6">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-3">
            Sistema
          </div>
          <ul className="space-y-1">
            <li>
              <SidebarItem
                icon={<CreditCard className="h-5 w-5" />}
                title="Planes"
                href="/dashboard/planes"
                collapsed={collapsed}
              />
            </li>
            
            <li>
              <SidebarItem
                icon={<Settings className="h-5 w-5" />}
                title="Configuración"
                href="/dashboard/configuracion"
                collapsed={collapsed}
              />
            </li>
          </ul>
        </div>
        
        {userPerfil === 'administrador' && (
          <div className="pt-4 mt-6 border-t border-slate-200/60 dark:border-slate-700/60">
            <div className="text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wider mb-3 px-3">
              Administración
            </div>
            <ul className="space-y-1">
              <li>
                <SidebarItem
                  icon={<Megaphone className="h-5 w-5 text-red-500" />}
                  title="Panel Admin"
                  href="/admin"
                  collapsed={collapsed}
                  badge="ADMIN"
                  badgeColor="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                />
              </li>
            </ul>
          </div>
        )}
      </nav>
    </div>
  );
};

export default SidebarMenu;
