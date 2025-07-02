
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
    <div className="flex-1 px-3 py-4 overflow-y-auto">
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
          />
        </li>
        
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
        
        <li>
          <SidebarItem
            icon={<Bot className="h-5 w-5" />}
            title="Agente IA"
            href="/dashboard/agente-ia"
            collapsed={collapsed}
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
        
        {userPerfil === 'administrador' && (
          <li className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <SidebarItem
              icon={<Megaphone className="h-5 w-5 text-red-500" />}
              title="Panel Admin"
              href="/admin"
              collapsed={collapsed}
              badgeColor="bg-red-100 text-red-800"
            />
          </li>
        )}
      </ul>
    </div>
  );
};

export default SidebarMenu;
