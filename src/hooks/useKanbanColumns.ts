
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { KanbanColumn, CreateKanbanColumnRequest, UpdateKanbanColumnRequest } from "@/types/kanban";

export const useKanbanColumns = () => {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's kanban columns
  const fetchColumns = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setColumns([]);
        return;
      }

      const { data, error } = await supabase
        .from("kanban_columns")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("is_active", true)
        .order("order_position");

      if (error) {
        console.error("Error fetching kanban columns:", error);
        toast.error("Error al cargar las columnas del kanban");
        return;
      }

      setColumns(data || []);
    } catch (error) {
      console.error("Exception fetching kanban columns:", error);
      toast.error("Error al cargar las columnas del kanban");
    } finally {
      setLoading(false);
    }
  };

  // Create a new column
  const createColumn = async (columnData: CreateKanbanColumnRequest) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("No hay sesión activa");
        return false;
      }

      const { error } = await supabase
        .from("kanban_columns")
        .insert({
          ...columnData,
          user_id: session.user.id
        });

      if (error) {
        console.error("Error creating kanban column:", error);
        toast.error("Error al crear la columna");
        return false;
      }

      toast.success("Columna creada exitosamente");
      fetchColumns(); // Refresh the list
      return true;
    } catch (error) {
      console.error("Exception creating kanban column:", error);
      toast.error("Error al crear la columna");
      return false;
    }
  };

  // Update a column
  const updateColumn = async (columnId: string, updates: UpdateKanbanColumnRequest) => {
    try {
      const { error } = await supabase
        .from("kanban_columns")
        .update(updates)
        .eq("id", columnId);

      if (error) {
        console.error("Error updating kanban column:", error);
        toast.error("Error al actualizar la columna");
        return false;
      }

      toast.success("Columna actualizada exitosamente");
      fetchColumns(); // Refresh the list
      return true;
    } catch (error) {
      console.error("Exception updating kanban column:", error);
      toast.error("Error al actualizar la columna");
      return false;
    }
  };

  // Delete a column (only non-default columns)
  const deleteColumn = async (columnId: string) => {
    try {
      const { error } = await supabase
        .from("kanban_columns")
        .delete()
        .eq("id", columnId)
        .eq("is_default", false);

      if (error) {
        console.error("Error deleting kanban column:", error);
        toast.error("Error al eliminar la columna");
        return false;
      }

      toast.success("Columna eliminada exitosamente");
      fetchColumns(); // Refresh the list
      return true;
    } catch (error) {
      console.error("Exception deleting kanban column:", error);
      toast.error("Error al eliminar la columna");
      return false;
    }
  };

  // Reorder columns
  const reorderColumns = async (reorderedColumns: KanbanColumn[]) => {
    try {
      const updates = reorderedColumns.map((column, index) => ({
        id: column.id,
        order_position: index + 1
      }));

      for (const update of updates) {
        await supabase
          .from("kanban_columns")
          .update({ order_position: update.order_position })
          .eq("id", update.id);
      }

      toast.success("Orden de columnas actualizado");
      fetchColumns(); // Refresh the list
      return true;
    } catch (error) {
      console.error("Exception reordering columns:", error);
      toast.error("Error al reordenar las columnas");
      return false;
    }
  };

  useEffect(() => {
    fetchColumns();
  }, []);

  return {
    columns,
    loading,
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    refreshColumns: fetchColumns
  };
};
