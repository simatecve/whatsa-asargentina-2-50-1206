
import { useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageInput } from "./MessageInput";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { BotToggleButton } from "./BotToggleButton";
import { useChatWindowState } from "@/hooks/crm/useChatWindowState";
import { Conversation, Message } from "@/hooks/useCRMData";

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  onMessageSent?: (message: string) => void;
  updateConversationAfterSend?: (conversation: Conversation, message: string) => Promise<void>;
  onBackToList?: () => void;
  isAtMessageLimit?: boolean;
  messageUsage?: {
    current: number;
    max: number;
  };
  messagesLoading?: boolean;
  hasMoreMessages?: boolean;
  onLoadMoreMessages?: () => void;
}

export const ChatWindow = ({
  conversation,
  messages,
  onMessageSent,
  updateConversationAfterSend,
  onBackToList,
  isAtMessageLimit,
  messageUsage,
  messagesLoading = false,
  hasMoreMessages = false,
  onLoadMoreMessages
}: ChatWindowProps) => {
  const {
    conversationLead,
    loadingLead,
    leadLoading,
    messagesEndRef,
    scrollAreaRef,
    scrollToBottom,
    handleCreateLead,
    handleUpdateLeadStatus
  } = useChatWindowState(conversation, messages);

  const handleMessageSent = useCallback((message: string) => {
    if (onMessageSent) {
      onMessageSent(message);
    }
    // Scroll to bottom after sending message
    setTimeout(() => scrollToBottom(), 100);
  }, [onMessageSent, scrollToBottom]);

  // Función para obtener el nombre a mostrar, priorizando pushname SOLO de mensajes del contacto
  const getDisplayName = () => {
    // Buscar el pushname más reciente en los mensajes ENTRANTES (del contacto)
    const messageWithPushname = messages.filter(msg => msg.direccion === 'recibido') // Solo mensajes del contacto
      .slice().reverse().find(msg => msg.pushname && msg.pushname.trim() && msg.pushname !== 'undefined');
    
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

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-gray-800">
      {/* Mobile header - contact info and back button only */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="flex items-center flex-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBackToList} 
            className="text-white hover:bg-white/10 mr-3 shrink-0 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-base mb-1 truncate">
              {displayName}
            </h3>
            <p className="text-sm text-white/80 truncate">
              {conversation.numero_contacto}
            </p>
          </div>
        </div>
        <div className="shrink-0 ml-4">
          <BotToggleButton 
            numeroContacto={conversation.numero_contacto} 
            instanciaNombre={conversation.instancia_nombre || ''} 
          />
        </div>
      </div>

      {/* Desktop header - hidden on mobile */}
      <div className="hidden md:block shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <ChatHeader 
          conversation={conversation} 
          messages={messages} 
          conversationLead={conversationLead} 
          loadingLead={loadingLead} 
          leadLoading={leadLoading} 
          onUpdateLeadStatus={handleUpdateLeadStatus} 
          onCreateLead={handleCreateLead} 
        />
      </div>

      {/* Messages area - this should take the remaining space */}
      <div className="flex-1 min-h-0 pt-20 md:pt-0 overflow-hidden bg-gray-50 dark:bg-gray-900">
        {messagesLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground font-medium">Cargando mensajes...</p>
            </div>
          </div>
        ) : (
          <ChatMessages 
            messages={messages} 
            messagesEndRef={messagesEndRef} 
            scrollAreaRef={scrollAreaRef} 
            isAtMessageLimit={isAtMessageLimit}
            messageUsage={messageUsage}
            hasMoreMessages={hasMoreMessages}
            onLoadMore={onLoadMoreMessages}
            loadingMore={messagesLoading}
          />
        )}
      </div>

      {/* Message input - fixed at bottom - BLOQUEADO si está en límite de mensajes */}
      {!isAtMessageLimit && (
        <div className="shrink-0">
          <MessageInput 
            conversation={conversation} 
            onMessageSent={handleMessageSent} 
            updateConversationAfterSend={updateConversationAfterSend} 
          />
        </div>
      )}
    </div>
  );
};
