-- Habilitar tiempo real para las tablas de conversaciones y mensajes
ALTER TABLE public.conversaciones REPLICA IDENTITY FULL;
ALTER TABLE public.mensajes REPLICA IDENTITY FULL;
ALTER TABLE public.contactos_bots REPLICA IDENTITY FULL;

-- Agregar las tablas a la publicación de tiempo real
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversaciones;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mensajes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contactos_bots;