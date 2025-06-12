
export interface KanbanColumn {
  id: string;
  user_id: string;
  status_key: string;
  title: string;
  color_class: string;
  order_position: number;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateKanbanColumnRequest {
  status_key: string;
  title: string;
  color_class: string;
  order_position: number;
}

export interface UpdateKanbanColumnRequest {
  title?: string;
  color_class?: string;
  order_position?: number;
  is_active?: boolean;
}
