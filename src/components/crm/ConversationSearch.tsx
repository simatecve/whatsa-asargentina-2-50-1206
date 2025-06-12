
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ConversationSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const ConversationSearch = ({ searchTerm, onSearchChange }: ConversationSearchProps) => {
  return (
    <div className="relative p-3 border-b bg-white">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar conversaciones..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4 py-2 w-full"
        />
      </div>
    </div>
  );
};
