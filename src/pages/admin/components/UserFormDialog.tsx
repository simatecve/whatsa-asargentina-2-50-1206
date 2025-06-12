
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Usuario, FormData } from "./types";

interface UserFormDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  editUser: Usuario | null;
  formData: FormData;
  saving: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (value: string) => void;
  onSave: () => void;
}

export const UserFormDialog: React.FC<UserFormDialogProps> = ({
  open,
  setOpen,
  editUser,
  formData,
  saving,
  onInputChange,
  onSelectChange,
  onSave,
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</DialogTitle>
          <DialogDescription>
            {editUser 
              ? 'Actualice los datos del usuario seleccionado.' 
              : 'Complete el formulario para crear un nuevo usuario.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              name="nombre"
              placeholder="Nombre completo"
              value={formData.nombre}
              onChange={onInputChange}
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={formData.email}
              onChange={onInputChange}
              disabled={!!editUser || saving}
            />
            {editUser && (
              <p className="text-xs text-muted-foreground">
                El email no se puede modificar una vez creado el usuario
              </p>
            )}
          </div>
          {!editUser && (
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={onInputChange}
                disabled={saving}
              />
            </div>
          )}
          {editUser && (
            <div className="space-y-2">
              <Label htmlFor="password">Nueva Contraseña (opcional)</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Ingrese nueva contraseña para cambiar"
                value={formData.password}
                onChange={onInputChange}
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground">
                Ingrese una nueva contraseña solo si desea cambiarla.
              </p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="perfil">Perfil</Label>
            <Select
              value={formData.perfil}
              onValueChange={onSelectChange}
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="administrador">Administrador</SelectItem>
                <SelectItem value="usuario">Usuario</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? "Guardando..." : (editUser ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
