
import { useEffect, useRef, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { Message } from "@/hooks/useCRMData";
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

  // Si está en el límite de mensajes, mostrar mensaje informativo simple SIN alerta
  if (isAtMessageLimit && messageUsage) {
    return (
      <div className="h-full p-8 flex flex-col justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
        <div className="text-center text-muted-foreground max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Límite de mensajes alcanzado</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-2">No puedes enviar más mensajes hasta que actualices tu plan.</p>
          <div className="inline-flex items-center px-4 py-2 bg-red-50 dark:bg-red-900 rounded-lg border border-red-200 dark:border-red-700 mt-4">
            <span className="text-sm font-medium text-red-600 dark:text-red-300">
              {messageUsage.current}/{messageUsage.max} mensajes utilizados
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Handle scroll para cargar más mensajes
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollElement = event.currentTarget;
    const { scrollTop } = scrollElement;
    
    // Si llegamos al top y hay más mensajes, cargar más
    if (scrollTop === 0 && hasMoreMessages && onLoadMore && !loadingMore && !isLoadingMoreRef.current) {
      console.log('Loading more messages...');
      isLoadingMoreRef.current = true;
      previousScrollHeight.current = scrollElement.scrollHeight;
      onLoadMore();
    }
  }, [hasMoreMessages, onLoadMore, loadingMore]);

  // Restaurar posición de scroll después de cargar más mensajes
  useEffect(() => {
    if (loadingMore === false && isLoadingMoreRef.current && scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current;
      const newScrollHeight = scrollElement.scrollHeight;
      const heightDifference = newScrollHeight - previousScrollHeight.current;
      
      // Mantener la posición relativa del scroll
      scrollElement.scrollTop = heightDifference;
      isLoadingMoreRef.current = false;
    }
  }, [loadingMore, scrollAreaRef]);

  return (
    <div className="h-full relative bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <ScrollArea className="h-full" ref={scrollAreaRef} onScroll={handleScroll}>
        <div className="py-6 space-y-2 min-h-full">
          {/* Botón para cargar más mensajes */}
          {hasMoreMessages && (
            <div className="flex justify-center py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onLoadMore}
                disabled={loadingMore}
                className="text-xs shadow-sm hover:shadow-md transition-shadow"
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
            <div className="h-full flex items-center justify-center text-muted-foreground py-20">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="font-medium">No hay mensajes en esta conversación</p>
                <p className="text-sm text-gray-500 mt-1">Los mensajes aparecerán aquí cuando lleguen</p>
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
