
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Conversation } from "@/types/crm";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ConversationListItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

export const ConversationListItem = ({ 
  conversation, 
  isSelected, 
  onClick 
}: ConversationListItemProps) => {
  console.log('📋 ConversationListItem render:', {
    id: conversation.id,
    name: conversation.nombre_contacto,
    isSelected
  });

  const displayName = conversation.nombre_contacto && 
    conversation.nombre_contacto.trim() && 
    conversation.nombre_contacto !== 'undefined' 
    ? conversation.nombre_contacto 
    : conversation.numero_contacto;

  const timeAgo = conversation.ultimo_mensaje_fecha
    ? formatDistanceToNow(new Date(conversation.ultimo_mensaje_fecha), { 
        addSuffix: true, 
        locale: es 
      })
    : "";

  const handleClick = () => {
    console.log('🖱️ Conversation clicked:', conversation.id);
    onClick();
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors",
        isSelected && "bg-blue-50 border-l-4 border-blue-500"
      )}
      onClick={handleClick}
    >
      <Avatar className="h-12 w-12 shrink-0">
        <AvatarFallback className="bg-gray-200 text-gray-600 text-sm">
          {displayName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 truncate">
            {displayName}
          </h3>
          {timeAgo && (
            <span className="text-xs text-gray-500 shrink-0 ml-2">
              {timeAgo}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-gray-600 truncate">
            {conversation.ultimo_mensaje || "Sin mensajes"}
          </p>
          {conversation.mensajes_no_leidos > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full shrink-0 ml-2">
              {conversation.mensajes_no_leidos}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
