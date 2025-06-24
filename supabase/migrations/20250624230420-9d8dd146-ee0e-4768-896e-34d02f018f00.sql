
-- Crear enum para roles de equipo
CREATE TYPE public.team_role AS ENUM ('owner', 'admin', 'agent', 'viewer');

-- Crear enum para estados de asignación
CREATE TYPE public.assignment_status AS ENUM ('available', 'busy', 'offline');

-- Crear enum para expertise areas
CREATE TYPE public.expertise_area AS ENUM ('sales', 'support', 'technical', 'billing', 'general');

-- Tabla para miembros del equipo
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_user_id UUID NOT NULL REFERENCES public.usuarios(user_id) ON DELETE CASCADE,
  member_user_id UUID NOT NULL REFERENCES public.usuarios(user_id) ON DELETE CASCADE,
  role team_role NOT NULL DEFAULT 'agent',
  status assignment_status NOT NULL DEFAULT 'available',
  expertise_areas expertise_area[] DEFAULT ARRAY['general']::expertise_area[],
  max_concurrent_conversations INTEGER DEFAULT 5,
  current_conversation_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(owner_user_id, member_user_id)
);

-- Tabla para asignaciones de conversaciones
CREATE TABLE public.conversation_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversaciones(id) ON DELETE CASCADE,
  assigned_to_user_id UUID NOT NULL REFERENCES public.usuarios(user_id) ON DELETE CASCADE,
  assigned_by_user_id UUID REFERENCES public.usuarios(user_id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'active',
  priority INTEGER DEFAULT 1,
  expertise_required expertise_area DEFAULT 'general',
  notes TEXT,
  UNIQUE(conversation_id, assigned_to_user_id)
);

-- Tabla para notas internas entre agentes
CREATE TABLE public.internal_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversaciones(id) ON DELETE CASCADE,
  author_user_id UUID NOT NULL REFERENCES public.usuarios(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false,
  mentioned_users UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para templates de respuestas inteligentes
CREATE TABLE public.smart_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_user_id UUID NOT NULL REFERENCES public.usuarios(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  context_triggers TEXT[] DEFAULT ARRAY[]::TEXT[],
  expertise_area expertise_area DEFAULT 'general',
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para colaboración en tiempo real
CREATE TABLE public.conversation_collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversaciones(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.usuarios(user_id) ON DELETE CASCADE,
  role TEXT DEFAULT 'observer', -- 'primary', 'collaborator', 'observer'
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_typing BOOLEAN DEFAULT false,
  UNIQUE(conversation_id, user_id)
);

-- Habilitar RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_collaborators ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para team_members
CREATE POLICY "Users can view team members where they are owner or member"
  ON public.team_members FOR SELECT
  USING (owner_user_id = auth.uid() OR member_user_id = auth.uid());

CREATE POLICY "Only owners can insert team members"
  ON public.team_members FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Only owners can update team members"
  ON public.team_members FOR UPDATE
  USING (owner_user_id = auth.uid());

CREATE POLICY "Only owners can delete team members"
  ON public.team_members FOR DELETE
  USING (owner_user_id = auth.uid());

-- Políticas RLS para conversation_assignments
CREATE POLICY "Users can view assignments for their team conversations"
  ON public.conversation_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE (tm.owner_user_id = auth.uid() OR tm.member_user_id = auth.uid())
      AND (tm.owner_user_id = assigned_to_user_id OR tm.member_user_id = assigned_to_user_id)
    )
  );

CREATE POLICY "Team members can create assignments"
  ON public.conversation_assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.member_user_id = auth.uid() AND tm.role IN ('owner', 'admin')
    )
  );

-- Políticas RLS para internal_notes
CREATE POLICY "Team members can view internal notes"
  ON public.internal_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.member_user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create internal notes"
  ON public.internal_notes FOR INSERT
  WITH CHECK (author_user_id = auth.uid());

-- Políticas RLS para smart_templates
CREATE POLICY "Users can view their team templates"
  ON public.smart_templates FOR SELECT
  USING (
    owner_user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.member_user_id = auth.uid() AND tm.owner_user_id = owner_user_id
    )
  );

CREATE POLICY "Only owners can manage templates"
  ON public.smart_templates FOR ALL
  USING (owner_user_id = auth.uid());

