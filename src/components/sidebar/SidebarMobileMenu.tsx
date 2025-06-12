
import React from "react";
import SidebarItem from "./SidebarItem";
import {
  MessageSquare,
  Bot,
  BarChart,
  CreditCard,
  Settings
} from "lucide-react";

const SidebarMobileMenu = ({ collapsed }) => {
  const mobileMenuItems = [
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: "Mensajería",
      href: "/dashboard/crm"
    },
    {
      icon: <Bot className="h-5 w-5" />,
      title: "Agente IA",
      href: "/dashboard/agente-ia"
    },
    {
      icon: <BarChart className="h-5 w-5" />,
      title: "Analíticas",
      href: "/dashboard/analiticas"
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      title: "Planes",
      href: "/dashboard/planes"
    },
    {
      icon: <Settings className="h-5 w-5" />,
      title: "Configuración",
      href: "/dashboard/configuracion"
    }
  ];

  return (
    <div className="flex-1 px-3 py-4 overflow-y-auto">
      <ul className="space-y-1">
        {mobileMenuItems.map((item, index) => (
          <li key={index}>
            <SidebarItem
              icon={item.icon}
              title={item.title}
              href={item.href}
              collapsed={collapsed}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SidebarMobileMenu;
