
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, MessageSquare, Copy } from "lucide-react";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import { ExpertiseArea } from "@/types/team";
import { toast } from "sonner";

const EXPERTISE_OPTIONS: { value: ExpertiseArea; label: string }[] = [
  { value: 'conexion', label: 'Conexión' },
  { value: 'crm', label: 'CRM/Mensajería' },
  { value: 'leads_kanban', label: 'Leads Kanban' },
  { value: 'contactos', label: 'Contactos' },
  { value: 'campanas', label: 'Campañas' },
  { value: 'agente_ia', label: 'Agente IA' },
  { value: 'analiticas', label: 'Analíticas' },
  { value: 'configuracion', label: 'Configuración' },
  { value: 'general', label: 'General' },
];

export const SmartTemplatesManager = () => {
  const { smartTemplates, addSmartTemplate } = useTeamManagement();
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    context_triggers: '',
    expertise_area: 'general' as ExpertiseArea
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const triggers = formData.context_triggers
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    await addSmartTemplate({
      title: formData.title,
      content: formData.content,
      context_triggers: triggers,
      expertise_area: formData.expertise_area
    });

    setFormData({
      title: '',
      content: '',
      context_triggers: '',
      expertise_area: 'general'
    });
    setShowAddTemplate(false);
  };

  const copyTemplate = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Template copiado al portapapeles');
  };

  const getExpertiseLabel = (expertise: ExpertiseArea) => {
    const option = EXPERTISE_OPTIONS.find(opt => opt.value === expertise);
    return option?.label || expertise;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Templates Inteligentes</h3>
          <p className="text-sm text-muted-foreground">
            Respuestas predefinidas que se adaptan al contexto
          </p>
        </div>
        <Dialog open={showAddTemplate} onOpenChange={setShowAddTemplate}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Crear Template Inteligente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Saludo de bienvenida"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenido del Template</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="¡Hola! Gracias por contactarnos. ¿En qué podemos ayudarte hoy?"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="triggers">Palabras Clave (separadas por comas)</Label>
                <Input
                  id="triggers"
                  value={formData.context_triggers}
                  onChange={(e) => setFormData(prev => ({ ...prev, context_triggers: e.target.value }))}
                  placeholder="hola, saludo, bienvenida"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expertise">Área de Especialidad</Label>
                <Select 
                  value={formData.expertise_area} 
                  onValueChange={(value: ExpertiseArea) => setFormData(prev => ({ ...prev, expertise_area: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERTISE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddTemplate(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Crear Template</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {smartTemplates.map((template) => (
          <Card key={template.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">{template.title}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyTemplate(template.content)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {template.content}
              </p>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {getExpertiseLabel(template.expertise_area)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Usado {template.usage_count} veces
                </span>
              </div>

              {template.context_triggers.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-1">Palabras clave:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.context_triggers.map((trigger, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {trigger}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {smartTemplates.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay templates</h3>
            <p className="text-muted-foreground mb-4">
              Crea templates inteligentes para responder más rápido
            </p>
            <Button onClick={() => setShowAddTemplate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
