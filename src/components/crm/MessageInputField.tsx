
import { forwardRef } from "react";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  disabled: boolean;
}

export const MessageInputField = forwardRef<HTMLTextAreaElement, MessageInputFieldProps>(
  ({ value, onChange, onKeyPress, disabled }, ref) => {
    return (
      <Textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={onKeyPress}
        placeholder="Escribe un mensaje..."
        className="pr-20 min-h-[40px] max-h-32 resize-none"
        disabled={disabled}
        rows={1}
      />
    );
  }
);

MessageInputField.displayName = "MessageInputField";
