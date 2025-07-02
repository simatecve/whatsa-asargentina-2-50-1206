
import { useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import MessageInput from "./MessageInput";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { BotToggleButton } from "./BotToggleButton";
import { useChatWindowState } from "@/hooks/crm/useChatWindowState";
import { Conversation, Message } from "@/types/crm";

interface ChatWindowProps {
  selectedConversation: Conversation | null;
  messages?: Message[];
  loading?: boolean;
  messagesLoading?: boolean;
  hasMoreMessages?: boolean;
  onLoadMore?: () => void;
  onMessageSent?: (message: string) => void;
}

export const ChatWindow = ({
  selectedConversation,
  messages = [],
  loading = false,
  messagesLoading = false,
  hasMoreMessages = false,
  onLoadMore,
  onMessageSent
}: ChatWindowProps) => {
  console.log('ChatWindow render:', { 
    selectedConversation: selectedConversation?.id, 
    messagesCount: messages.length,
    loading,
    messagesLoading 
  });

  if (!selectedConversation) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p>Selecciona una conversación para comenzar</p>
      </div>
    );
  }

  const {
    conversationLead,
    loadingLead,
    leadLoading,
    messagesEndRef,
    scrollAreaRef,
    scrollToBottom,
    handleCreateLead,
    handleUpdateLeadStatus
  } = useChatWindowState(selectedConversation, messages);

  const handleMessageSent = useCallback((message: string) => {
    console.log('Message sent in ChatWindow:', message);
    if (onMessageSent) {
      onMessageSent(message);
    }
    // Scroll to bottom after sending message
    setTimeout(() => scrollToBottom(), 100);
  }, [onMessageSent, scrollToBottom]);

  // Función para obtener el nombre a mostrar, priorizando pushname SOLO de mensajes del contacto
  const getDisplayName = () => {
    // Si no hay pushname en mensajes del contacto, usar el de la conversación
    if (selectedConversation.nombre_contacto && selectedConversation.nombre_contacto.trim() && selectedConversation.nombre_contacto !== 'undefined') {
      return selectedConversation.nombre_contacto;
    }

    // Como último recurso, usar el número
    return selectedConversation.numero_contacto;
  };

  const displayName = getDisplayName();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Mobile header - contact info and back button only */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4" style={{ backgroundColor: '#152763' }}>
        <div className="flex items-center flex-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/10 mr-3 shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-white text-base mb-1 truncate">
              {displayName}
            </h3>
            <p className="text-sm text-white/80 truncate">
              {selectedConversation.numero_contacto}
            </p>
          </div>
        </div>
        <div className="shrink-0 ml-4">
          <BotToggleButton 
            numeroContacto={selectedConversation.numero_contacto} 
            instanciaNombre={selectedConversation.instancia_nombre || ''} 
          />
        </div>
      </div>

      {/* Desktop header - hidden on mobile */}
      <div className="hidden md:block shrink-0">
        <ChatHeader 
          conversation={selectedConversation} 
          messages={messages} 
          conversationLead={conversationLead} 
          loadingLead={loadingLead} 
          leadLoading={leadLoading} 
          onUpdateLeadStatus={handleUpdateLeadStatus} 
          onCreateLead={handleCreateLead} 
        />
      </div>

      {/* Messages area - this should take the remaining space */}
      <div className="flex-1 min-h-0 pt-20 md:pt-0 overflow-hidden py-[6px]">
        <ChatMessages 
          messages={messages} 
          messagesEndRef={messagesEndRef} 
          scrollAreaRef={scrollAreaRef} 
          hasMoreMessages={hasMoreMessages}
          onLoadMore={onLoadMore}
          loadingMore={messagesLoading}
        />
      </div>

      {/* Message input - fixed at bottom */}
      <div className="border-t bg-white p-3 md:p-4 shrink-0">
        <MessageInput 
          selectedConversation={selectedConversation} 
          onSendMessage={handleMessageSent}
        />
      </div>
    </div>
  );
};
