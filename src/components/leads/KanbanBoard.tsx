
import { useState, useEffect, useMemo } from "react";
import KanbanColumn from "./KanbanColumn";
import KanbanColumnManager from "./KanbanColumnManager";
import { LeadSearch } from "./LeadSearch";
import { Lead } from "@/types/lead";
import { KanbanColumn as KanbanColumnType } from "@/types/kanban";
import { useKanbanColumns } from "@/hooks/useKanbanColumns";
import { supabase } from "@/integrations/supabase/client";

interface KanbanBoardProps {
  leads: Lead[];
  onUpdateStatus: (leadId: number, newStatus: string) => Promise<boolean>;
  onLeadClick?: (lead: Lead) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ leads, onUpdateStatus, onLeadClick }) => {
  const [draggingLead, setDraggingLead] = useState<Lead | null>(null);
  const [localLeads, setLocalLeads] = useState<Lead[]>(leads);
  const [searchTerm, setSearchTerm] = useState("");
  const { columns, loading, refreshColumns } = useKanbanColumns();

  // Sync local leads with props whenever they change
  useEffect(() => {
    setLocalLeads(leads);
  }, [leads]);

  // Filter leads based on search term
  const filteredLeads = useMemo(() => {
    if (!searchTerm.trim()) {
      return localLeads;
    }

    const term = searchTerm.toLowerCase();
    return localLeads.filter(lead => {
      const name = (lead.pushname || "").toLowerCase();
      const number = (lead.numero || "").replace(/@s\.whatsapp\.net$/, "").toLowerCase();
      const instance = (lead.instancia || "").toLowerCase();
      
      return name.includes(term) || number.includes(term) || instance.includes(term);
    });
  }, [localLeads, searchTerm]);

  // Group filtered leads by status using dynamic columns
  const leadsByStatus = columns.reduce((acc, column) => {
    acc[column.status_key] = filteredLeads.filter(lead => lead.status === column.status_key);
    return acc;
  }, {} as Record<string, Lead[]>);

  // Handle drag start
  const handleDragStart = (lead: Lead) => {
    setDraggingLead(lead);
  };

  // Handle drop in a column
  const handleDrop = async (status: string) => {
    if (draggingLead && draggingLead.status !== status) {
      // Optimistically update local state immediately for better UX
      const updatedLeads = localLeads.map(lead => 
        lead.id === draggingLead.id ? { ...lead, status } : lead
      );
      setLocalLeads(updatedLeads);
      
      // Update the server
      const success = await onUpdateStatus(draggingLead.id, status);
      
      // If the update fails, revert the local state
      if (!success) {
        console.error("Failed to update lead status, reverting local state");
        setLocalLeads(localLeads); // Revert to previous state
      }
    }
    setDraggingLead(null);
  };

  // Handle creating contact list from leads
  const handleCreateContactList = async (status: string, leads: Lead[]) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error("No hay sesión activa");
        return;
      }

      // Find the column info for the status
      const column = columns.find(col => col.status_key === status);
      const columnTitle = column?.title || status;

      // Filter leads with valid phone numbers
      const validLeads = leads.filter(lead => lead.numero && lead.pushname);
      
      if (validLeads.length === 0) {
        console.error("No hay leads válidos con número de teléfono en esta columna");
        return;
      }

      // Create the contact list
      const listName = `Leads ${columnTitle} - ${new Date().toLocaleDateString()}`;
      const { data: newList, error: listError } = await supabase
        .from("contact_lists")
        .insert({
          name: listName,
          description: `Lista creada automáticamente desde el kanban de leads con estado: ${columnTitle}`,
          user_id: session.user.id
        })
        .select()
        .single();

      if (listError) throw listError;

      // Prepare contacts data
      const contactsData = validLeads.map(lead => ({
        name: lead.pushname || "Sin nombre",
        phone_number: lead.numero?.replace(/@s\.whatsapp\.net$/, '') || "",
        list_id: newList.id,
        user_id: session.user.id
      }));

      // Insert contacts
      const { error: contactsError } = await supabase
        .from("contacts")
        .insert(contactsData);

      if (contactsError) throw contactsError;

      console.log(`Lista de contactos creada: "${listName}" con ${validLeads.length} contactos`);

    } catch (error) {
      console.error("Error creating contact list:", error);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-500">Cargando columnas del kanban...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-x-auto">
      {/* Header with search, title and column manager */}
      <div className="flex flex-col space-y-4 mb-4 px-2">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Kanban de Leads</h2>
          <KanbanColumnManager onColumnsChange={refreshColumns} />
        </div>
        
        {/* Search component */}
        <LeadSearch onSearch={handleSearch} />
        
        {/* Search results summary */}
        {searchTerm && (
          <div className="text-sm text-gray-600">
            Mostrando {filteredLeads.length} de {localLeads.length} leads que coinciden con "{searchTerm}"
          </div>
        )}
      </div>

      <div className="flex h-full space-x-4 pb-4 min-w-max">
        {columns.map((column) => (
          <KanbanColumn
            key={column.status_key}
            status={column.status_key}
            title={column.title}
            leads={leadsByStatus[column.status_key] || []}
            onDragStart={handleDragStart}
            onDrop={() => handleDrop(column.status_key)}
            onCreateContactList={handleCreateContactList}
            onLeadClick={onLeadClick}
            colorClass={column.color_class}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
