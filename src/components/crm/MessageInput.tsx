
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Conversation } from "@/types/crm";
import { useQuickReplies } from "@/hooks/crm/useQuickReplies";
import { MessageInputActions } from "./MessageInputActions";
import { MessageInputField } from "./MessageInputField";
import { QuickRepliesSelector } from "./QuickRepliesSelector";
import { SmartTemplateSelector } from "./SmartTemplateSelector";
import { CollaborationIndicator } from "./CollaborationIndicator";
import { useConversationCollaboration } from "@/hooks/useConversationCollaboration";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  selectedConversation: Conversation | null;
  disabled?: boolean;
}

const MessageInput = ({ onSendMessage, selectedConversation, disabled }: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { quickReplies } = useQuickReplies();
  
  const { updateTypingStatus } = useConversationCollaboration(
    selectedConversation?.id || ''
  );

  // Handle typing indicator
  useEffect(() => {
    if (!selectedConversation) return;

    const timeoutId = setTimeout(() => {
      if (isTyping) {
        updateTypingStatus(false);
        setIsTyping(false);
      }
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [message, isTyping, selectedConversation, updateTypingStatus]);

  const handleInputChange = (value: string) => {
    setMessage(value);
    
    if (!isTyping && value.trim()) {
      setIsTyping(true);
      updateTypingStatus(true);
    } else if (isTyping && !value.trim()) {
      setIsTyping(false);
      updateTypingStatus(false);
    }
  };

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
      setIsTyping(false);
      updateTypingStatus(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickReply = (quickReply: string) => {
    setMessage(quickReply);
    textareaRef.current?.focus();
  };

  const handleTemplateSelect = (template: string) => {
    setMessage(template);
    textareaRef.current?.focus();
  };

  if (!selectedConversation) {
    return null;
  }

  return (
    <Card className="p-4 space-y-3">
      {/* Collaboration indicator */}
      <CollaborationIndicator conversationId={selectedConversation.id} />
      
      {/* Quick replies */}
      {quickReplies.length > 0 && (
        <QuickRepliesSelector 
          quickReplies={quickReplies}
          onSelectReply={handleQuickReply}
        />
      )}

      {/* Message input */}
      <div className="flex gap-2">
        <div className="flex-1 space-y-2">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            className="min-h-[80px] resize-none"
            disabled={disabled}
          />
        </div>
        
        <div className="flex flex-col gap-2">
          {/* Smart template selector */}
          <SmartTemplateSelector
            onSelectTemplate={handleTemplateSelect}
            contextMessage={message}
            expertiseArea="general"
          />
          
          {/* Message actions */}
          <MessageInputActions />
          
          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MessageInput;
