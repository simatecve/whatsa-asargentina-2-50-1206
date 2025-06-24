
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Lock, Send } from "lucide-react";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface InternalNotesPanelProps {
  conversationId: string;
}

export const InternalNotesPanel = ({ conversationId }: InternalNotesPanelProps) => {
  const { internalNotes, fetchInternalNotes, addInternalNote } = useTeamManagement();
  const [noteContent, setNoteContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (conversationId) {
      fetchInternalNotes(conversationId);
    }
  }, [conversationId, fetchInternalNotes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setLoading(true);
    try {
      await addInternalNote(conversationId, noteContent.trim(), isPrivate);
      setNoteContent('');
      setIsPrivate(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Notas Internas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add note form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Agregar nota interna para el equipo..."
            rows={3}
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Switch
                id="private-note"
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
              />
              <Label htmlFor="private-note" className="text-sm">
                Nota privada
              </Label>
              {isPrivate && <Lock className="h-3 w-3 text-muted-foreground" />}
            </div>
            <Button type="submit" size="sm" disabled={!noteContent.trim() || loading}>
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </form>

        {/* Notes list */}
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {internalNotes.map((note) => (
              <div
                key={note.id}
                className={`border rounded-lg p-3 ${
                  note.is_private ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {note.author_name || 'Usuario'}
                    </span>
                    {note.is_private && (
                      <Badge variant="outline" className="text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        Privada
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(note.created_at), {
                      addSuffix: true,
                      locale: es
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{note.content}</p>
              </div>
            ))}
            
            {internalNotes.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay notas internas</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
