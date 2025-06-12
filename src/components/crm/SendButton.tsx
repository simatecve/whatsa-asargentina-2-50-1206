
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SendButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export const SendButton = ({ onClick, disabled }: SendButtonProps) => {
  return (
    <Button 
      onClick={onClick} 
      disabled={disabled}
      size="icon"
      className="shrink-0 mb-2"
    >
      <Send className="h-4 w-4" />
    </Button>
  );
};
