
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AnalisisIndividual from "@/components/analytics/AnalisisIndividual";

const Analiticas = () => {
  const [activeTab, setActiveTab] = useState("individual");

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-azul-100 to-azul-50 dark:from-azul-900 dark:to-gray-900 p-6 rounded-lg border border-azul-200 dark:border-azul-800 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-azul-700 dark:text-azul-300">
          Analíticas
        </h1>
        <p className="text-muted-foreground mt-1">
          Visualiza y analiza las métricas de tu negocio
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="individual">Análisis Individual</TabsTrigger>
          {/* Aquí se pueden añadir más tabs en el futuro */}
        </TabsList>
        
        <TabsContent value="individual" className="space-y-4">
          <AnalisisIndividual />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analiticas;
