import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Informe {
  id: number;
  titulo: string;
  descripcion: string;
  fechaGeneracion: string;
  tamano: string;
  tipo: string;
}

interface UserData {
  nombre: string;
  email: string;
  perfil: string;
  created_at?: string;
}

const informesDisponibles = [
  {
    id: 1,
    titulo: "Reporte de Usuarios Activos",
    descripcion: "Detalle de usuarios activos en el sistema, organizados por rol.",
    fechaGeneracion: "12/05/2023",
    tamano: "1.2 MB",
    tipo: "PDF"
  },
  {
    id: 2,
    titulo: "Informe de Ventas Mensual",
    descripcion: "Resumen de ventas y transacciones del mes actual con comparativas.",
    fechaGeneracion: "01/05/2023",
    tamano: "3.4 MB",
    tipo: "XLSX"
  },
  {
    id: 3,
    titulo: "Análisis de Rendimiento",
    descripcion: "Estadísticas de rendimiento del sistema y tiempos de respuesta.",
    fechaGeneracion: "28/04/2023",
    tamano: "842 KB",
    tipo: "PDF"
  },
  {
    id: 4,
    titulo: "Reporte de Incidencias",
    descripcion: "Listado de problemas reportados y estado de resolución.",
    fechaGeneracion: "15/04/2023",
    tamano: "1.5 MB",
    tipo: "DOCX"
  }
];

const InformeCard = ({ informe, onDescargar }: { informe: Informe; onDescargar: (informe: Informe) => void }) => {
  const getIconByType = (tipo: string) => {
    switch (tipo) {
      case "PDF":
        return (
          <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case "XLSX":
        return (
          <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case "DOCX":
        return (
          <svg className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return (
          <svg className="h-10 w-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{informe.titulo}</CardTitle>
          {getIconByType(informe.tipo)}
        </div>
        <CardDescription>{informe.descripcion}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Fecha de generación:</span>
            <span>{informe.fechaGeneracion}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tamaño:</span>
            <span>{informe.tamano}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Formato:</span>
            <span>{informe.tipo}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => onDescargar(informe)}
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Descargar
        </Button>
      </CardFooter>
    </Card>
  );
};

const Informes = () => {
  const [informes, setInformes] = useState<Informe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch user data
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: userDataResponse, error: userError } = await supabase
            .from("usuarios")
            .select("*")
            .eq("user_id", session.user.id)
            .single();
          
          if (userError) {
            console.error("Error fetching user data:", userError);
          } else if (userDataResponse) {
            setUserData(userDataResponse);
          }
        }

        // Simulate loading reports for the user
        // In a real app, you would fetch this from the database
        const userInformes = [
          {
            id: 1,
            titulo: "Reporte de Usuario",
            descripcion: `Reporte detallado para el usuario ${userData?.nombre || 'Actual'}`,
            fechaGeneracion: new Date().toLocaleDateString(),
            tamano: "1.2 MB",
            tipo: "PDF"
          },
          {
            id: 2,
            titulo: "Informe de Actividad Mensual",
            descripcion: "Resumen de actividades del mes actual con estadísticas.",
            fechaGeneracion: new Date().toLocaleDateString(),
            tamano: "3.4 MB",
            tipo: "XLSX"
          },
          {
            id: 3,
            titulo: "Análisis de Rendimiento",
            descripcion: "Estadísticas de rendimiento del sistema y tiempos de respuesta.",
            fechaGeneracion: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 7 days ago
            tamano: "842 KB",
            tipo: "PDF"
          },
          {
            id: 4,
            titulo: "Reporte de Incidencias",
            descripcion: `Listado de problemas reportados por ${userData?.nombre || 'el usuario'}`,
            fechaGeneracion: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 14 days ago
            tamano: "1.5 MB",
            tipo: "DOCX"
          }
        ];

        setTimeout(() => {
          setInformes(userInformes);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
        toast.error("Error al cargar los informes");
      }
    };

    fetchData();
  }, []);

  const handleDescargar = (informe: Informe) => {
    toast.info("Descarga iniciada", {
      description: `${informe.titulo} (${informe.tipo})`,
    });
  };

  const handleGenerarNuevoInforme = () => {
    if (userData) {
      toast.success("Generando informe", {
        description: `El nuevo informe para ${userData.nombre} estará listo en unos minutos.`,
      });
    } else {
      toast.success("Generando informe", {
        description: "El nuevo informe estará listo en unos minutos.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Informes</h1>
          {userData && (
            <p className="text-muted-foreground mt-1">
              Informes y estadísticas para <span className="font-medium">{userData.nombre}</span> ({userData.perfil})
            </p>
          )}
          {!userData && (
            <p className="text-muted-foreground mt-1">
              Acceda a los informes y estadísticas del sistema
            </p>
          )}
        </div>
        <Button 
          className="bg-azul-700 hover:bg-azul-800"
          onClick={handleGenerarNuevoInforme}
        >
          Nuevo Informe
        </Button>
      </div>

      {userData && (
        <Card className="bg-gradient-to-r from-azul-50 to-white dark:from-azul-950 dark:to-gray-900">
          <CardHeader>
            <CardTitle>Información de Usuario</CardTitle>
            <CardDescription>Datos actuales del usuario</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Nombre:</span>
                <p className="font-medium">{userData.nombre}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Email:</span>
                <p className="font-medium">{userData.email}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Perfil:</span>
                <p className="font-medium">{userData.perfil}</p>
              </div>
              {userData.created_at && (
                <div>
                  <span className="text-sm text-muted-foreground">Miembro desde:</span>
                  <p className="font-medium">{new Date(userData.created_at).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between">
                  <div className="h-6 bg-gray-200 rounded dark:bg-gray-800 animate-pulse w-48"></div>
                  <div className="h-10 w-10 bg-gray-200 rounded dark:bg-gray-800 animate-pulse"></div>
                </div>
                <div className="h-4 mt-2 bg-gray-200 rounded dark:bg-gray-800 animate-pulse w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded dark:bg-gray-800 animate-pulse w-24"></div>
                      <div className="h-4 bg-gray-200 rounded dark:bg-gray-800 animate-pulse w-16"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <div className="h-9 bg-gray-200 rounded dark:bg-gray-800 animate-pulse w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {informes.map((informe) => (
            <InformeCard 
              key={informe.id} 
              informe={informe} 
              onDescargar={handleDescargar} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Informes;
