
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
        "flex items-center justify-center px-3 py-4 border-b border-gray-200 dark:border-gray-800"
      )}>
        <div className={cn(
          "bg-gray-200 animate-pulse rounded",
          isCollapsed ? "h-16 w-16" : "h-20 w-20"
        )} />
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center justify-center px-3 py-4 border-b border-gray-200 dark:border-gray-800"
    )}>
      {sistemaInfo?.logo_url ? (
        <div className={cn(
          "flex items-center justify-center",
          isCollapsed ? "h-16 w-16" : "h-20 w-20"
        )}>
          <img 
            src={sistemaInfo.logo_url} 
            alt={sistemaInfo.nombre_sistema || "Logo"}
            className={cn(
              "max-w-full max-h-full object-contain",
              isCollapsed ? "h-16 w-16" : "h-20 w-20"
            )}
            onError={(e) => {
              console.error("Error loading logo:", e);
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      ) : (
        <div className={cn(
          "bg-azul-100 text-azul-700 font-bold flex items-center justify-center rounded",
          isCollapsed ? "h-16 w-16 text-lg" : "h-20 w-20 text-xl"
        )}>
          {sistemaInfo?.nombre_sistema?.charAt(0) || "K"}
        </div>
      )}
    </div>
  );
};
