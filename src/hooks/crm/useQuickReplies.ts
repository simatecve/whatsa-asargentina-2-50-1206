
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface QuickReply {
  id: number;
  user_id: string;
  title: string;
  message: string;
  created_at: string;
}

export const useQuickReplies = () => {
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchQuickReplies = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.log('No hay sesión de usuario activa');
        return;
      }

      console.log('Obteniendo respuestas rápidas para usuario:', session.user.id);

      const { data, error } = await supabase
        .from('quick_replies')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error al obtener respuestas rápidas:', error);
        throw error;
      }

      console.log('Respuestas rápidas obtenidas:', data);
      setQuickReplies(data || []);
    } catch (error) {
      console.error('Error fetching quick replies:', error);
      toast.error('Error al cargar respuestas rápidas');
    } finally {
      setLoading(false);
    }
  };

  const createQuickReply = async (title: string, message: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error('No hay sesión de usuario activa');
      }

      console.log('Creando respuesta rápida:', { title, message, user_id: session.user.id });

      const { data, error } = await supabase
        .from('quick_replies')
        .insert({
          user_id: session.user.id,
          title: title.trim(),
          message: message.trim()
        })
        .select()
        .single();

      if (error) {
        console.error('Error al crear respuesta rápida:', error);
        throw error;
      }
      
      console.log('Respuesta rápida creada exitosamente:', data);
      setQuickReplies(prev => [data, ...prev]);
      toast.success('Respuesta rápida creada exitosamente');
      return data;
    } catch (error) {
      console.error('Error creating quick reply:', error);
      toast.error('Error al crear respuesta rápida: ' + (error as Error).message);
      throw error;
    }
  };

  const deleteQuickReply = async (id: number) => {
    try {
      console.log('Eliminando respuesta rápida:', id);

      const { error } = await supabase
        .from('quick_replies')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error al eliminar respuesta rápida:', error);
        throw error;
      }
      
      setQuickReplies(prev => prev.filter(reply => reply.id !== id));
      toast.success('Respuesta rápida eliminada');
    } catch (error) {
      console.error('Error deleting quick reply:', error);
      toast.error('Error al eliminar respuesta rápida');
    }
  };

  useEffect(() => {
    fetchQuickReplies();
  }, []);

  return {
    quickReplies,
    loading,
    createQuickReply,
    deleteQuickReply,
    fetchQuickReplies
  };
};
