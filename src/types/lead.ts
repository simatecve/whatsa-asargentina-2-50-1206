
export interface Lead {
  id: number;
  pushname?: string | null;
  numero?: string | null;
  instancia?: string | null;
  created_at: string;
  status: string; // Ahora puede ser cualquier string, no limitado a los valores fijos
}

// Mantenemos estos tipos para compatibilidad, pero ahora serán dinámicos
export type LeadStatus = string;

// Configuración predeterminada que se usa como fallback
export const DEFAULT_LEAD_STATUS_CONFIG = {
  'new': {
    title: 'Nuevos',
    color: 'bg-blue-100 border-blue-400 text-blue-800',
    order: 1
  }
} as const;
