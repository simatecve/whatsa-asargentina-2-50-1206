
import { useState } from "react";

// Hook simplificado que no interfiere con el CRM básico
export const useTeamManagement = () => {
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  // Retornar valores por defecto que no interfieran con el CRM
  return {
    // State - valores por defecto
    teamMembers: [],
    teamUsers: [],
    assignments: [],
    internalNotes: [],
    smartTemplates: [],
    loading,
    error,

    // Funciones que aceptan parámetros pero no hacen nada para mantener compatibilidad
    fetchTeamUsers: () => Promise.resolve(),
    fetchTeamMembers: () => Promise.resolve(),
    createTeamUser: (userData: any) => Promise.resolve(),
    updateTeamMember: (id: string, data: any) => Promise.resolve(),
    removeTeamMember: (id: string) => Promise.resolve(),
    fetchAssignments: () => Promise.resolve(),
    fetchInternalNotes: () => Promise.resolve(),
    addInternalNote: () => Promise.resolve(),
    fetchSmartTemplates: () => Promise.resolve(),
    addSmartTemplate: (templateData: any) => Promise.resolve()
  };
};
