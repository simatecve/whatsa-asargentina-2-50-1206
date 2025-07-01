
import { useState, useEffect } from "react";
import { useTeamUsers } from "./team/useTeamUsers";
import { useTeamMembers } from "./team/useTeamMembers";
import { useConversationAssignments } from "./team/useConversationAssignments";
import { useInternalNotes } from "./team/useInternalNotes";
import { useSmartTemplates } from "./team/useSmartTemplates";

export const useTeamManagement = () => {
  const [loading, setLoading] = useState(true);

  // Individual hooks
  const teamUsersHook = useTeamUsers();
  const teamMembersHook = useTeamMembers();
  const assignmentsHook = useConversationAssignments();
  const notesHook = useInternalNotes();
  const templatesHook = useSmartTemplates();

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await Promise.all([
        teamUsersHook.fetchTeamUsers(),
        teamMembersHook.fetchTeamMembers(),
        templatesHook.fetchSmartTemplates()
      ]);
      setLoading(false);
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
