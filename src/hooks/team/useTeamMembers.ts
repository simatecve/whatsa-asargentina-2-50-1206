
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TeamMember, TeamUser } from "@/types/team";
import { toast } from "sonner";

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          team_user:team_users!fk_team_members_member_user_id(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching team members:', error);
        setTeamMembers([]);
        return;
      }
      
      // Filter and type the results properly with proper null checking
      const validMembers: TeamMember[] = (data || [])
        .filter((member) => {
          const teamUser = member.team_user;
          return teamUser !== null && 
                 teamUser !== undefined &&
                 typeof teamUser === 'object' && 
                 !Array.isArray(teamUser) &&
                 !('error' in teamUser) &&
                 'id' in teamUser;
        })
        .map((member) => {
          // At this point, we know team_user is valid due to filtering
          return {
            ...member,
            team_user: (member.team_user as unknown) as TeamUser
          };
        });
      
      setTeamMembers(validMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setTeamMembers([]);
      // Don't show error toast for team members as it's not critical for CRM functionality
    }
  };

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

  return {
    teamMembers,
    fetchTeamMembers,
    updateTeamMember,
    removeTeamMember,
  };
};
