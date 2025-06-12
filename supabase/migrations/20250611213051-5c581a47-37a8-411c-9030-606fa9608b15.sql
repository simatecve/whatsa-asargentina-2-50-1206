
-- Mejorar las políticas RLS para permitir eliminación de usuarios por administradores
CREATE POLICY "Admins can delete any user" ON public.usuarios
FOR DELETE
USING (public.is_current_user_admin());

-- Agregar trigger para limpiar datos relacionados cuando se elimina un usuario
CREATE OR REPLACE FUNCTION public.cleanup_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Eliminar suscripciones
  DELETE FROM public.suscripciones WHERE user_id = OLD.user_id;
  
  -- Eliminar pagos
  DELETE FROM public.pagos WHERE user_id = OLD.user_id;
  
  -- Eliminar instancias
  DELETE FROM public.instancias WHERE user_id = OLD.user_id;
  
  -- Eliminar contactos
  DELETE FROM public.contacts WHERE user_id = OLD.user_id;
  
  -- Eliminar listas de contactos
  DELETE FROM public.contact_lists WHERE user_id = OLD.user_id;
  
  -- Eliminar campañas
  DELETE FROM public.campanas WHERE user_id = OLD.user_id;
  
  -- Eliminar configuración de agente IA
  DELETE FROM public.agente_ia_config WHERE user_id = OLD.user_id;
  
  -- Eliminar datos de negocio
  DELETE FROM public.datos_negocio WHERE user_id = OLD.user_id;
  
  -- Eliminar respuestas rápidas
  DELETE FROM public.quick_replies WHERE user_id = OLD.user_id;
  
  -- Eliminar columnas kanban
  DELETE FROM public.kanban_columns WHERE user_id = OLD.user_id;
  
  -- Eliminar contactos bots
  DELETE FROM public.contactos_bots WHERE user_id = OLD.user_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear el trigger
DROP TRIGGER IF EXISTS cleanup_user_data_trigger ON public.usuarios;
CREATE TRIGGER cleanup_user_data_trigger
  BEFORE DELETE ON public.usuarios
  FOR EACH ROW EXECUTE FUNCTION public.cleanup_user_data();
