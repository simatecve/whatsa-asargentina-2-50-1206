
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, User, Edit, Trash } from "lucide-react";
import { ContactList } from "@/types/contact";

type ContactListActionsProps = {
  list: ContactList;
  onEdit: (list: ContactList) => void;
  onDelete: (id: string) => void;
  onViewContacts: (list: ContactList) => void;
};

export const ContactListActions = ({ 
  list, 
  onEdit, 
  onDelete, 
  onViewContacts 
}: ContactListActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onViewContacts(list)}>
          <User className="mr-2 h-4 w-4" />
          <span>Ver Contactos</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(list)}>
          <Edit className="mr-2 h-4 w-4" />
          <span>Editar</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onDelete(list.id)}
          className="text-destructive focus:text-destructive"
        >
          <Trash className="mr-2 h-4 w-4" />
          <span>Eliminar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
