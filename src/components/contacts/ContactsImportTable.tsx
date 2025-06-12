
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Check, X } from "lucide-react";
import { Contact } from "@/utils/contactValidation";

type ContactsImportTableProps = {
  contacts: Contact[];
};

export const ContactsImportTable = ({ contacts }: ContactsImportTableProps) => {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estado</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Número</TableHead>
            <TableHead>Error</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.slice(0, 100).map((contact, index) => (
            <TableRow key={index}>
              <TableCell>
                {contact.valid ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
              </TableCell>
              <TableCell>{contact.name}</TableCell>
              <TableCell>{contact.phone_number}</TableCell>
              <TableCell className="text-red-500">
                {contact.error || ""}
              </TableCell>
            </TableRow>
          ))}
          {contacts.length > 100 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-sm text-gray-500">
                Mostrando 100 de {contacts.length} contactos...
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
