
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  
  // When dialog is closed, refresh the list
  useEffect(() => {
    if (!editDialogOpen && !viewContactsDialogOpen) {
      fetchLists();
    }
  }, [editDialogOpen, viewContactsDialogOpen, fetchLists]);
  
  const handleEdit = (list: ContactList) => {
    setSelectedList(list);
    setEditDialogOpen(true);
  };
  
  const handleViewContacts = (list: ContactList) => {
    setSelectedList(list);
    setViewContactsDialogOpen(true);
  };
  
  const handleCloseContactsDialog = () => {
    setViewContactsDialogOpen(false);
    setSelectedList(null);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedList(null);
  };
  
  return (
    <div className="space-y-4">      
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
        <ContactListsEmptyState onCreateNew={onCreateNew} />
      )}
      
      <Dialog open={editDialogOpen} onOpenChange={handleCloseEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedList ? "Editar Lista de Contactos" : "Nueva Lista de Contactos"}
            </DialogTitle>
          </DialogHeader>
          <ContactListForm 
            list={selectedList} 
            onClose={handleCloseEditDialog} 
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
