
export type TeamRole = 'owner' | 'admin' | 'agent' | 'viewer';
export type AssignmentStatus = 'available' | 'busy' | 'offline';
export type ExpertiseArea = 'conexion' | 'crm' | 'leads_kanban' | 'contactos' | 'campanas' | 'agente_ia' | 'analiticas' | 'configuracion' | 'general';

export interface TeamUser {
  id: string;
  owner_user_id: string;
  email: string;
  nombre: string;
  password_hash: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  owner_user_id: string;
  member_user_id: string;
  role: TeamRole;
  status: AssignmentStatus;
  expertise_areas: ExpertiseArea[];
  max_concurrent_conversations: number;
  current_conversation_count: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  team_user?: TeamUser;
}

export interface ConversationAssignment {
  id: string;
  conversation_id: string;
  assigned_to_user_id: string;
  assigned_by_user_id?: string;
  assigned_at: string;
  status: string;
  priority: number;
  expertise_required: ExpertiseArea;
  notes?: string;
  assigned_to_name?: string;
}

export interface InternalNote {
  id: string;
  conversation_id: string;
  author_user_id: string;
  content: string;
  is_private: boolean;
  mentioned_users: string[];
  created_at: string;
  updated_at: string;
  author_name?: string;
}

export interface SmartTemplate {
  id: string;
  owner_user_id: string;
  title: string;
  content: string;
  context_triggers: string[];
  expertise_area: ExpertiseArea;
  usage_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConversationCollaborator {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'primary' | 'collaborator' | 'observer';
  joined_at: string;
  last_seen: string;
  is_typing: boolean;
  user_name?: string;
}
