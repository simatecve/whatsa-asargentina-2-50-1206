
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MessageSquare, Settings, RefreshCw } from "lucide-react";
import { useQuickReplies } from "@/hooks/crm/useQuickReplies";
import { QuickRepliesManager } from "./QuickRepliesManager";

interface QuickRepliesSelectorProps {
  onSelectReply: (message: string) => void;
}

export const QuickRepliesSelector = ({ onSelectReply }: QuickRepliesSelectorProps) => {
  const { quickReplies, loading, fetchQuickReplies } = useQuickReplies();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);

  const handleSelectReply = (message: string) => {
    onSelectReply(message);
    setPopoverOpen(false);
  };

  const handleRefresh = () => {
    fetchQuickReplies();
  };

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <MessageSquare className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" side="top" align="end">
          <div className="border-b p-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Respuestas Rápidas</h4>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setManagerOpen(true)}
                  className="h-8 px-2"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
                Cargando respuestas...
              </div>
            ) : quickReplies.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground space-y-2">
                <p>No hay respuestas rápidas</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setManagerOpen(true);
                    setPopoverOpen(false);
                  }}
                >
                  Crear primera respuesta
                </Button>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {quickReplies.map((reply) => (
                  <button
                    key={reply.id}
                    onClick={() => handleSelectReply(reply.message)}
                    className="w-full text-left p-2 rounded hover:bg-gray-100 transition-colors"
                  >
                    <div className="font-medium text-sm">{reply.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {reply.message}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <QuickRepliesManager
        open={managerOpen}
        onOpenChange={setManagerOpen}
      />
    </>
  );
};
