import { useSistemaInfo } from "@/hooks/useSistemaInfo";
type SidebarCopyrightProps = {
  isCollapsed: boolean;
};
export const SidebarCopyright = ({
  isCollapsed
}: SidebarCopyrightProps) => {
  const {
    sistemaInfo,
    loading
  } = useSistemaInfo();
  if (loading || !sistemaInfo) {
    return null;
  }
  if (isCollapsed) {
    return;
  }
  return <div className="p-3 border-t border-gray-200 dark:border-gray-700">
      <div className="text-center space-y-1">
        
        
      </div>
    </div>;
};