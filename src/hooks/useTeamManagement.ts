
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TeamMember, ConversationAssignment, InternalNote, SmartTemplate } from "@/types/team";
import { toast } from "sonner";

export const useTeamManagement = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [assignments, setAssignments] = useState<ConversationAssignment[]>([]);
  const [internalNotes, setInternalNotes] = useState<InternalNote[]>([]);
  const [smartTemplates, setSmartTemplates] = useState<SmartTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch team members
  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          member:usuarios!team_members_member_user_id_fkey(nombre, email)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedMembers = data?.map(member => ({
        ...member,
        member_name: member.member?.nombre,
        member_email: member.member?.email
      })) || [];

      setTeamMembers(formattedMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Error al cargar miembros del equipo');
    }
  };

  // Add team member
  const addTeamMember = async (memberData: {
    member_user_id: string;
    role: TeamMember['role'];
    expertise_areas: TeamMember['expertise_areas'];
    max_concurrent_conversations?: number;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('team_members')
        .insert({
          owner_user_id: user.id,
          ...memberData
        });

      if (error) throw error;

      toast.success('Miembro del equipo agregado exitosamente');
      fetchTeamMembers();
    } catch (error) {
      console.error('Error adding team member:', error);
      toast.error('Error al agregar miembro del equipo');
    }
  };

  // Update team member
  const updateTeamMember = async (memberId: string, updates: Partial<TeamMember>) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update(updates)
        .eq('id', memberId);

      if (error) throw error;

      toast.success('Miembro del equipo actualizado');
      fetchTeamMembers();
    } catch (error) {
      console.error('Error updating team member:', error);
      toast.error('Error al actualizar miembro del equipo');
    }
  };

  // Remove team member
  const removeTeamMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ is_active: false })
        .eq('id', memberId);

      if (error) throw error;

      toast.success('Miembro del equipo removido');
      fetchTeamMembers();
    } catch (error) {
      console.error('Error removing team member:', error);
      toast.error('Error al remover miembro del equipo');
    }
  };

  // Auto assign conversation
  const autoAssignConversation = async (conversationId: string, expertiseRequired?: string) => {
    try {
      const { data, error } = await supabase.rpc('auto_assign_conversation', {
        p_conversation_id: conversationId,
        p_expertise_required: expertiseRequired || 'general'
      });

      if (error) throw error;

      if (data) {
        toast.success('Conversación asignada automáticamente');
        return data;
      } else {
        toast.info('No hay agentes disponibles en este momento');
        return null;
      }
    } catch (error) {
      console.error('Error auto-assigning conversation:', error);
      toast.error('Error al asignar conversación');
      return null;
    }
  };

  // Fetch conversation assignments
  const fetchAssignments = async (conversationId?: string) => {
    try {
      let query = supabase
        .from('conversation_assignments')
        .select(`
          *,
          assigned_to:usuarios!conversation_assignments_assigned_to_user_id_fkey(nombre)
        `)
        .order('assigned_at', { ascending: false });

      if (conversationId) {
        query = query.eq('conversation_id', conversationId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const formattedAssignments = data?.map(assignment => ({
        ...assignment,
        assigned_to_name: assignment.assigned_to?.nombre
      })) || [];

      setAssignments(formattedAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  // Fetch internal notes
  const fetchInternalNotes = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('internal_notes')
        .select(`
          *,
          author:usuarios!internal_notes_author_user_id_fkey(nombre)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedNotes = data?.map(note => ({
        ...note,
        author_name: note.author?.nombre
      })) || [];

      setInternalNotes(formattedNotes);
    } catch (error) {
      console.error('Error fetching internal notes:', error);
    }
  };

  // Add internal note
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

  // Fetch smart templates
  const fetchSmartTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('smart_templates')
        .select('*')
        .eq('is_active', true)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setSmartTemplates(data || []);
    } catch (error) {
      console.error('Error fetching smart templates:', error);
    }
  };

  // Get contextual templates
  const getContextualTemplates = async (messageContent: string = '', expertiseArea: string = 'general') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase.rpc('get_contextual_templates', {
        p_user_id: user.id,
        p_message_content: messageContent,
        p_expertise_area: expertiseArea
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting contextual templates:', error);
      return [];
    }
  };

  // Add smart template
  const addSmartTemplate = async (templateData: {
    title: string;
    content: string;
    context_triggers: string[];
    expertise_area: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('smart_templates')
        .insert({
          owner_user_id: user.id,
          ...templateData
        });

      if (error) throw error;

      toast.success('Template agregado exitosamente');
      fetchSmartTemplates();
    } catch (error) {
      console.error('Error adding smart template:', error);
      toast.error('Error al agregar template');
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await Promise.all([
        fetchTeamMembers(),
        fetchSmartTemplates()
      ]);
      setLoading(false);
    };

    initialize();
  }, []);

  return {
    // State
    teamMembers,
    assignments,
    internalNotes,
    smartTemplates,
    loading,

    // Team management
    fetchTeamMembers,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,

    // Assignment management
    autoAssignConversation,
    fetchAssignments,

    // Internal notes
    fetchInternalNotes,
    addInternalNote,

    // Smart templates
    fetchSmartTemplates,
    getContextualTemplates,
    addSmartTemplate
  };
};
