import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserFormDialog } from "./components/UserFormDialog";
import { UserInfoModal } from "./components/UserInfoModal";
import { UsersTable } from "./components/UsersTable";
import { useUserOperations } from "./hooks/useUserOperations";
import { Usuario, FormData } from "./components/types";

const UsuariosAdmin = () => {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState<Usuario | null>(null);
  const [viewUser, setViewUser] = useState<Usuario | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    email: "",
    password: "",
    perfil: "usuario"
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching users:", error);
        toast.error("Error al cargar los usuarios");
        return;
      }
      
      // Asegurar tipos correctos
      const typedUsers: Usuario[] = (data || []).map(user => ({
        ...user,
        perfil: (user.perfil === 'administrador' ? 'administrador' : 'usuario') as 'administrador' | 'usuario'
      }));
      
      setUsers(typedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error inesperado al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const { saving, handleSaveUser, handleDeleteUser } = useUserOperations(fetchUsers);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
    toast.success("Lista de usuarios actualizada");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, perfil: value as 'administrador' | 'usuario' }));
  };

  const openCreateDialog = () => {
    setEditUser(null);
    setFormData({
      nombre: "",
      email: "",
      password: "",
      perfil: "usuario"
    });
    setOpen(true);
  };

  const openEditDialog = (user: Usuario) => {
    setEditUser(user);
    setFormData({
      nombre: user.nombre || "",
      email: user.email || "",
      password: "",
      perfil: user.perfil || "usuario"
    });
    setOpen(true);
  };

  const onSaveUser = () => {
    handleSaveUser(formData, editUser, setOpen);
  };

  const handleViewUser = (user: Usuario) => {
    setViewUser(user);
  };

  const filteredUsers = users.filter(user => 
    user.nombre?.toLowerCase().includes(search.toLowerCase()) || 
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Administración de Usuarios</h1>
          <p className="text-muted-foreground">
            Gestione los usuarios del sistema y sus permisos.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={refreshing}
            size="sm"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </Button>
          <Button onClick={openCreateDialog}>
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Input
          placeholder="Buscar usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="text-sm text-muted-foreground">
          {filteredUsers.length} usuario(s) encontrado(s)
        </div>
      </div>

      <UsersTable
        users={filteredUsers}
        loading={loading}
        onEdit={openEditDialog}
        onDelete={handleDeleteUser}
        onViewUser={handleViewUser}
      />

      <UserFormDialog
        open={open}
        setOpen={setOpen}
        editUser={editUser}
        formData={formData}
        saving={saving}
        onInputChange={handleInputChange}
        onSelectChange={handleSelectChange}
        onSave={onSaveUser}
      />

      <UserInfoModal
        user={viewUser}
        open={!!viewUser}
        onClose={() => setViewUser(null)}
      />
    </div>
  );
};

export default UsuariosAdmin;
