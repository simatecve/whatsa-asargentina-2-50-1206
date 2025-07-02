
import { useSistemaInfo } from "@/hooks/useSistemaInfo";
import { cn } from "@/lib/utils";

type SidebarHeaderProps = {
  isCollapsed: boolean;
};

export const SidebarHeader = ({ isCollapsed }: SidebarHeaderProps) => {
  const { sistemaInfo, loading } = useSistemaInfo();

  if (loading) {
    return (
      <div className={cn(
        "flex items-center justify-center px-4 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700"
      )}>
        <div className={cn(
          "bg-gray-200 animate-pulse rounded-xl shadow-sm",
          isCollapsed ? "h-12 w-12" : "h-16 w-16"
        )} />
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center justify-center px-4 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700"
    )}>
      {sistemaInfo?.logo_url ? (
        <div className={cn(
          "flex items-center justify-center rounded-xl shadow-sm overflow-hidden",
          isCollapsed ? "h-12 w-12" : "h-16 w-16"
        )}>
          <img 
            src={sistemaInfo.logo_url} 
            alt={sistemaInfo.nombre_sistema || "Logo"}
            className={cn(
              "max-w-full max-h-full object-contain",
              isCollapsed ? "h-12 w-12" : "h-16 w-16"
            )}
            onError={(e) => {
              console.error("Error loading logo:", e);
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      ) : (
        <div className={cn(
          "bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold flex items-center justify-center rounded-xl shadow-lg",
          isCollapsed ? "h-12 w-12 text-lg" : "h-16 w-16 text-2xl"
        )}>
          {sistemaInfo?.nombre_sistema?.charAt(0) || "K"}
        </div>
      )}
    </div>
  );
};
