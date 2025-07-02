
import { Phone, Video, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { LeadActions } from "./LeadActions";
import { BotToggleButton } from "./BotToggleButton";
import { Conversation, Message } from "@/hooks/useCRMData";
import { Lead } from "@/types/lead";
import { getInstanceColorByName } from "@/utils/instanceColors";
import { useState, useEffect } from "react";

interface ChatHeaderProps {
  conversation: Conversation;
  messages: Message[];
  conversationLead: Lead | null;
  loadingLead: boolean;
  leadLoading: boolean;
  onUpdateLeadStatus: (leadId: number, newStatus: string) => Promise<boolean>;
  onCreateLead: () => Promise<Lead | null>;
}

export const ChatHeader = ({
  conversation,
  messages,
  conversationLead,
  loadingLead,
  leadLoading,
  onUpdateLeadStatus,
  onCreateLead
}: ChatHeaderProps) => {
  const [instanceColorClasses, setInstanceColorClasses] = useState({
    bg: 'bg-green-50',
    border: 'border-green-400',
    text: 'text-green-800',
    icon: 'text-green-600',
    value: '#10b981'
  });

  // Función para obtener el nombre a mostrar, priorizando pushname SOLO de mensajes del contacto
  const getDisplayName = () => {
    // Buscar el pushname más reciente en los mensajes ENTRANTES (del contacto)
    const messageWithPushname = messages
      .filter(msg => msg.direccion === 'recibido') // Solo mensajes del contacto
      .slice()
      .reverse()
      .find(msg => msg.pushname && msg.pushname.trim() && msg.pushname !== 'undefined');
    
    if (messageWithPushname?.pushname) {
      return messageWithPushname.pushname;
    }
    
    // Si no hay pushname en mensajes del contacto, usar el de la conversación
    if (conversation.nombre_contacto && conversation.nombre_contacto.trim() && conversation.nombre_contacto !== 'undefined') {
      return conversation.nombre_contacto;
    }
    
    // Como último recurso, usar el número
    return conversation.numero_contacto;
  };

  const displayName = getDisplayName();

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
    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 shadow-sm">
      <div className="flex items-center space-x-4">
        <Avatar className="h-12 w-12 shadow-sm">
          <AvatarFallback className="bg-gradient-to-br from-green-100 to-green-200 text-green-700 font-semibold">
            {displayName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
              {displayName}
            </h3>
            {conversation.instancia_nombre && (
              <Badge 
                className="text-xs px-3 py-1 text-white border-0 shadow-sm"
                style={{ backgroundColor: instanceColorClasses.value }}
              >
                {conversation.instancia_nombre}
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {conversation.numero_contacto}
          </p>
          <div className="mt-2">
            <LeadStatusBadge 
              lead={conversationLead} 
              loading={loadingLead}
            />
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <BotToggleButton
          numeroContacto={conversation.numero_contacto}
          instanciaNombre={conversation.instancia_nombre || ''}
        />
        <LeadActions
          lead={conversationLead}
          onUpdateStatus={onUpdateLeadStatus}
          onCreateLead={onCreateLead}
          loading={leadLoading}
        />
        <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full">
          <Phone className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full">
          <Video className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
