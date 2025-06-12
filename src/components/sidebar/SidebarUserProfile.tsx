
import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

type SidebarUserProfileProps = {
  userData: {
    nombre: string;
    email: string;
    perfil: string;
  } | null;
  isCollapsed: boolean;
};

export const SidebarUserProfile = ({ userData, isCollapsed }: SidebarUserProfileProps) => {
  const isMobile = useIsMobile();
  
  // No mostrar perfil de usuario en móvil
  if (isMobile) {
    return null;
  }
  
  // Get initials for avatar
  const getInitials = () => {
    if (userData?.nombre) {
      const nameParts = userData.nombre.split(" ");
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      }
      return userData.nombre.substring(0, 2).toUpperCase();
    }
    return "US";
  };

  if (!userData) return null;

  return (
    <div className={cn(
      "flex px-3 py-4 gap-3 border-b border-gray-200 dark:border-gray-800",
      isCollapsed && "flex-col items-center px-2"
    )}>
      <Avatar className="h-10 w-10">
        <AvatarImage src="" alt="Avatar" />
        <AvatarFallback className="bg-azul-100 text-azul-700">{getInitials()}</AvatarFallback>
      </Avatar>
      
      {!isCollapsed && (
        <div className="flex-1 overflow-hidden">
          <h3 className="font-medium text-sm truncate">
            {userData.nombre}
          </h3>
          <p className="text-xs text-gray-500 truncate">
            {userData.email}
          </p>
          <span className="text-xs px-2 py-0.5 mt-1 inline-block rounded-full bg-azul-100 text-azul-700 dark:bg-azul-900 dark:text-azul-300">
            {userData.perfil}
          </span>
        </div>
      )}
    </div>
  );
};

export default SidebarUserProfile;
