-- Configurar REPLICA IDENTITY FULL para capturar todos los cambios
ALTER TABLE public.conversaciones REPLICA IDENTITY FULL;
ALTER TABLE public.mensajes REPLICA IDENTITY FULL;
ALTER TABLE public.contactos_bots REPLICA IDENTITY FULL;