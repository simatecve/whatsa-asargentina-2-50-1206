import { useState, useEffect } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ManualContactForm } from "./ManualContactForm";
import { ContactImport } from "./ContactImport";
import { Trash, Search, MessageSquare, Plus, Import } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type Contact = {
  id: string;
  name: string;
  phone_number: string;
  created_at: string;
};

type ContactListDetailsProps = {
  listId: string;
  listName: string;
};

export const ContactListDetails = ({ listId, listName }: ContactListDetailsProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("contacts");
  
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("list_id", listId)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error("Error al cargar contactos:", error);
      toast.error("Error al cargar los contactos");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (listId) {
      fetchContacts();
    }
  }, [listId]);
  
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      toast.success("Contacto eliminado", { description: "El contacto ha sido eliminado correctamente." });
      fetchContacts();
    } catch (error) {
      console.error("Error al eliminar contacto:", error);
      toast.error("Error al eliminar el contacto");
    }
  };
  
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    contact.phone_number.includes(searchTerm)
  );
  
  const handleContactAdded = () => {
    fetchContacts();
    setActiveTab("contacts");
  };
  
  const getWhatsAppLink = (phone: string) => {
    // Asegurar que el número tenga el formato correcto para WhatsApp
    const formattedPhone = phone.startsWith('+') ? phone.substring(1) : phone;
    return `https://wa.me/${formattedPhone}`;
  };
  
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contacts">
            <MessageSquare className="mr-2 h-4 w-4 text-green-500" />
            Contactos
          </TabsTrigger>
          <TabsTrigger value="manual">
            <Plus className="mr-2 h-4 w-4" />
            Añadir Manual
          </TabsTrigger>
          <TabsTrigger value="import">
            <Import className="mr-2 h-4 w-4" />
            Importar
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="contacts" className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar contactos por nombre o número..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
          
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-3 w-[150px]" />
                      </div>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : filteredContacts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Número de WhatsApp</TableHead>
                      <TableHead>Fecha de Creación</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">{contact.name}</TableCell>
                        <TableCell>
                          <a 
                            href={getWhatsAppLink(contact.phone_number)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-green-500 hover:underline"
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            {contact.phone_number}
                          </a>
                        </TableCell>
                        <TableCell>
                          {new Date(contact.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(contact.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-green-400" />
                  <h3 className="mt-2 text-lg font-medium">No hay contactos</h3>
                  <p className="text-sm text-gray-500">
                    Añade contactos de forma manual o importa desde un archivo.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="manual">
          <ManualContactForm listId={listId} onContactAdded={handleContactAdded} />
        </TabsContent>
        
        <TabsContent value="import">
          <ContactImport listId={listId} onImportComplete={handleContactAdded} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
