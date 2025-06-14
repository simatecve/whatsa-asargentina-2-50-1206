
import { cn } from "@/lib/utils";

interface SidebarHeaderProps {
  isCollapsed: boolean;
}

export const SidebarHeader = ({ isCollapsed }: SidebarHeaderProps) => {
  return (
    <div className={cn(
      "p-4 border-b border-gray-200 dark:border-gray-800 shrink-0",
      isCollapsed && "px-2"
    )}>
      <div className={cn(
        "flex items-center",
        isCollapsed ? "justify-center" : "justify-start"
      )}>
        <div className={cn(
          "font-bold text-azul-700 dark:text-azul-300 transition-all duration-300",
          isCollapsed ? "text-xl" : "text-2xl"
        )}>
          {isCollapsed ? (
            <span className="block text-center leading-tight">
              <span className="block text-lg">W</span>
              <span className="block text-xs -mt-1">24</span>
            </span>
          ) : (
            "WhatsApp24"
          )}
        </div>
      </div>
    </div>
  );
};
