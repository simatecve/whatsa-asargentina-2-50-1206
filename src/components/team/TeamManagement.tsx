
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, Settings, MessageSquare } from "lucide-react";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import { TeamUserDialog } from "./TeamUserDialog";
import { SmartTemplatesManager } from "./SmartTemplatesManager";
import { TeamMember } from "@/types/team";

const TeamManagement = () => {
  const {
    teamMembers,
    loading,
    createTeamUser,
    updateTeamMember,
    removeTeamMember
  } = useTeamManagement();

  const [showAddUser, setShowAddUser] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'agent': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getExpertiseLabel = (expertise: string) => {
    const labels = {
      'conexion': 'Conexión',
      'crm': 'CRM/Mensajería',
      'leads_kanban': 'Leads Kanban',
      'contactos': 'Contactos',
      'campanas': 'Campañas',
      'agente_ia': 'Agente IA',
      'analiticas': 'Analíticas',
      'configuracion': 'Configuración',
      'general': 'General'
    };
    return labels[expertise] || expertise;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Equipos</h2>
          <p className="text-muted-foreground">
            Crea y administra usuarios para tu equipo de trabajo
          </p>
        </div>
        <Button onClick={() => setShowAddUser(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Crear Usuario del Equipo
        </Button>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            Mi Equipo
          </TabsTrigger>
          <TabsTrigger value="templates">
            <MessageSquare className="h-4 w-4 mr-2" />
            Templates Inteligentes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member) => (
              <Card key={member.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {member.team_user?.nombre || 'Sin nombre'}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {member.team_user?.email}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingMember(member)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Badge className={getRoleBadgeColor(member.role)}>
                      {member.role === 'admin' ? 'Administrador' : 
                       member.role === 'agent' ? 'Agente' : 
                       member.role === 'viewer' ? 'Observador' : member.role}
                    </Badge>
                    <Badge className={getStatusBadgeColor(member.status)}>
                      {member.status === 'available' ? 'Disponible' :
                       member.status === 'busy' ? 'Ocupado' : 
                       member.status === 'offline' ? 'Desconectado' : member.status}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Especialidades:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {member.expertise_areas?.map((area, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {getExpertiseLabel(area)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-sm">
                    <p>
                      <span className="font-medium">Conversaciones:</span>{' '}
                      {member.current_conversation_count}/{member.max_concurrent_conversations}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateTeamMember(member.id, {
                        status: member.status === 'available' ? 'offline' : 'available'
                      })}
                    >
                      {member.status === 'available' ? 'Desconectar' : 'Conectar'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeTeamMember(member.id)}
                    >
                      Remover
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {teamMembers.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No tienes usuarios en tu equipo</h3>
                <p className="text-muted-foreground mb-4">
                  Crea usuarios específicos para tu equipo y asigna roles y especialidades
                </p>
                <Button onClick={() => setShowAddUser(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Crear Primer Usuario del Equipo
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates">
          <SmartTemplatesManager />
        </TabsContent>
      </Tabs>

      <TeamUserDialog
        open={showAddUser || !!editingMember}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddUser(false);
            setEditingMember(null);
          }
        }}
        teamUser={editingMember?.team_user}
        onSave={createTeamUser}
      />
    </div>
  );
};

export default TeamManagement;
