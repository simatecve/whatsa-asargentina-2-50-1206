
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmojiPicker } from "./EmojiPicker";
import { QuickRepliesSelector } from "./QuickRepliesSelector";

interface MessageInputActionsProps {
  onEmojiSelect: (emoji: string) => void;
  onQuickReplySelect: (message: string) => void;
}

export const MessageInputActions = ({ onEmojiSelect, onQuickReplySelect }: MessageInputActionsProps) => {
  return (
    <div className="absolute right-2 bottom-2 flex items-center space-x-1">
      <QuickRepliesSelector onSelectReply={onQuickReplySelect} />
      <EmojiPicker onEmojiSelect={onEmojiSelect} />
      <Button variant="ghost" size="icon" className="h-6 w-6">
        <Mic className="h-3 w-3" />
      </Button>
    </div>
  );
};
