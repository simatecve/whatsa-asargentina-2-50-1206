
-- Primero, limpiar cualquier dato inconsistente
DELETE FROM team_members WHERE member_user_id NOT IN (SELECT id FROM team_users);
DELETE FROM team_members WHERE owner_user_id NOT IN (SELECT user_id FROM usuarios);
DELETE FROM internal_notes WHERE author_user_id NOT IN (SELECT user_id FROM usuarios);
DELETE FROM conversation_assignments WHERE assigned_to_user_id NOT IN (SELECT user_id FROM usuarios);
DELETE FROM conversation_assignments WHERE assigned_by_user_id NOT IN (SELECT user_id FROM usuarios) AND assigned_by_user_id IS NOT NULL;

-- Crear las foreign keys faltantes
ALTER TABLE team_members 
ADD CONSTRAINT fk_team_members_member_user_id 
FOREIGN KEY (member_user_id) REFERENCES team_users(id) ON DELETE CASCADE;

ALTER TABLE team_members 
ADD CONSTRAINT fk_team_members_owner_user_id 
FOREIGN KEY (owner_user_id) REFERENCES usuarios(user_id) ON DELETE CASCADE;

ALTER TABLE internal_notes 
ADD CONSTRAINT fk_internal_notes_author_user_id 
FOREIGN KEY (author_user_id) REFERENCES usuarios(user_id) ON DELETE CASCADE;

ALTER TABLE conversation_assignments 
ADD CONSTRAINT fk_conversation_assignments_assigned_to_user_id 
FOREIGN KEY (assigned_to_user_id) REFERENCES usuarios(user_id) ON DELETE CASCADE;

ALTER TABLE conversation_assignments 
ADD CONSTRAINT fk_conversation_assignments_assigned_by_user_id 
FOREIGN KEY (assigned_by_user_id) REFERENCES usuarios(user_id) ON DELETE SET NULL;

-- Asegurar que las conversaciones tienen acceso completo para el usuario principal
-- Actualizar las políticas RLS para conversaciones
DROP POLICY IF EXISTS "Users can view conversations from their instances" ON conversaciones;
CREATE POLICY "Users can view conversations from their instances" 
ON conversaciones FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM instancias 
    WHERE instancias.nombre = conversaciones.instancia_nombre 
    AND instancias.user_id = auth.uid()
  )
);

-- Política similar para mensajes
DROP POLICY IF EXISTS "Users can view messages from their instances" ON mensajes;
CREATE POLICY "Users can view messages from their instances" 
ON mensajes FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM instancias 
    WHERE instancias.nombre = mensajes.instancia 
    AND instancias.user_id = auth.uid()
  )
);

-- Asegurar que se pueden actualizar las conversaciones
DROP POLICY IF EXISTS "Users can update conversations from their instances" ON conversaciones;
CREATE POLICY "Users can update conversations from their instances" 
ON conversaciones FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM instancias 
    WHERE instancias.nombre = conversaciones.instancia_nombre 
    AND instancias.user_id = auth.uid()
  )
);
