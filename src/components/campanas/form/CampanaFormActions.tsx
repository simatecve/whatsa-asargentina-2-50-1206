
import React from "react";
import { Button } from "@/components/ui/button";
import { Send, X } from "lucide-react";

interface CampanaFormActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
}

export const CampanaFormActions = ({ onCancel, isSubmitting }: CampanaFormActionsProps) => {
  return (
    <div className="flex gap-2 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
        className="flex-1"
      >
        <X className="mr-2 h-4 w-4" />
        Cancelar
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="flex-1 bg-green-500 hover:bg-green-600"
      >
        <Send className="mr-2 h-4 w-4" />
        {isSubmitting ? "Creando..." : "Crear Campaña"}
      </Button>
    </div>
  );
};
