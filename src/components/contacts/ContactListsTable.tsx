
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { ContactList } from "@/types/contact";
import { ContactListActions } from "./ContactListActions";

type ContactListsTableProps = {
  lists: ContactList[];
  onEdit: (list: ContactList) => void;
  onDelete: (id: string) => void;
  onViewContacts: (list: ContactList) => void;
};

export const ContactListsTable = ({ 
  lists, 
  onEdit, 
  onDelete, 
  onViewContacts 
}: ContactListsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead>Contactos</TableHead>
          <TableHead>Fecha de Creación</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lists.map((list) => (
          <TableRow key={list.id}>
            <TableCell className="font-medium">{list.name}</TableCell>
            <TableCell>{list.description || "-"}</TableCell>
            <TableCell>{list.contacts_count}</TableCell>
            <TableCell>
              {new Date(list.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <ContactListActions 
                list={list} 
                onEdit={onEdit} 
                onDelete={onDelete} 
                onViewContacts={onViewContacts} 
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
