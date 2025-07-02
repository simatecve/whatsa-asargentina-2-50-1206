
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
        "flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 relative group",
        isActive ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 dark:from-blue-900 dark:to-indigo-900 dark:text-blue-300 shadow-sm" : "text-gray-600 dark:text-gray-400",
        collapsed && "justify-center py-4 px-3"
      )
    }
    title={collapsed ? title : undefined}
  >
    <div className={cn("shrink-0", collapsed && "flex justify-center")}>
      {icon}
    </div>
    {!collapsed && <span className="truncate font-medium">{title}</span>}
    {!collapsed && badge && (
      <span className={`ml-auto text-xs font-semibold rounded-full px-2.5 py-1 ${badgeColor || 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
        {badge}
      </span>
    )}
    
    {/* Tooltip para modo colapsado */}
    {collapsed && (
      <div className="absolute left-16 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap shadow-lg">
        {title}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
      </div>
    )}
  </NavLink>
);

export default SidebarItem;
