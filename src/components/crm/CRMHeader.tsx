import { MessageSquare } from "lucide-react";
import { InstanceSelector } from "./InstanceSelector";
interface CRMHeaderProps {
  selectedInstanceId: string;
  onInstanceChange: (instanceId: string) => void;
  conversationsCount: number;
  maxConversations?: number;
  isExpired?: boolean;
}
export const CRMHeader = ({
  selectedInstanceId,
  onInstanceChange,
  conversationsCount,
  maxConversations,
  isExpired
}: CRMHeaderProps) => {
  return;
};