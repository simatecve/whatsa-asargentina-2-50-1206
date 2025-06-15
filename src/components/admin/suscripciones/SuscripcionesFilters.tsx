
import React, { useState } from "react";
import { Search, RefreshCw, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SuscripcionesFiltersProps {
  search: string;
  filter: string;
  loading: boolean;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onRefresh: () => void;
}

export const SuscripcionesFilters = ({
  search,
  filter,
  loading,
  onSearchChange,
  onFilterChange,
  onRefresh
}: SuscripcionesFiltersProps) => {
  const [userEmail, setUserEmail] = useState("");

  const handleUserEmailChange = (value: string) => {
    setUserEmail(value);
    // Use the existing search functionality to filter by user email
    onSearchChange(value);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por usuario o plan..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="relative flex-1 max-w-sm">
        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar usuario por email..."
          value={userEmail}
          onChange={(e) => handleUserEmailChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={filter} onValueChange={onFilterChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar por estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todas">Todas</SelectItem>
          <SelectItem value="activa">Activas</SelectItem>
          <SelectItem value="cancelada">Canceladas</SelectItem>
          <SelectItem value="pendiente">Pendientes</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={onRefresh} disabled={loading}>
        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        Actualizar
      </Button>
    </div>
  );
};
