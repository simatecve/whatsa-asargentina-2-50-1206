
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileAlertHiderProps {
  children: React.ReactNode;
  hideOnMobile?: boolean;
}

export const MobileAlertHider = ({ children, hideOnMobile = true }: MobileAlertHiderProps) => {
  const isMobile = useIsMobile();
  
  if (isMobile && hideOnMobile) {
    return null;
  }
  
  return <>{children}</>;
};
