
import React from "react";
import { Package, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Plan {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  moneda: string;
  periodo: string;
  max_instancias: number;
  max_contactos: number;
  max_campanas: number;
  max_conversaciones: number;
  max_mensajes: number;
  estado: boolean;
}

interface PlanCardProps {
  plan: Plan;
  onEdit: (plan: Plan) => void;
  onDelete: (planId: string) => void;
}

export const PlanCard = ({ plan, onEdit, onDelete }: PlanCardProps) => {
  return (
    <div 
      className={`border rounded-lg ${
        plan.estado 
          ? 'border-gray-200 dark:border-gray-700' 
          : 'border-gray-300 dark:border-gray-600 opacity-60'
      }`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold">{plan.nombre}</h3>
            <p className="text-2xl font-bold mt-2">
              ${plan.precio.toFixed(2)}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                /{plan.periodo === 'mensual' ? 'mes' : plan.periodo === 'anual' ? 'año' : plan.periodo}
              </span>
            </p>
          </div>
          <div className="bg-primary/10 p-2 rounded-full">
            <Package className="h-6 w-6 text-primary" />
          </div>
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          {plan.descripcion}
        </div>
        
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Instancias:</span>
            <span className="font-medium">{plan.max_instancias}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Contactos:</span>
            <span className="font-medium">{plan.max_contactos}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Campañas:</span>
            <span className="font-medium">{plan.max_campanas}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Conversaciones:</span>
            <span className="font-medium">{plan.max_conversaciones || 100}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Mensajes:</span>
            <span className="font-medium">{plan.max_mensajes || 1000}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Estado:</span>
            <span className={`font-medium ${plan.estado ? 'text-green-600' : 'text-red-600'}`}>
              {plan.estado ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
        
        <div className="flex mt-6 space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(plan)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(plan.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
