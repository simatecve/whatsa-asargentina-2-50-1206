
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { ContactList } from "@/types/contact";
import { ContactListForm } from "./ContactListForm";
import { ContactListDetails } from "./ContactListDetails";
import { ContactListsLoading } from "./ContactListsLoading";
import { ContactListsEmptyState } from "./ContactListsEmptyState";
import { ContactListsTable } from "./ContactListsTable";
import { useContactLists } from "@/hooks/useContactLists";

type ContactListsProps = {
  onCreateNew: () => void;
};

export const ContactLists = ({ onCreateNew }: ContactListsProps) => {
  const { lists, loading, fetchLists, handleDelete } = useContactLists();
  const [selectedList, setSelectedList] = useState<ContactList | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewContactsDialogOpen, setViewContactsDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // When dialog is closed, refresh the list
  useEffect(() => {
    if (!editDialogOpen && !viewContactsDialogOpen && !createDialogOpen) {
      fetchLists();
    }
  }, [editDialogOpen, viewContactsDialogOpen, createDialogOpen, fetchLists]);
  
  const handleEdit = (list: ContactList) => {
    setSelectedList(list);
    setEditDialogOpen(true);
  };
  
  const handleViewContacts = (list: ContactList) => {
    setSelectedList(list);
    setViewContactsDialogOpen(true);
  };
  
  const handleCreateNew = () => {
    setSelectedList(null);
    setCreateDialogOpen(true);
  };
  
  const handleCloseContactsDialog = () => {
    setViewContactsDialogOpen(false);
    setSelectedList(null);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedList(null);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    setSelectedList(null);
  };
  
  return (
    <div className="space-y-4">
      {/* Botón para crear nueva lista */}
      <div className="flex justify-end">
        <Button
          onClick={handleCreateNew}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg rounded-xl border-0 transition-all duration-200 hover:shadow-xl hover:scale-105"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Lista
        </Button>
      </div>
      
      {loading ? (
        <ContactListsLoading />
      ) : lists.length > 0 ? (
        <ContactListsTable 
          lists={lists} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
          onViewContacts={handleViewContacts} 
        />
      ) : (
        <ContactListsEmptyState onCreateNew={handleCreateNew} />
      )}
      
      <Dialog open={editDialogOpen} onOpenChange={handleCloseEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Lista de Contactos</DialogTitle>
          </DialogHeader>
          <ContactListForm 
            list={selectedList} 
            onClose={handleCloseEditDialog} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={createDialogOpen} onOpenChange={handleCloseCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Lista de Contactos</DialogTitle>
          </DialogHeader>
          <ContactListForm 
            list={null} 
            onClose={handleCloseCreateDialog} 
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={viewContactsDialogOpen} onOpenChange={handleCloseContactsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedList?.name} - Contactos
            </DialogTitle>
          </DialogHeader>
          {selectedList && (
            <ContactListDetails listId={selectedList.id} listName={selectedList.name} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
