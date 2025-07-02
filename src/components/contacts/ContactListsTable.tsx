
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
    <div className="floating-card rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-900/80 dark:to-gray-800/80 border-b border-gray-200/60 dark:border-gray-700/60">
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Nombre</TableHead>
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Descripción</TableHead>
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Contactos</TableHead>
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Fecha de Creación</TableHead>
            <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lists.map((list) => (
            <TableRow key={list.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200">
              <TableCell className="font-medium text-gray-900 dark:text-gray-100">{list.name}</TableCell>
              <TableCell className="text-gray-600 dark:text-gray-400">{list.description || "-"}</TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {list.contacts_count}
                </span>
              </TableCell>
              <TableCell className="text-gray-600 dark:text-gray-400">
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
    </div>
  );
};
