
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

type ContactListsEmptyStateProps = {
  onCreateNew: () => void;
};

export const ContactListsEmptyState = ({ onCreateNew }: ContactListsEmptyStateProps) => {
  return (
    <div className="p-8 text-center">
      <MessageSquare className="mx-auto h-12 w-12 text-green-400" />
      <h3 className="mt-2 text-lg font-medium">No hay listas de contactos</h3>
      <p className="text-sm text-gray-500 mb-4">
        Crea una nueva lista para empezar a añadir contactos de WhatsApp.
      </p>
      <Button 
        onClick={onCreateNew} 
        className="bg-green-500 hover:bg-green-600"
      >
        <MessageSquare className="mr-2 h-4 w-4" />
        Nueva Lista
      </Button>
    </div>
  );
};
