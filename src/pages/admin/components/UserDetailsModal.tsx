
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Usuario } from "./types";

interface UserDetailsModalProps {
  user: Usuario | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, isOpen, onClose }) => {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalles del Usuario</DialogTitle>
          <DialogDescription>
            Información completa del usuario seleccionado.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 text-sm">
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-semibold text-right">Nombre</span>
            <span className="col-span-2">{user.nombre || "Sin nombre"}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-semibold text-right">Email</span>
            <span className="col-span-2 break-all">{user.email || "Sin email"}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-semibold text-right">Perfil</span>
            <div className="col-span-2">
              <Badge variant={user.perfil === 'administrador' ? 'default' : 'secondary'}>
                {user.perfil === 'administrador' ? 'Admin' : 'Usuario'}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-semibold text-right">Creado</span>
            <span className="col-span-2">{formatDate(user.created_at)}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-semibold text-right">ID Usuario</span>
            <span className="col-span-2 font-mono break-all">{user.user_id || user.id}</span>
          </div>
           <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-semibold text-right">ID Interno</span>
            <span className="col-span-2 font-mono break-all">{user.id}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
