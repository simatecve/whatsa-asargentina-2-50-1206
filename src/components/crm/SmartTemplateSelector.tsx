
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Search } from "lucide-react";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import { ExpertiseArea, SmartTemplate } from "@/types/team";

interface SmartTemplateSelectorProps {
  onSelectTemplate: (template: string) => void;
  contextMessage?: string;
  expertiseArea?: string;
}

export const SmartTemplateSelector = ({ 
  onSelectTemplate, 
  contextMessage = '', 
  expertiseArea = 'general' 
}: SmartTemplateSelectorProps) => {
  const { smartTemplates } = useTeamManagement();
  const [filteredTemplates, setFilteredTemplates] = useState<SmartTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      // Filter templates based on context and expertise
      let filtered = smartTemplates;
      
      if (expertiseArea && expertiseArea !== 'general') {
        filtered = filtered.filter(template => 
          template.expertise_area === expertiseArea || template.expertise_area === 'general'
        );
      }

      if (contextMessage && contextMessage.trim()) {
        const contextWords = contextMessage.toLowerCase().split(' ');
        filtered = filtered.filter(template =>
          template.context_triggers.some(trigger =>
            contextWords.some(word => word.includes(trigger.toLowerCase()))
          )
        );
      }

      setFilteredTemplates(filtered);
    }
  }, [open, smartTemplates, contextMessage, expertiseArea]);

  const searchFilteredTemplates = filteredTemplates.filter(template =>
    template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectTemplate = (template: SmartTemplate) => {
    onSelectTemplate(template.content);
    setOpen(false);
    setSearchTerm('');
  };

  const getExpertiseLabel = (expertise: ExpertiseArea) => {
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          <MessageSquare className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8"
            />
          </div>

          <ScrollArea className="h-64">
            <div className="space-y-2">
              {searchFilteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="cursor-pointer p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{template.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {getExpertiseLabel(template.expertise_area)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {template.content}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">
                      Usado {template.usage_count} veces
                    </span>
                  </div>
                </div>
              ))}
              
              {searchFilteredTemplates.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {searchTerm ? 'No se encontraron templates' : 'No hay templates disponibles'}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
};
