
import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { ConversationList } from "./ConversationList";
import { ChatWindow } from "./ChatWindow";
import { Conversation, Message } from "@/hooks/useCRMData";

interface CRMMainContentProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  messagesLoading?: boolean;
  blockedConversationsCount: number;
  hasBlockedConversations: boolean;
  onSelectConversation: (conversation: Conversation) => void;
  onMessageSent: (message: string) => Promise<void>;
  updateConversationAfterSend?: (conversation: Conversation, message: string) => Promise<void>;
  isAtMessageLimit?: boolean;
  messageUsage?: { current: number; max: number };
}

export const CRMMainContent = ({
  conversations,
  selectedConversation,
  messages,
  loading,
  messagesLoading = false,
  blockedConversationsCount,
  hasBlockedConversations,
  onSelectConversation,
  onMessageSent,
  updateConversationAfterSend,
  isAtMessageLimit,
  messageUsage
}: CRMMainContentProps) => {
  const [showMobileChat, setShowMobileChat] = useState(false);

  const handleSelectConversation = (conversation: Conversation) => {
    onSelectConversation(conversation);
    setShowMobileChat(true);
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
  };

  return (
    <div className="flex-1 flex overflow-hidden h-full">
      {/* Mobile view */}
      <div className="md:hidden w-full h-full">
        {!showMobileChat ? (
          <ConversationList 
            conversations={conversations} 
            selectedConversation={selectedConversation} 
            onSelectConversation={handleSelectConversation} 
            loading={loading}
            messages={messages}
          />
        ) : selectedConversation ? (
          <ChatWindow 
            conversation={selectedConversation} 
            messages={messages} 
            onMessageSent={onMessageSent}
            updateConversationAfterSend={updateConversationAfterSend}
            onBackToList={handleBackToList}
            isAtMessageLimit={isAtMessageLimit}
            messageUsage={messageUsage}
            messagesLoading={messagesLoading}
          />
        ) : null}
      </div>

      {/* Desktop view */}
      <div className="hidden md:flex flex-1 h-full">
        {/* Conversations Sidebar */}
        <div className="w-80 border-r bg-gray-50 flex flex-col h-full overflow-hidden">
          <ConversationList 
            conversations={conversations} 
            selectedConversation={selectedConversation} 
            onSelectConversation={onSelectConversation} 
            loading={loading}
            messages={messages}
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {selectedConversation ? (
            <ChatWindow 
              conversation={selectedConversation} 
              messages={messages} 
              onMessageSent={onMessageSent}
              updateConversationAfterSend={updateConversationAfterSend}
              isAtMessageLimit={isAtMessageLimit}
              messageUsage={messageUsage}
              messagesLoading={messagesLoading}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Seleccione una conversación para comenzar</p>
                {loading && <p className="text-sm mt-2">Cargando conversaciones...</p>}
                {!loading && conversations.length === 0 && !hasBlockedConversations && (
                  <p className="text-sm mt-2">No hay conversaciones disponibles</p>
                )}
                {!loading && conversations.length === 0 && hasBlockedConversations && (
                  <p className="text-sm mt-2 text-orange-600">
                    Todas las conversaciones están bloqueadas por límite del plan
                  </p>
                )}
                {hasBlockedConversations && (
                  <p className="text-sm mt-2 text-orange-600">
                    {blockedConversationsCount} conversaciones bloqueadas por límite del plan
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
