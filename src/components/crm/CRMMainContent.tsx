
import React from "react";
import { ConversationList } from "./ConversationList";
import { ChatWindow } from "./ChatWindow";
import { InternalNotesPanel } from "./InternalNotesPanel";
import { Conversation, Message } from "@/types/crm";

interface CRMMainContentProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  setSelectedConversation: (conversation: Conversation | null) => void;
  loading: boolean;
  messages: Message[];
  messagesLoading: boolean;
  hasMoreMessages: boolean;
  handleLoadMoreMessages: () => void;
  handleMessageSent: (message: string) => void;
}

export const CRMMainContent = ({
  conversations,
  selectedConversation,
  setSelectedConversation,
  loading,
  messages,
  messagesLoading,
  hasMoreMessages,
  handleLoadMoreMessages,
  handleMessageSent
}: CRMMainContentProps) => {
  console.log('CRMMainContent render:', { 
    conversationsCount: conversations.length,
    selectedConversation: selectedConversation?.id,
    messagesCount: messages.length,
    messagesLoading,
    hasMoreMessages
  });

  return (
    <div className="grid grid-cols-12 gap-4 h-full">
      {/* Conversations List */}
      <div className="col-span-12 lg:col-span-4 xl:col-span-3">
        <ConversationList
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          loading={loading}
        />
      </div>

      {/* Chat Window */}
      <div className="col-span-12 lg:col-span-5 xl:col-span-6">
        <ChatWindow
          selectedConversation={selectedConversation}
          messages={messages}
          messagesLoading={messagesLoading}
          hasMoreMessages={hasMoreMessages}
          onLoadMore={handleLoadMoreMessages}
          onMessageSent={handleMessageSent}
        />
      </div>

      {/* Internal Notes Panel */}
      <div className="col-span-12 lg:col-span-3">
        {selectedConversation && (
          <InternalNotesPanel conversationId={selectedConversation.id} />
        )}
      </div>
    </div>
  );
};

export default CRMMainContent;
