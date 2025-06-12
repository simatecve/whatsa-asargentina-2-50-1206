
-- Permitir a los administradores eliminar planes
CREATE POLICY "Admins can delete planes" ON public.planes
FOR DELETE
USING (public.is_current_user_admin());

-- Permitir a los administradores todas las operaciones en planes
CREATE POLICY "Admins can manage planes" ON public.planes
FOR ALL
USING (public.is_current_user_admin());

-- Habilitar RLS en la tabla planes si no está habilitado
ALTER TABLE public.planes ENABLE ROW LEVEL SECURITY;
