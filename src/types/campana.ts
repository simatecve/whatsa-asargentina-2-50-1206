
export type Campana = {
  id: string;
  nombre: string;
  lista_id: string;
  mensaje: string | null;
  archivo_url: string | null;
  delay_minimo: number;
  delay_maximo: number;
  estado: string;
  webhook_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
};

export type CampanaEnvio = {
  id: string;
  campana_id: string;
  contacto_id: string;
  estado: string;
  error: string | null;
  created_at: string;
  updated_at: string | null;
  enviado_at: string | null;
};

export type Webhook = {
  id: string;
  nombre: string;
  url: string;
  descripcion: string | null;
  tipo: string;
  created_at: string | null;
  updated_at: string | null;
};
