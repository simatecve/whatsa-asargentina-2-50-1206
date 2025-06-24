
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Eye } from "lucide-react";
import { useConversationCollaboration } from "@/hooks/useConversationCollaboration";

interface CollaborationIndicatorProps {
  conversationId: string;
}

export const CollaborationIndicator = ({ conversationId }: CollaborationIndicatorProps) => {
  const { collaborators, typingUsers } = useConversationCollaboration(conversationId);

  if (collaborators.length === 0 && typingUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
      {collaborators.length > 0 && (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <div className="flex -space-x-2">
            {collaborators.slice(0, 3).map((collab) => (
              <Avatar key={collab.id} className="h-6 w-6 border-2 border-white">
                <AvatarFallback className="text-xs">
                  {collab.user_name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          {collaborators.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{collaborators.length - 3}
            </Badge>
          )}
        </div>
      )}

      {typingUsers.length > 0 && (
        <div className="flex items-center gap-1">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce" />
            <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
          <span className="text-xs text-muted-foreground">
            {typingUsers.length === 1 
              ? `${typingUsers[0]} está escribiendo...`
              : `${typingUsers.length} personas están escribiendo...`
            }
          </span>
        </div>
      )}
    </div>
  );
};
