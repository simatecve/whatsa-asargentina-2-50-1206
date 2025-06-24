
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import { TeamMember, TeamRole, ExpertiseArea } from "@/types/team";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: TeamMember | null;
}

const expertiseAreas: ExpertiseArea[] = ['sales', 'support', 'technical', 'billing', 'general'];
const roles: TeamRole[] = ['admin', 'agent', 'viewer'];

export const TeamMemberDialog = ({ open, onOpenChange, member }: TeamMemberDialogProps) => {
  const { addTeamMember, updateTeamMember } = useTeamManagement();
  const [formData, setFormData] = useState({
    email: '',
    role: 'agent' as TeamRole,
    expertise_areas: ['general'] as ExpertiseArea[],
    max_concurrent_conversations: 5
  });
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Fetch available users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('user_id, nombre, email')
          .neq('perfil', 'administrador');

        if (error) throw error;
        setAvailableUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (open && !member) {
      fetchUsers();
    }
  }, [open, member]);

  // Set initial form data for editing
  useEffect(() => {
    if (member) {
      setFormData({
        email: member.member_email || '',
        role: member.role,
        expertise_areas: member.expertise_areas,
        max_concurrent_conversations: member.max_concurrent_conversations
      });
      setSelectedUserId(member.member_user_id);
    } else {
      setFormData({
        email: '',
        role: 'agent',
        expertise_areas: ['general'],
        max_concurrent_conversations: 5
      });
      setSelectedUserId('');
    }
  }, [member]);

  const handleExpertiseChange = (area: ExpertiseArea, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        expertise_areas: [...prev.expertise_areas, area]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        expertise_areas: prev.expertise_areas.filter(a => a !== area)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (member) {
        // Update existing member
        await updateTeamMember(member.id, {
          role: formData.role,
          expertise_areas: formData.expertise_areas,
          max_concurrent_conversations: formData.max_concurrent_conversations
        });
      } else {
        // Add new member
        if (!selectedUserId) {
          toast.error('Selecciona un usuario');
          return;
        }

        await addTeamMember({
          member_user_id: selectedUserId,
          role: formData.role,
          expertise_areas: formData.expertise_areas,
          max_concurrent_conversations: formData.max_concurrent_conversations
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving team member:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {member ? 'Editar Miembro del Equipo' : 'Agregar Miembro del Equipo'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!member && (
            <div className="space-y-2">
              <Label htmlFor="user">Usuario</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar usuario" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.nombre} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value: TeamRole) => setFormData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Especialidades</Label>
            <div className="grid grid-cols-2 gap-2">
              {expertiseAreas.map((area) => (
                <div key={area} className="flex items-center space-x-2">
                  <Checkbox
                    id={area}
                    checked={formData.expertise_areas.includes(area)}
                    onCheckedChange={(checked) => handleExpertiseChange(area, checked as boolean)}
                  />
                  <Label htmlFor={area} className="text-sm">
                    {area.charAt(0).toUpperCase() + area.slice(1)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_conversations">Máximo de Conversaciones Concurrentes</Label>
            <Input
              id="max_conversations"
              type="number"
              min="1"
              max="20"
              value={formData.max_concurrent_conversations}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                max_concurrent_conversations: parseInt(e.target.value) || 5
              }))}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : member ? 'Actualizar' : 'Agregar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
