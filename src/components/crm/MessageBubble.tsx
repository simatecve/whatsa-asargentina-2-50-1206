
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
    <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} px-3 md:px-4 mb-4`}>
      <div
        className={`max-w-[80%] md:max-w-[85%] sm:max-w-xs lg:max-w-md px-4 py-3 rounded-2xl break-words shadow-sm ${
          isOutgoing
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white rounded-br-md'
            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md border border-gray-200 dark:border-gray-600'
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
