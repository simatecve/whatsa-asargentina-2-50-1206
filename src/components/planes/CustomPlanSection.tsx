
import React from "react";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CustomPlanSection = () => {
  return (
    <div className="bg-muted p-6 rounded-lg mt-12">
      <div className="flex items-start space-x-4">
        <User className="h-6 w-6 text-muted-foreground mt-1" />
        <div>
          <h3 className="font-semibold">¿Necesita un plan personalizado?</h3>
          <p className="text-muted-foreground mt-1">
            Si necesita más capacidad o características personalizadas, 
            contáctenos para obtener un plan adaptado a sus necesidades específicas.
          </p>
          <Button variant="outline" className="mt-4">
            Contactar para plan personalizado
          </Button>
        </div>
      </div>
    </div>
  );
};
