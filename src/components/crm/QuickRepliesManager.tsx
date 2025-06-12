
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Save } from "lucide-react";
import { useQuickReplies } from "@/hooks/crm/useQuickReplies";
import { toast } from "sonner";

interface QuickRepliesManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuickRepliesManager = ({ open, onOpenChange }: QuickRepliesManagerProps) => {
  const { quickReplies, loading, createQuickReply, deleteQuickReply } = useQuickReplies();
  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    const titleTrimmed = newTitle.trim();
    const messageTrimmed = newMessage.trim();
    
    if (!titleTrimmed || !messageTrimmed) {
      toast.error('Por favor completa todos los campos');
      return;
    }
    
    if (titleTrimmed.length > 50) {
      toast.error('El título no puede exceder 50 caracteres');
      return;
    }
    
    if (messageTrimmed.length > 500) {
      toast.error('El mensaje no puede exceder 500 caracteres');
      return;
    }
    
    setCreating(true);
    try {
      await createQuickReply(titleTrimmed, messageTrimmed);
      setNewTitle("");
      setNewMessage("");
    } catch (error) {
      // El error ya se maneja en el hook
      console.error('Error al crear respuesta rápida:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta respuesta rápida?')) {
      await deleteQuickReply(id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestionar Respuestas Rápidas</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Crear nueva respuesta */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-medium flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Respuesta Rápida
            </h3>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Saludo, Despedida, Información..."
                  maxLength={50}
                  disabled={creating}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {newTitle.length}/50 caracteres
                </div>
              </div>
              
              <div>
                <Label htmlFor="message">Mensaje</Label>
                <Textarea
                  id="message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe el mensaje de la respuesta rápida..."
                  rows={3}
                  maxLength={500}
                  disabled={creating}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {newMessage.length}/500 caracteres
                </div>
              </div>
              
              <Button
                onClick={handleCreate}
                disabled={!newTitle.trim() || !newMessage.trim() || creating}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {creating ? "Creando..." : "Crear Respuesta Rápida"}
              </Button>
            </div>
          </div>

          {/* Lista de respuestas existentes */}
          <div className="space-y-3">
            <h3 className="font-medium">Respuestas Existentes ({quickReplies.length})</h3>
            
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">
                Cargando respuestas...
              </div>
            ) : quickReplies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg">
                <p className="text-lg mb-2">No tienes respuestas rápidas creadas</p>
                <p className="text-sm">Crea tu primera respuesta usando el formulario de arriba</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {quickReplies.map((reply) => (
                  <div key={reply.id} className="border rounded-lg p-3 space-y-2 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{reply.title}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(reply.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-gray-50 p-2 rounded">
                      {reply.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
