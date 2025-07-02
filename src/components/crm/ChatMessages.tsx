
import { useEffect, useRef, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { Message } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

interface ChatMessagesProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
  isAtMessageLimit?: boolean;
  messageUsage?: { current: number; max: number };
  hasMoreMessages?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
}

export const ChatMessages = ({ 
  messages, 
  messagesEndRef, 
  scrollAreaRef, 
  isAtMessageLimit, 
  messageUsage,
  hasMoreMessages,
  onLoadMore,
  loadingMore = false
}: ChatMessagesProps) => {
  const previousScrollHeight = useRef<number>(0);
  const isLoadingMoreRef = useRef<boolean>(false);

  console.log('💬 ChatMessages render:', { 
    messagesCount: messages.length, 
    hasMoreMessages, 
    loadingMore,
    isAtMessageLimit,
    firstMessage: messages[0]?.mensaje?.substring(0, 30),
    lastMessage: messages[messages.length - 1]?.mensaje?.substring(0, 30)
  });

  // Mostrar mensaje de límite si es necesario
  if (isAtMessageLimit && messageUsage) {
    return (
      <div className="h-full p-4 flex flex-col justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium mb-2">Límite de mensajes alcanzado</p>
          <p>No puedes enviar más mensajes hasta que actualices tu plan.</p>
          <p className="text-sm mt-2">({messageUsage.current}/{messageUsage.max} mensajes recibidos)</p>
        </div>
      </div>
    );
  }

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollElement = event.currentTarget;
    const { scrollTop } = scrollElement;
    
    if (scrollTop === 0 && hasMoreMessages && onLoadMore && !loadingMore && !isLoadingMoreRef.current) {
      console.log('⬆️ Loading more messages...');
      isLoadingMoreRef.current = true;
      previousScrollHeight.current = scrollElement.scrollHeight;
      onLoadMore();
    }
  }, [hasMoreMessages, onLoadMore, loadingMore]);

  useEffect(() => {
    if (loadingMore === false && isLoadingMoreRef.current && scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current;
      const newScrollHeight = scrollElement.scrollHeight;
      const heightDifference = newScrollHeight - previousScrollHeight.current;
      
      scrollElement.scrollTop = heightDifference;
      isLoadingMoreRef.current = false;
    }
  }, [loadingMore, scrollAreaRef]);

  return (
    <div className="h-full relative">
      <ScrollArea className="h-full" ref={scrollAreaRef} onScroll={handleScroll}>
        <div className="p-2 sm:p-4 space-y-4 min-h-full">
          {hasMoreMessages && (
            <div className="flex justify-center py-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onLoadMore}
                disabled={loadingMore}
                className="text-xs"
              >
                {loadingMore ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2"></div>
                    Cargando...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    Cargar mensajes anteriores
                  </div>
                )}
              </Button>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium mb-2">No hay mensajes</p>
                <p className="text-sm">Esta conversación no tiene mensajes aún</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
