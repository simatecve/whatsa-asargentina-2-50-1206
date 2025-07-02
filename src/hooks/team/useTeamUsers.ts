
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TeamUser, TeamRole, ExpertiseArea } from "@/types/team";
import { toast } from "sonner";

export const useTeamUsers = () => {
  const [teamUsers, setTeamUsers] = useState<TeamUser[]>([]);

  const fetchTeamUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_users')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching team users:', error);
        setTeamUsers([]);
        return;
      }
      
      setTeamUsers(data || []);
    } catch (error) {
      console.error('Error fetching team users:', error);
      setTeamUsers([]);
      // Don't show error toast for team users as it's not critical for CRM functionality
    }
  };

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
      await fetchTeamUsers();
    } catch (error) {
      console.error('Error creating team user:', error);
      toast.error('Error al crear usuario del equipo');
    }
  };

  return {
    teamUsers,
    fetchTeamUsers,
    createTeamUser,
  };
};
