
import { useState, useEffect } from "react";
import { useTeamUsers } from "./team/useTeamUsers";
import { useTeamMembers } from "./team/useTeamMembers";
import { useConversationAssignments } from "./team/useConversationAssignments";
import { useInternalNotes } from "./team/useInternalNotes";
import { useSmartTemplates } from "./team/useSmartTemplates";

export const useTeamManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Individual hooks
  const teamUsersHook = useTeamUsers();
  const teamMembersHook = useTeamMembers();
  const assignmentsHook = useConversationAssignments();
  const notesHook = useInternalNotes();
  const templatesHook = useSmartTemplates();

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          teamUsersHook.fetchTeamUsers(),
          teamMembersHook.fetchTeamMembers(),
          templatesHook.fetchSmartTemplates()
        ]);
      } catch (err) {
        console.error('Error initializing team management:', err);
        setError('Error al inicializar el sistema de equipos');
        // Don't block the entire app if team management fails
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  return {
    // State
    teamMembers: teamMembersHook.teamMembers,
    teamUsers: teamUsersHook.teamUsers,
    assignments: assignmentsHook.assignments,
    internalNotes: notesHook.internalNotes,
    smartTemplates: templatesHook.smartTemplates,
    loading,
    error,

    // Team management
    fetchTeamUsers: teamUsersHook.fetchTeamUsers,
    fetchTeamMembers: teamMembersHook.fetchTeamMembers,
    createTeamUser: teamUsersHook.createTeamUser,
    updateTeamMember: teamMembersHook.updateTeamMember,
    removeTeamMember: teamMembersHook.removeTeamMember,

    // Assignment management
    fetchAssignments: assignmentsHook.fetchAssignments,

    // Internal notes
    fetchInternalNotes: notesHook.fetchInternalNotes,
    addInternalNote: notesHook.addInternalNote,

    // Smart templates
    fetchSmartTemplates: templatesHook.fetchSmartTemplates,
    addSmartTemplate: templatesHook.addSmartTemplate
  };
};
