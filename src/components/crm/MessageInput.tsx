
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Conversation } from "@/types/crm";
import { useConversationLimits } from "@/hooks/useConversationLimits";
import { ConversationBlockedAlert } from "./ConversationBlockedAlert";
import { MessageInputField } from "./MessageInputField";
import { MessageInputActions } from "./MessageInputActions";
import { SendButton } from "./SendButton";
import { useMessageSender } from "@/hooks/crm/useMessageSender";

interface MessageInputProps {
  conversation: Conversation;
  onMessageSent?: (message: string) => void;
  updateConversationAfterSend?: (conversation: Conversation, message: string) => Promise<void>;
}

export const MessageInput = ({ 
  conversation, 
  onMessageSent,
  updateConversationAfterSend 
}: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isConversationBlocked } = useConversationLimits();
  const { sendMessage, sending } = useMessageSender({ 
    conversation, 
    onMessageSent,
    updateConversationAfterSend 
  });

  const isBlocked = isConversationBlocked(conversation.id);

  const focusTextarea = () => {
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  };

  const handleEmojiSelect = (emoji: string) => {
    if (isBlocked) return;
    setMessage(prev => prev + emoji);
    focusTextarea();
  };

  const handleQuickReplySelect = (quickReplyMessage: string) => {
    if (isBlocked) return;
    setMessage(quickReplyMessage);
    focusTextarea();
  };

  const handleSendMessage = async () => {
    if (!message.trim() || sending || isBlocked) return;

    const messageText = message.trim();
    
    try {
      // Limpiar el input inmediatamente para mejor UX
      setMessage("");
      
      await sendMessage(messageText);
      
      // Enfocar el textarea después de enviar el mensaje
      focusTextarea();
    } catch (error) {
      // Restaurar el mensaje en caso de error
      setMessage(messageText);
      
      // Enfocar el textarea incluso si hay error
      focusTextarea();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isBlocked) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isBlocked) {
    return <ConversationBlockedAlert />;
  }

  return (
    <div className="flex items-end space-x-2">
      {/* Desktop attachment button - hidden on mobile */}
      <Button variant="ghost" size="icon" className="shrink-0 mb-2 hidden md:flex">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      </Button>
      
      <div className="flex-1 relative">
        <MessageInputField
          ref={textareaRef}
          value={message}
          onChange={setMessage}
          onKeyPress={handleKeyPress}
          disabled={sending}
        />
        <MessageInputActions
          onEmojiSelect={handleEmojiSelect}
          onQuickReplySelect={handleQuickReplySelect}
        />
      </div>

      <SendButton 
        onClick={handleSendMessage}
        disabled={!message.trim() || sending}
      />
    </div>
  );
};
