
import { Message } from "@/hooks/useCRMData";
import { MessageContent } from "./MessageContent";
import { MessageTimestamp } from "./MessageTimestamp";

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isOutgoing = message.direccion === 'enviado';
  const isRead = message.estado_lectura;

  return (
    <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} px-3 md:px-2`}>
      <div
        className={`max-w-[80%] md:max-w-[85%] sm:max-w-xs lg:max-w-md px-3 md:px-4 py-2 rounded-lg break-words ${
          isOutgoing
            ? 'bg-green-500 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-900 rounded-bl-none'
        }`}
      >
        <MessageContent message={message} />
        
        <MessageTimestamp 
          timestamp={message.created_at}
          isOutgoing={isOutgoing}
          isRead={isRead}
        />
      </div>
    </div>
  );
};
