
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Import } from "lucide-react";
import { Contact } from "@/utils/contactValidation";
import { processCSV } from "@/utils/csvProcessor";
import { ContactTemplateDownload } from "./ContactTemplateDownload";
import { ContactsImportTable } from "./ContactsImportTable";

type ContactImportProps = {
  listId: string;
  onImportComplete: () => void;
};

export const ContactImport = ({ listId, onImportComplete }: ContactImportProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const processedContacts = processCSV(text);
      setContacts(processedContacts);
      
      if (processedContacts.length === 0) {
        toast.error("No se encontraron contactos válidos en el archivo");
      }
      setLoading(false);
    };
    
    reader.onerror = () => {
      setLoading(false);
      toast.error("Error al leer el archivo");
    };
    
    reader.readAsText(file);
  };
  
  const handleImport = async () => {
    if (contacts.length === 0) return;
    
    const validContacts = contacts.filter(c => c.valid);
    if (validContacts.length === 0) {
      toast.error("No hay contactos válidos para importar");
      return;
    }
    
    setImporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");
      
      // Preparar los contactos con los campos necesarios
      const contactsToInsert = validContacts.map(c => ({
        list_id: listId,
        name: c.name,
        phone_number: c.phone_number,
        user_id: user.id
      }));
      
      const { error } = await supabase
        .from("contacts")
        .insert(contactsToInsert);
        
      if (error) throw error;
      
      toast.success(`${validContacts.length} contactos importados`, { 
        description: "Los contactos han sido importados correctamente." 
      });
      
      setContacts([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onImportComplete();
    } catch (error) {
      console.error("Error al importar contactos:", error);
      toast.error("Error al importar contactos");
    } finally {
      setImporting(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Importar Contactos</CardTitle>
          <CardDescription>
            Importa contactos desde un archivo CSV o Excel guardado como CSV.
            El archivo debe tener columnas para nombre y número de teléfono.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <ContactTemplateDownload />
            <div className="grid w-full items-center gap-1.5">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                disabled={loading || importing}
              />
            </div>
          </div>
          
          {contacts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">
                    {contacts.length} contactos procesados
                  </h3>
                  <p className="text-sm text-gray-500">
                    {contacts.filter(c => c.valid).length} válidos, {contacts.filter(c => !c.valid).length} inválidos
                  </p>
                </div>
                <Button 
                  onClick={handleImport} 
                  disabled={importing || contacts.filter(c => c.valid).length === 0}
                  className="flex items-center gap-2"
                >
                  <Import className="h-4 w-4" />
                  {importing ? "Importando..." : "Importar Contactos"}
                </Button>
              </div>
              
              <ContactsImportTable contacts={contacts} />
              
              {contacts.some(c => !c.valid) && (
                <Alert variant="destructive">
                  <AlertTitle>Contactos inválidos detectados</AlertTitle>
                  <AlertDescription>
                    Algunos contactos no se importarán debido a errores. 
                    Revise los datos y corrija los problemas indicados.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
