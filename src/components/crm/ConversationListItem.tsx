
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Conversation, Message } from "@/hooks/useCRMData";
import { useMemo, useState, useEffect } from "react";
import { getInstanceColorByName } from "@/utils/instanceColors";

interface ConversationListItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
  messages?: Message[]; // Mensajes para buscar el pushname del contacto
}

export const ConversationListItem = ({ 
  conversation, 
  isSelected, 
  onClick,
  messages = []
}: ConversationListItemProps) => {
  const [instanceColorClasses, setInstanceColorClasses] = useState({
    bg: 'bg-green-50',
    border: 'border-green-400',
    text: 'text-green-800',
    icon: 'text-green-600',
    value: '#10b981'
  });

  // Memoizar el nombre para evitar recálculos innecesarios
  const displayName = useMemo(() => {
    // Buscar el pushname más reciente en los mensajes ENTRANTES (del contacto) de esta conversación
    const conversationMessages = messages.filter(msg => msg.conversation_id === conversation.id);
    const messageWithPushname = conversationMessages
      .filter(msg => msg.direccion === 'recibido') // Solo mensajes del contacto
      .slice()
      .reverse()
      .find(msg => msg.pushname && msg.pushname.trim() && msg.pushname !== 'undefined');
    
    if (messageWithPushname?.pushname) {
      return messageWithPushname.pushname;
    }
    
    // Si no hay pushname en mensajes del contacto, usar el de la conversación
    if (conversation.nombre_contacto && 
        conversation.nombre_contacto.trim() && 
        conversation.nombre_contacto !== 'undefined' &&
        conversation.nombre_contacto !== 'Sin nombre') {
      return conversation.nombre_contacto;
    }
    
    // Como último recurso, usar el número
    return conversation.numero_contacto;
  }, [conversation.id, conversation.nombre_contacto, conversation.numero_contacto, messages]);

  // Memoizar las iniciales del avatar
  const avatarInitials = useMemo(() => {
    return displayName.substring(0, 2).toUpperCase();
  }, [displayName]);

  // Memoizar el tiempo formateado
  const formattedTime = useMemo(() => {
    return conversation.ultimo_mensaje_fecha ? 
      format(new Date(conversation.ultimo_mensaje_fecha), 'HH:mm', { locale: es }) 
      : '';
  }, [conversation.ultimo_mensaje_fecha]);

  // Cargar el color de la instancia
  useEffect(() => {
    const loadInstanceColor = async () => {
      if (conversation.instancia_nombre) {
        const colors = await getInstanceColorByName(conversation.instancia_nombre, []);
        setInstanceColorClasses(colors);
      }
    };
    
    loadInstanceColor();
  }, [conversation.instancia_nombre]);

  return (
    <div
      className={`flex items-center p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${
        isSelected ? "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-r-4 border-green-500 shadow-sm" : ""
      } ${conversation.instancia_nombre ? `border-l-4` : ""}`}
      style={conversation.instancia_nombre ? { borderLeftColor: instanceColorClasses.value } : {}}
      onClick={onClick}
    >
      <Avatar className="h-12 w-12 mr-4 shadow-sm">
        <AvatarFallback className="bg-gradient-to-br from-green-100 to-green-200 text-green-700 text-sm font-semibold">
          {avatarInitials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-sm truncate pr-2 text-gray-900 dark:text-gray-100">
            {displayName}
          </h4>
          <span className="text-xs text-muted-foreground font-medium">
            {formattedTime}
          </span>
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground truncate pr-2 leading-relaxed">
            {conversation.ultimo_mensaje || "Sin mensajes"}
          </p>
          {conversation.mensajes_no_leidos > 0 && (
            <Badge 
              variant="default" 
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xs px-2.5 py-1 rounded-full min-w-[24px] h-6 flex items-center justify-center shadow-sm"
            >
              {conversation.mensajes_no_leidos > 99 ? "99+" : conversation.mensajes_no_leidos}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground truncate">
            {conversation.numero_contacto}
          </p>
          {conversation.instancia_nombre && (
            <Badge 
              className="text-xs px-2.5 py-1 h-6 text-white border-0 shadow-sm"
              style={{ backgroundColor: instanceColorClasses.value }}
            >
              {conversation.instancia_nombre}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
