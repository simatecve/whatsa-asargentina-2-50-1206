
export interface Conversation {
  id: string;
  numero_contacto: string;
  nombre_contacto: string | null;
  ultimo_mensaje: string | null;
  ultimo_mensaje_fecha: string | null;
  mensajes_no_leidos: number;
  instancia_nombre?: string;
}

export interface Message {
  id: number;
  instancia: string | null;
  numero: string | null;
  pushname: string | null;
  mensaje: string | null;
  tipo_mensaje: string | null;
  estado_lectura: boolean | null;
  mensaje_id: string | null;
  archivo_url: string | null;
  archivo_nombre: string | null;
  archivo_tipo: string | null;
  adjunto: string | null;
  direccion: string | null;
  respondido_a: string | null;
  created_at: string;
  conversation_id: string | null;
}
