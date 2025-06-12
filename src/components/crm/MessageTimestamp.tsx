
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Check, CheckCheck } from "lucide-react";

interface MessageTimestampProps {
  timestamp: string;
  isOutgoing: boolean;
  isRead: boolean | null;
}

export const MessageTimestamp = ({ timestamp, isOutgoing, isRead }: MessageTimestampProps) => {
  return (
    <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${
      isOutgoing ? 'text-green-100' : 'text-gray-500'
    }`}>
      <span>
        {format(new Date(timestamp), 'HH:mm', { locale: es })}
      </span>
      {isOutgoing && (
        <div>
          {isRead ? (
            <CheckCheck className="h-3 w-3" />
          ) : (
            <Check className="h-3 w-3" />
          )}
        </div>
      )}
    </div>
  );
};
