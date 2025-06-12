
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContactList } from "@/types/contact";
import { toast } from "sonner";

export const useContactLists = () => {
  const [lists, setLists] = useState<ContactList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLists = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get user ID
      const { data: userData } = await supabase.auth.getUser();
      if (!userData || !userData.user) {
        throw new Error("Usuario no autenticado");
      }
      
      // Get lists
      const { data: listsData, error } = await supabase
        .from("contact_lists")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      // Get counts for each list
      const listsWithCounts = await Promise.all(
        (listsData || []).map(async (list) => {
          const { count, error: countError } = await supabase
            .from("contacts")
            .select("*", { count: "exact", head: true })
            .eq("list_id", list.id);
            
          if (countError) {
            console.error("Error al contar contactos:", countError);
            return {
              ...list,
              contacts_count: 0
            };
          }
          
          return {
            ...list,
            contacts_count: count || 0
          };
        })
      );
      
      setLists(listsWithCounts);
    } catch (error) {
      console.error("Error al cargar listas:", error);
      setError("Error al cargar las listas de contactos");
      toast.error("Error al cargar las listas de contactos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const handleDelete = async (id: string) => {
    try {
      // First delete all contacts in this list
      const { error: contactsError } = await supabase
        .from("contacts")
        .delete()
        .eq("list_id", id);
        
      if (contactsError) throw contactsError;
      
      // Then delete the list
      const { error } = await supabase
        .from("contact_lists")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      toast.success("Lista eliminada", { description: "La lista de contactos ha sido eliminada correctamente." });
      fetchLists();
    } catch (error) {
      console.error("Error al eliminar lista:", error);
      toast.error("Error al eliminar la lista de contactos");
    }
  };

  return {
    lists,
    loading,
    error,
    fetchLists,
    handleDelete
  };
};
