
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">Nombre</TableHead>
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">Descripción</TableHead>
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">Contactos</TableHead>
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">Fecha de Creación</TableHead>
            <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300 py-4">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lists.map((list, index) => (
            <TableRow 
              key={list.id} 
              className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-750'
              }`}
            >
              <TableCell className="font-medium text-gray-900 dark:text-gray-100 py-4">
                {list.name}
              </TableCell>
              <TableCell className="text-gray-600 dark:text-gray-400 py-4">
                {list.description || "-"}
              </TableCell>
              <TableCell className="py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {list.contacts_count}
                </span>
              </TableCell>
              <TableCell className="text-gray-600 dark:text-gray-400 py-4">
                {new Date(list.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right py-4">
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
