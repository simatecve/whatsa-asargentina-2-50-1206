
import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

type SidebarItemProps = {
  icon: React.ReactNode;
  title: string;
  href: string;
  collapsed: boolean;
  badge?: string | number;
  badgeColor?: string;
};

export const SidebarItem = ({ icon, title, href, collapsed, badge, badgeColor }: SidebarItemProps) => (
  <NavLink
    to={href}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-azul-100 dark:hover:bg-azul-900 relative group",
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
    {!collapsed && badge && (
      <span className={`ml-auto text-xs font-medium rounded-full px-2 py-0.5 ${badgeColor || 'bg-blue-100 text-blue-800'}`}>
        {badge}
      </span>
    )}
    
    {/* Tooltip para modo colapsado */}
    {collapsed && (
      <div className="absolute left-16 bg-gray-900 text-white text-sm px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap">
        {title}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
      </div>
    )}
  </NavLink>
);

export default SidebarItem;
