
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { Message } from "@/hooks/useCRMData";
import { LimitReachedAlert } from "@/components/subscription/LimitReachedAlert";

interface ChatMessagesProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
  isAtMessageLimit?: boolean;
  messageUsage?: { current: number; max: number };
}

export const ChatMessages = ({ 
  messages, 
  messagesEndRef, 
  scrollAreaRef, 
  isAtMessageLimit, 
  messageUsage 
}: ChatMessagesProps) => {
  // Si está en el límite de mensajes, mostrar solo la alerta
  if (isAtMessageLimit && messageUsage) {
    return (
      <div className="h-full p-4 flex flex-col justify-center">
        <LimitReachedAlert 
          type="mensajes" 
          current={messageUsage.current} 
          max={messageUsage.max} 
          blocking={true} 
        />
        <div className="mt-4 text-center text-muted-foreground">
          <p>Has alcanzado el límite de mensajes recibidos de tu plan.</p>
          <p>Los mensajes no están disponibles hasta que actualices tu plan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      <ScrollArea className="h-full" ref={scrollAreaRef}>
        <div className="p-2 sm:p-4 space-y-4 min-h-full">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <p>No hay mensajes en esta conversación</p>
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
