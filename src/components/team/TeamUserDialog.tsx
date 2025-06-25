
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { TeamRole, ExpertiseArea, TeamUser } from "@/types/team";
import { toast } from "sonner";

interface TeamUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamUser?: TeamUser | null;
  onSave: (userData: {
    email: string;
    nombre: string;
    password: string;
    role: TeamRole;
    expertise_areas: ExpertiseArea[];
    max_concurrent_conversations: number;
  }) => Promise<void>;
}

const EXPERTISE_OPTIONS: { value: ExpertiseArea; label: string }[] = [
  { value: 'conexion', label: 'Conexión' },
  { value: 'crm', label: 'CRM/Mensajería' },
  { value: 'leads_kanban', label: 'Leads Kanban' },
  { value: 'contactos', label: 'Contactos' },
  { value: 'campanas', label: 'Campañas' },
  { value: 'agente_ia', label: 'Agente IA' },
  { value: 'analiticas', label: 'Analíticas' },
  { value: 'configuracion', label: 'Configuración' },
  { value: 'general', label: 'General' },
];

export const TeamUserDialog = ({ open, onOpenChange, teamUser, onSave }: TeamUserDialogProps) => {
  const [formData, setFormData] = useState({
    email: teamUser?.email || '',
    nombre: teamUser?.nombre || '',
    password: '',
    role: 'agent' as TeamRole,
    expertise_areas: ['general'] as ExpertiseArea[],
    max_concurrent_conversations: 5,
  });
  const [saving, setSaving] = useState(false);

  const handleExpertiseChange = (expertise: ExpertiseArea, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      expertise_areas: checked
        ? [...prev.expertise_areas, expertise]
        : prev.expertise_areas.filter(e => e !== expertise)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.nombre || (!teamUser && !formData.password)) {
      toast.error("Todos los campos son requeridos");
      return;
    }

    if (formData.expertise_areas.length === 0) {
      toast.error("Selecciona al menos una especialidad");
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
      onOpenChange(false);
      setFormData({
        email: '',
        nombre: '',
        password: '',
        role: 'agent',
        expertise_areas: ['general'],
        max_concurrent_conversations: 5,
      });
    } catch (error) {
      console.error('Error saving team user:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {teamUser ? 'Editar Usuario del Equipo' : 'Crear Usuario del Equipo'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              placeholder="Nombre completo"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="usuario@ejemplo.com"
            />
          </div>

          {!teamUser && (
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Contraseña temporal"
              />
            </div>
          )}

          <div>
            <Label>Rol</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as TeamRole }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="agent">Agente</SelectItem>
                <SelectItem value="viewer">Observador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Especialidades</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {EXPERTISE_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={formData.expertise_areas.includes(option.value)}
                    onCheckedChange={(checked) => 
                      handleExpertiseChange(option.value, checked as boolean)
                    }
                  />
                  <Label htmlFor={option.value} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="max_conversations">Máximo conversaciones simultáneas</Label>
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

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Guardando...' : teamUser ? 'Actualizar' : 'Crear Usuario'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
