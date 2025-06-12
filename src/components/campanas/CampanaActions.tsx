
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Send, Trash } from "lucide-react";
import { Campana } from "./types";

interface CampanaActionsProps {
  campana: Campana;
  onVerDetalles: (campana: Campana) => void;
  onSendCampana: (campana: Campana) => void;
  onDeleteCampana: (id: string) => void;
  isSending: boolean;
}

export const CampanaActions = ({ 
  campana, 
  onVerDetalles, 
  onSendCampana, 
  onDeleteCampana, 
  isSending 
}: CampanaActionsProps) => {
  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onVerDetalles(campana)}
      >
        <MessageSquare className="h-4 w-4" />
        <span className="sr-only">Ver detalles</span>
      </Button>
      
      {campana.estado === "pendiente" && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSendCampana(campana)}
            disabled={isSending}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            {isSending ? (
              <Skeleton className="h-4 w-4 rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Enviar campaña</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteCampana(campana.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash className="h-4 w-4" />
            <span className="sr-only">Eliminar</span>
          </Button>
        </>
      )}
    </div>
  );
};
