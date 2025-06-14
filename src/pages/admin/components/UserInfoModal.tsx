
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Usuario } from "./types";
import { User, Mail, Calendar, Shield } from "lucide-react";

interface UserInfoModalProps {
  user: Usuario | null;
  open: boolean;
  onClose: () => void;
}

export const UserInfoModal = ({ user, open, onClose }: UserInfoModalProps) => {
  if (!user) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información del Usuario
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Datos Personales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                    <User className="h-4 w-4" />
                    Nombre
                  </div>
                  <p className="font-semibold">{user.nombre || "Sin nombre"}</p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <p className="font-semibold">{user.email || "Sin email"}</p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                    <Shield className="h-4 w-4" />
                    Perfil
                  </div>
                  <Badge variant={user.perfil === 'administrador' ? 'default' : 'secondary'}>
                    {user.perfil === 'administrador' ? 'Administrador' : 'Usuario'}
                  </Badge>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                    <Calendar className="h-4 w-4" />
                    Fecha de registro
                  </div>
                  <p className="font-semibold">{formatDate(user.created_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información del sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">ID de Usuario</p>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                    {user.user_id || user.id}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Estado</p>
                  <Badge variant="outline" className="text-green-600">
                    Activo
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
