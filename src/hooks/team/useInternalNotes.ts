
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { InternalNote } from "@/types/team";
import { toast } from "sonner";

export const useInternalNotes = () => {
  const [internalNotes, setInternalNotes] = useState<InternalNote[]>([]);

  const fetchInternalNotes = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('internal_notes')
        .select(`
          *,
          author:usuarios!fk_internal_notes_author_user_id(nombre)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching internal notes:', error);
        setInternalNotes([]);
        return;
      }

      const formattedNotes = (data || []).map(note => {
        let author_name = '';
        const author = note.author;
        
        if (author && 
            typeof author === 'object' && 
            !Array.isArray(author) &&
            'nombre' in author) {
          author_name = (author as { nombre: string }).nombre;
        }
        
        return {
          ...note,
          author_name
        };
      });

      setInternalNotes(formattedNotes);
    } catch (error) {
      console.error('Error fetching internal notes:', error);
      setInternalNotes([]);
    }
  };

  const addInternalNote = async (conversationId: string, content: string, isPrivate: boolean = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('internal_notes')
        .insert({
          conversation_id: conversationId,
          author_user_id: user.id,
          content,
          is_private: isPrivate
        });

      if (error) throw error;

      toast.success('Nota interna agregada');
      fetchInternalNotes(conversationId);
    } catch (error) {
      console.error('Error adding internal note:', error);
      toast.error('Error al agregar nota interna');
    }
  };

  return {
    internalNotes,
    fetchInternalNotes,
    addInternalNote,
  };
};
