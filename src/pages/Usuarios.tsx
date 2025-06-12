import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

type Usuario = {
  id: string;
  nombre: string;
  email: string;
  perfil: string;
  created_at?: string;
  user_id?: string;
};

// Lista de usuarios de muestra para fallback
const usuariosMuestra: Usuario[] = [
  {
    id: "1",
    nombre: "Juan Pérez",
    email: "juan.perez@ejemplo.com",
    perfil: "Administrador"
  },
  {
    id: "2",
    nombre: "María García",
    email: "maria.garcia@ejemplo.com",
    perfil: "Editor"
  },
  {
    id: "3",
    nombre: "Carlos Rodríguez",
    email: "carlos.rodriguez@ejemplo.com",
    perfil: "Usuario"
  },
  {
    id: "4",
    nombre: "Ana Martínez",
    email: "ana.martinez@ejemplo.com",
    perfil: "Editor"
  },
  {
    id: "5",
    nombre: "Roberto Fernández",
    email: "roberto.fernandez@ejemplo.com",
    perfil: "Usuario"
  },
  {
    id: "6",
    nombre: "Mónica Torres",
    email: "monica.torres@ejemplo.com",
    perfil: "Administrador"
  },
  {
    id: "7",
    nombre: "José Sánchez",
    email: "jose.sanchez@ejemplo.com",
    perfil: "Usuario"
  }
];

const Usuarios = () => {
  const [busqueda, setBusqueda] = useState("");
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  // Obtener la sesión actual
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        // Si la sesión cambia, actualizamos los datos
        if (session) {
          setTimeout(() => {
            cargarDatosUsuarioActual(session.user.id);
            cargarUsuarios();
          }, 0);
        } else {
          setUsuarioActual(null);
          setUsuariosFiltrados(usuariosMuestra);
        }
      }
    );

    // Verificar si ya hay una sesión al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        cargarDatosUsuarioActual(session.user.id);
        cargarUsuarios();
      } else {
        // Usar datos de muestra si no hay sesión
        setUsuariosFiltrados(usuariosMuestra);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cargar datos del usuario actual
  const cargarDatosUsuarioActual = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error al cargar datos del usuario:", error);
        toast.error("Error al cargar datos de usuario");
      } else {
        setUsuarioActual(data);
      }
    } catch (e) {
      console.error("Error inesperado:", e);
    }
  };

  // Cargar lista de usuarios
  const cargarUsuarios = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*");

      if (error) {
        console.error("Error al cargar usuarios:", error);
        toast.error("No se pudieron cargar los usuarios");
        setUsuariosFiltrados(usuariosMuestra);
      } else if (data) {
        setUsuariosFiltrados(data);
      }
    } catch (e) {
      console.error("Error inesperado:", e);
      setUsuariosFiltrados(usuariosMuestra);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar usuarios según la búsqueda
  useEffect(() => {
    if (session) {
      const filtered = usuariosFiltrados.filter(
        (usuario) =>
          usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          usuario.email.toLowerCase().includes(busqueda.toLowerCase()) ||
          usuario.perfil.toLowerCase().includes(busqueda.toLowerCase())
      );
      setUsuariosFiltrados(filtered);
    } else {
      const filtered = usuariosMuestra.filter(
        (usuario) =>
          usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          usuario.email.toLowerCase().includes(busqueda.toLowerCase()) ||
          usuario.perfil.toLowerCase().includes(busqueda.toLowerCase())
      );
      setUsuariosFiltrados(filtered);
    }
  }, [busqueda]);

  const handleCambiarEstado = (id: string) => {
    toast.success("Estado actualizado", {
      description: `Estado de usuario actualizado correctamente`,
    });
  };

  const handleEliminarUsuario = (id: string) => {
    const usuarioEliminado = usuariosFiltrados.find((usuario) => usuario.id === id);
    if (usuarioEliminado) {
      toast.error("Usuario eliminado", {
        description: `${usuarioEliminado.nombre} ha sido eliminado del sistema`,
      });
      
      // Eliminar de la lista
      const nuevaLista = usuariosFiltrados.filter((usuario) => usuario.id !== id);
      setUsuariosFiltrados(nuevaLista);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h1>
        <p className="text-muted-foreground mt-1">
          Administre los usuarios del sistema
        </p>
      </div>

      {usuarioActual && (
        <Card>
          <CardHeader>
            <CardTitle>Usuario Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Nombre</p>
                <p className="text-lg font-semibold">{usuarioActual.nombre}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-lg">{usuarioActual.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Perfil</p>
                <p className="text-lg">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {usuarioActual.perfil || "Usuario"}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="w-full md:w-64">
          <Input
            placeholder="Buscar usuarios..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full"
          />
        </div>
        <Button className="bg-azul-700 hover:bg-azul-800">Nuevo Usuario</Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead className="hidden md:table-cell">Perfil</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-24 md:w-32 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-32 md:w-48 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse ml-auto"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              usuariosFiltrados.length > 0 ? (
                usuariosFiltrados.map((usuario, index) => (
                  <TableRow key={usuario.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{usuario.nombre}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{usuario.perfil}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Ver Detalle</DropdownMenuItem>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCambiarEstado(usuario.id)}>
                            Cambiar Estado
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600" 
                            onClick={() => handleEliminarUsuario(usuario.id)}
                          >
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No se encontraron usuarios
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Usuarios;