-- Políticas RLS para conversation_collaborators
CREATE POLICY "Team members can view collaboration sessions"
  ON public.conversation_collaborators FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.member_user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can join collaboration sessions"
  ON public.conversation_collaborators FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own collaboration status"
  ON public.conversation_collaborators FOR UPDATE
  USING (user_id = auth.uid());

-- Función para asignación automática de conversaciones
CREATE OR REPLACE FUNCTION public.auto_assign_conversation(
  p_conversation_id UUID,
  p_expertise_required expertise_area DEFAULT 'general'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_assigned_user_id UUID;
  v_owner_user_id UUID;
BEGIN
  -- Obtener el owner de la conversación basado en la instancia
  SELECT u.user_id INTO v_owner_user_id
  FROM public.conversaciones c
  JOIN public.instancias i ON c.instancia_nombre = i.nombre
  JOIN public.usuarios u ON i.user_id = u.user_id
  WHERE c.id = p_conversation_id;
  
  IF v_owner_user_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Buscar el mejor agente disponible
  SELECT tm.member_user_id INTO v_assigned_user_id
  FROM public.team_members tm
  WHERE tm.owner_user_id = v_owner_user_id
    AND tm.is_active = true
    AND tm.status = 'available'
    AND p_expertise_required = ANY(tm.expertise_areas)
    AND tm.current_conversation_count < tm.max_concurrent_conversations
  ORDER BY tm.current_conversation_count ASC, tm.created_at ASC
  LIMIT 1;
  
  -- Si no hay agente especializado, buscar cualquier agente disponible
  IF v_assigned_user_id IS NULL THEN
    SELECT tm.member_user_id INTO v_assigned_user_id
    FROM public.team_members tm
    WHERE tm.owner_user_id = v_owner_user_id
      AND tm.is_active = true
      AND tm.status = 'available'
      AND tm.current_conversation_count < tm.max_concurrent_conversations
    ORDER BY tm.current_conversation_count ASC, tm.created_at ASC
    LIMIT 1;
  END IF;
  
  -- Crear la asignación si se encontró un agente
  IF v_assigned_user_id IS NOT NULL THEN
    INSERT INTO public.conversation_assignments (
      conversation_id,
      assigned_to_user_id,
      expertise_required,
      status
    ) VALUES (
      p_conversation_id,
      v_assigned_user_id,
      p_expertise_required,
      'active'
    ) ON CONFLICT (conversation_id, assigned_to_user_id) DO NOTHING;
    
    -- Actualizar contador de conversaciones
    UPDATE public.team_members 
    SET current_conversation_count = current_conversation_count + 1
    WHERE member_user_id = v_assigned_user_id;
  END IF;
  
  RETURN v_assigned_user_id;
END;
$$;

-- Función para obtener templates contextuales
CREATE OR REPLACE FUNCTION public.get_contextual_templates(
  p_user_id UUID,
  p_message_content TEXT DEFAULT '',
  p_expertise_area expertise_area DEFAULT 'general'
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  content TEXT,
  usage_count INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    st.id,
    st.title,
    st.content,
    st.usage_count
  FROM public.smart_templates st
  WHERE st.is_active = true
    AND (
      st.owner_user_id = p_user_id OR
      EXISTS (
        SELECT 1 FROM public.team_members tm 
        WHERE tm.member_user_id = p_user_id AND tm.owner_user_id = st.owner_user_id
      )
    )
    AND (
      st.expertise_area = p_expertise_area OR
      st.expertise_area = 'general'
    )
    AND (
      p_message_content = '' OR
      EXISTS (
        SELECT 1 FROM unnest(st.context_triggers) AS trigger
        WHERE LOWER(p_message_content) LIKE '%' || LOWER(trigger) || '%'
      )
    )
  ORDER BY 
    CASE WHEN st.expertise_area = p_expertise_area THEN 1 ELSE 2 END,
    st.usage_count DESC,
    st.created_at DESC
  LIMIT 10;
END;
$$;

-- Trigger para limpiar asignaciones cuando se cierra una conversación
CREATE OR REPLACE FUNCTION public.cleanup_conversation_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Actualizar contador de conversaciones del agente
  UPDATE public.team_members 
  SET current_conversation_count = GREATEST(0, current_conversation_count - 1)
  WHERE member_user_id = OLD.assigned_to_user_id;
  
  RETURN OLD;
END;
$$;

CREATE TRIGGER cleanup_assignment_trigger
  AFTER DELETE ON public.conversation_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_conversation_assignment();

-- Habilitar realtime para las nuevas tablas
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.internal_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_collaborators;
