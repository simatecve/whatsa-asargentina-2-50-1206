
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { Message } from "@/hooks/useCRMData";

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
  // Si está en el límite de mensajes, mostrar mensaje informativo simple SIN alerta
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
