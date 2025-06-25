
-- Crear tabla para usuarios de equipo específicos
CREATE TABLE public.team_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_user_id UUID NOT NULL REFERENCES public.usuarios(user_id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nombre TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(owner_user_id, email)
);

-- Habilitar RLS
ALTER TABLE public.team_users ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para team_users
CREATE POLICY "Users can view their own team users" 
  ON public.team_users 
  FOR SELECT 
  USING (owner_user_id = auth.uid());

CREATE POLICY "Users can create their own team users" 
  ON public.team_users 
  FOR INSERT 
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Users can update their own team users" 
  ON public.team_users 
  FOR UPDATE 
  USING (owner_user_id = auth.uid());

CREATE POLICY "Users can delete their own team users" 
  ON public.team_users 
  FOR DELETE 
  USING (owner_user_id = auth.uid());

-- Actualizar expertise_area para usar las secciones del sistema
DROP TYPE IF EXISTS public.expertise_area CASCADE;
CREATE TYPE public.expertise_area AS ENUM (
  'conexion',
  'crm', 
  'leads_kanban',
  'contactos',
  'campanas',
  'agente_ia',
  'analiticas',
  'configuracion',
  'general'
);

-- Recrear las columnas que existían previamente con el nuevo tipo
-- Verificar si la columna existe antes de intentar modificarla
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_members' AND column_name = 'expertise_areas') THEN
    ALTER TABLE public.team_members 
    ALTER COLUMN expertise_areas TYPE expertise_area[] 
    USING expertise_areas::text[]::expertise_area[];
  ELSE
    ALTER TABLE public.team_members 
    ADD COLUMN expertise_areas expertise_area[] DEFAULT ARRAY['general']::expertise_area[];
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversation_assignments' AND column_name = 'expertise_required') THEN
    ALTER TABLE public.conversation_assignments 
    ALTER COLUMN expertise_required TYPE expertise_area 
    USING expertise_required::text::expertise_area;
  ELSE
    ALTER TABLE public.conversation_assignments 
    ADD COLUMN expertise_required expertise_area DEFAULT 'general';
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'smart_templates' AND column_name = 'expertise_area') THEN
    ALTER TABLE public.smart_templates 
    ALTER COLUMN expertise_area TYPE expertise_area 
    USING expertise_area::text::expertise_area;
  ELSE
    ALTER TABLE public.smart_templates 
    ADD COLUMN expertise_area expertise_area DEFAULT 'general';
  END IF;
END $$;

-- Habilitar RLS en team_members si no está habilitado
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen y crear nuevas
DROP POLICY IF EXISTS "Users can view their own team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can create their own team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can update their own team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can delete their own team members" ON public.team_members;

-- Políticas RLS para team_members
CREATE POLICY "Users can view their own team members" 
  ON public.team_members 
  FOR SELECT 
  USING (owner_user_id = auth.uid());

CREATE POLICY "Users can create their own team members" 
  ON public.team_members 
  FOR INSERT 
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Users can update their own team members" 
  ON public.team_members 
  FOR UPDATE 
  USING (owner_user_id = auth.uid());

CREATE POLICY "Users can delete their own team members" 
  ON public.team_members 
  FOR DELETE 
  USING (owner_user_id = auth.uid());
