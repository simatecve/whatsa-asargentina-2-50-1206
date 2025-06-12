
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
    <div className="flex flex-col h-full">
      <ConversationSearch 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      <ScrollArea className="flex-1">
        {filteredConversations.length === 0 ? (
          searchTerm ? (
            <div className="p-4 text-center text-muted-foreground">
              <p>No se encontraron conversaciones</p>
              <p className="text-sm">Intenta con otros términos de búsqueda</p>
            </div>
          ) : (
            <ConversationListEmpty />
          )
        ) : (
          <div className="p-2 space-y-1">
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
