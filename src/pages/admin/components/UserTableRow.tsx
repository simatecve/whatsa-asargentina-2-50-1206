
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye } from "lucide-react";
import { Usuario } from "./types";

interface UserTableRowProps {
  user: Usuario;
  onEdit: (user: Usuario) => void;
  onDelete: (userId: string) => void;
  onViewDetails: (user: Usuario) => void;
}

export const UserTableRow = ({ user, onEdit, onDelete, onViewDetails }: UserTableRowProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{user.nombre || "Sin nombre"}</TableCell>
      <TableCell>{user.email || "Sin email"}</TableCell>
      <TableCell>
        <Badge variant={user.perfil === 'administrador' ? 'default' : 'secondary'}>
          {user.perfil === 'administrador' ? 'Admin' : 'Usuario'}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDate(user.created_at)}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(user)}
            title="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(user)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(user.user_id || user.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
