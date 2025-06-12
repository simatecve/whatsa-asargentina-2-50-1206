
export type Campana = {
  id: string;
  nombre: string;
  lista_id: string;
  mensaje: string | null;
  archivo_url: string | null;
  delay_minimo: number;
  delay_maximo: number;
  estado: string;
  created_at: string;
  updated_at: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  lista_nombre?: string;
  total_contactos?: number;
  enviados?: number;
  pendientes?: number;
  instance_id?: string | null;
  instance_nombre?: string;
};

export type CampanasListProps = {
  estado: string;
  onCreateNew?: () => void;
};
