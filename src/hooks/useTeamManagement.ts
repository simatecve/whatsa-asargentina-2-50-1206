
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TeamMember, ConversationAssignment, InternalNote, SmartTemplate, ExpertiseArea, TeamUser, TeamRole } from "@/types/team";
import { toast } from "sonner";

export const useTeamManagement = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamUsers, setTeamUsers] = useState<TeamUser[]>([]);
  const [assignments, setAssignments] = useState<ConversationAssignment[]>([]);
  const [internalNotes, setInternalNotes] = useState<InternalNote[]>([]);
  const [smartTemplates, setSmartTemplates] = useState<SmartTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch team users
  const fetchTeamUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_users')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeamUsers(data || []);
    } catch (error) {
      console.error('Error fetching team users:', error);
      toast.error('Error al cargar usuarios del equipo');
    }
  };

  // Fetch team members
  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          team_user:team_users!team_members_member_user_id_fkey(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter out any records with null team_user and properly type the result
      const validMembers = (data || []).filter(member => 
        member.team_user && 
        typeof member.team_user === 'object' && 
        !('error' in member.team_user) &&
        member.team_user !== null &&
        'id' in member.team_user
      );
      
      setTeamMembers(validMembers as unknown as TeamMember[]);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Error al cargar miembros del equipo');
    }
  };

  // Create team user and member
  const createTeamUser = async (userData: {
    email: string;
    nombre: string;
    password: string;
    role: TeamRole;
    expertise_areas: ExpertiseArea[];
    max_concurrent_conversations: number;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Crear usuario del equipo
      const { data: teamUser, error: userError } = await supabase
        .from('team_users')
        .insert({
          owner_user_id: user.id,
          email: userData.email,
          nombre: userData.nombre,
          password_hash: btoa(userData.password), // Simple encoding, en producción usar hash apropiado
        })
        .select()
        .single();

      if (userError) throw userError;

      // Crear miembro del equipo
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          owner_user_id: user.id,
          member_user_id: teamUser.id,
          role: userData.role,
          expertise_areas: userData.expertise_areas,
          max_concurrent_conversations: userData.max_concurrent_conversations,
        });

      if (memberError) throw memberError;

      toast.success('Usuario del equipo creado exitosamente');
      await Promise.all([fetchTeamUsers(), fetchTeamMembers()]);
    } catch (error) {
      console.error('Error creating team user:', error);
      toast.error('Error al crear usuario del equipo');
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

  // Fetch conversation assignments
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

      const formattedAssignments = (data || []).map(assignment => ({
        ...assignment,
        assigned_to_name: assignment.assigned_to && 
          typeof assignment.assigned_to === 'object' && 
          assignment.assigned_to !== null &&
          'nombre' in assignment.assigned_to 
          ? (assignment.assigned_to as any).nombre 
          : ''
      }));

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
          author:team_users!internal_notes_author_user_id_fkey(nombre)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedNotes = (data || []).map(note => ({
        ...note,
        author_name: note.author && 
          typeof note.author === 'object' && 
          note.author !== null &&
          'nombre' in note.author 
          ? (note.author as any).nombre 
          : ''
      }));

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

  // Add smart template
  const addSmartTemplate = async (templateData: {
    title: string;
    content: string;
    context_triggers: string[];
    expertise_area: ExpertiseArea;
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
        fetchTeamUsers(),
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
    teamUsers,
    assignments,
    internalNotes,
    smartTemplates,
    loading,

    // Team management
    fetchTeamUsers,
    fetchTeamMembers,
    createTeamUser,
    updateTeamMember,
    removeTeamMember,

    // Assignment management
    fetchAssignments,

    // Internal notes
    fetchInternalNotes,
    addInternalNote,

    // Smart templates
    fetchSmartTemplates,
    addSmartTemplate
  };
};
