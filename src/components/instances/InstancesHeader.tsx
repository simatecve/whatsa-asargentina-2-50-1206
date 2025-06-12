
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface InstancesHeaderProps {
  onRefresh: () => void;
  loading: boolean;
}

const InstancesHeader = ({ onRefresh, loading }: InstancesHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">Instancias Existentes</h2>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh} 
        disabled={loading}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        Actualizar
      </Button>
    </div>
  );
};

export default InstancesHeader;
