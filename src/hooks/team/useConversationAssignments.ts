
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ConversationAssignment } from "@/types/team";

export const useConversationAssignments = () => {
  const [assignments, setAssignments] = useState<ConversationAssignment[]>([]);

  const fetchAssignments = async (conversationId?: string) => {
    try {
      let query = supabase
        .from('conversation_assignments')
        .select(`
          *,
          assigned_to:team_users!conversation_assignments_assigned_to_user_id_fkey(nombre)
        `)
        .order('assigned_at', { ascending: false });

      if (conversationId) {
        query = query.eq('conversation_id', conversationId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const formattedAssignments = (data || []).map(assignment => {
        let assigned_to_name = '';
        const assignedTo = assignment.assigned_to;
        
        if (assignedTo && 
            typeof assignedTo === 'object' && 
            !Array.isArray(assignedTo) &&
            'nombre' in assignedTo) {
          assigned_to_name = (assignedTo as { nombre: string }).nombre;
        }
        
        return {
          ...assignment,
          assigned_to_name
        };
      });

      setAssignments(formattedAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  return {
    assignments,
    fetchAssignments,
  };
};
