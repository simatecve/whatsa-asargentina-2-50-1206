
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContactList } from "@/types/contact";
import { supabase } from "@/integrations/supabase/client";
import * as z from "zod";

const formSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  lista_id: z.string().min(1, "Debe seleccionar una lista de contactos"),
  mensaje: z.string().optional(),
  delay_minimo: z.coerce.number().min(1, "El delay mínimo debe ser al menos 1 segundo"),
  delay_maximo: z.coerce.number().min(1, "El delay máximo debe ser al menos 1 segundo"),
  webhook_id: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CampanaFormContactListProps {
  form: UseFormReturn<FormValues>;
}

export const CampanaFormContactList = ({ form }: CampanaFormContactListProps) => {
  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [contactsCount, setContactsCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchContactLists = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          const { data: listsData, error } = await supabase
            .from("contact_lists")
            .select("*")
            .eq("user_id", data.session.user.id)
            .order("created_at", { ascending: false });
            
          if (error) throw error;
          setContactLists(listsData || []);
        }
      } catch (error) {
        console.error("Error al cargar listas de contactos:", error);
      }
    };
    
    fetchContactLists();
  }, []);
  
  useEffect(() => {
    if (selectedListId) {
      const fetchContactsCount = async () => {
        try {
          const { count, error } = await supabase
            .from("contacts")
            .select("*", { count: "exact", head: true })
            .eq("list_id", selectedListId);
            
          if (error) throw error;
          setContactsCount(count);
        } catch (error) {
          console.error("Error al contar contactos:", error);
          setContactsCount(null);
        }
      };
      
      fetchContactsCount();
    } else {
      setContactsCount(null);
    }
  }, [selectedListId]);

  return (
    <FormField
      control={form.control}
      name="lista_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Lista de contactos</FormLabel>
          <Select 
            onValueChange={(value) => {
              field.onChange(value);
              setSelectedListId(value);
            }} 
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una lista de contactos" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {contactLists.map((list) => (
                <SelectItem key={list.id} value={list.id}>
                  {list.name} {list.contacts_count !== undefined && `(${list.contacts_count} contactos)`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {contactsCount !== null && selectedListId && (
            <p className="text-sm text-muted-foreground mt-1">
              Esta lista contiene {contactsCount} contacto(s)
            </p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
