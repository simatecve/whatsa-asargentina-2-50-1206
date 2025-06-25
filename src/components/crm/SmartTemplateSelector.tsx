
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Search } from "lucide-react";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import { ExpertiseArea } from "@/types/team";

// Partial template interface for contextual templates
interface ContextualTemplate {
  id: string;
  title: string;
  content: string;
  usage_count: number;
  expertise_area?: ExpertiseArea;
}

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
  const { getContextualTemplates } = useTeamManagement();
  const [templates, setTemplates] = useState<ContextualTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open, contextMessage, expertiseArea]);

  const loadTemplates = async () => {
    const contextualTemplates = await getContextualTemplates(contextMessage, expertiseArea as ExpertiseArea);
    setTemplates(contextualTemplates);
  };

  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectTemplate = (template: ContextualTemplate) => {
    onSelectTemplate(template.content);
    setOpen(false);
    setSearchTerm('');
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
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="cursor-pointer p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{template.title}</h4>
                    {template.expertise_area && (
                      <Badge variant="outline" className="text-xs">
                        {template.expertise_area}
                      </Badge>
                    )}
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
              
              {filteredTemplates.length === 0 && (
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
