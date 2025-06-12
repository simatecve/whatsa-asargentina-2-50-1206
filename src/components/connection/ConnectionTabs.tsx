
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InstanceListContainer } from "./InstanceListContainer";
import { NewInstanceContainer } from "./NewInstanceContainer";

interface ConnectionTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  apiConfigExists: boolean;
}

export const ConnectionTabs = ({
  activeTab,
  setActiveTab,
  apiConfigExists
}: ConnectionTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="instances">Mis Instancias</TabsTrigger>
        <TabsTrigger value="new">
          Nueva Instancia
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="instances" className="space-y-4 mt-4">
        <InstanceListContainer onCreateNew={() => setActiveTab("new")} />
      </TabsContent>
      
      <TabsContent value="new" className="mt-4">
        <NewInstanceContainer 
          apiConfigExists={apiConfigExists} 
          onInstanceCreated={() => setActiveTab("instances")} 
        />
      </TabsContent>
    </Tabs>
  );
};
