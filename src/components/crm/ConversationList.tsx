
import { useEffect, useMemo, useCallback, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Conversation, Message } from "@/hooks/useCRMData";
import { useConversationLimits } from "@/hooks/useConversationLimits";
import { ConversationListItem } from "./ConversationListItem";
import { ConversationListSkeleton } from "./ConversationListSkeleton";
import { ConversationListEmpty } from "./ConversationListEmpty";
import { ConversationSearch } from "./ConversationSearch";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  loading: boolean;
  messages?: Message[];
}

export const ConversationList = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  loading,
  messages = []
}: ConversationListProps) => {
  const { isConversationBlocked } = useConversationLimits();
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar conversaciones basado en el término de búsqueda
  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) {
      return conversations;
    }

    const term = searchTerm.toLowerCase().trim();
    
    return conversations.filter(conversation => {
      // Buscar por número de contacto
      if (conversation.numero_contacto?.toLowerCase().includes(term)) {
        return true;
      }

      // Buscar por nombre de contacto
      if (conversation.nombre_contacto?.toLowerCase().includes(term)) {
        return true;
      }

      // Buscar por pushname en los mensajes de esta conversación
      const conversationMessages = messages.filter(msg => msg.conversation_id === conversation.id);
      const hasMatchingPushname = conversationMessages.some(msg => 
        msg.pushname?.toLowerCase().includes(term)
      );

      return hasMatchingPushname;
    });
  }, [conversations, messages, searchTerm]);

  const handleConversationClick = useCallback((conversation: Conversation) => {
    if (isConversationBlocked(conversation.id)) {
      return;
    }
    onSelectConversation(conversation);
  }, [isConversationBlocked, onSelectConversation]);

  if (loading) {
    return <ConversationListSkeleton />;
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
        <ConversationSearch 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>
      
      <ScrollArea className="flex-1">
        {filteredConversations.length === 0 ? (
          searchTerm ? (
            <div className="p-6 text-center text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="font-medium">No se encontraron conversaciones</p>
              <p className="text-sm mt-1">Intenta con otros términos de búsqueda</p>
            </div>
          ) : (
            <ConversationListEmpty />
          )
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((conversation) => {
              const isSelected = selectedConversation?.id === conversation.id;

              return (
                <ConversationListItem
                  key={conversation.id}
                  conversation={conversation}
                  isSelected={isSelected}
                  onClick={() => handleConversationClick(conversation)}
                  messages={messages}
                />
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
