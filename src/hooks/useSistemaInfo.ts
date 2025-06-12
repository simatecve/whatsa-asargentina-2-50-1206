
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SistemaInfo {
  nombre_sistema: string;
  empresa: string;
  version: string;
  copyright_texto: string;
  logo_url: string | null;
  email_soporte: string | null;
  telefono_soporte: string | null;
  sitio_web: string | null;
  direccion: string | null;
}

export const useSistemaInfo = () => {
  const [sistemaInfo, setSistemaInfo] = useState<SistemaInfo>({
    nombre_sistema: "Koonetxa Argentina",
    empresa: "Koonetxa Argentina", 
    version: "1.0.0",
    copyright_texto: "© 2024 Koonetxa Argentina. Todos los derechos reservados.",
    logo_url: "/placeholder.svg",
    email_soporte: null,
    telefono_soporte: null,
    sitio_web: null,
    direccion: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSistemaInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('sistema_info')
          .select('*')
          .single();

        if (error) {
          console.log('No system info found, using defaults');
        } else if (data) {
          setSistemaInfo({
            nombre_sistema: data.nombre_sistema || "Koonetxa Argentina",
            empresa: data.empresa || "Koonetxa Argentina",
            version: data.version || "1.0.0", 
            copyright_texto: data.copyright_texto || "© 2024 Koonetxa Argentina. Todos los derechos reservados.",
            logo_url: data.logo_url || "/placeholder.svg",
            email_soporte: data.email_soporte,
            telefono_soporte: data.telefono_soporte,
            sitio_web: data.sitio_web,
            direccion: data.direccion
          });
        }
      } catch (error) {
        console.error('Error fetching sistema info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSistemaInfo();
  }, []);

  return { sistemaInfo, loading };
};
