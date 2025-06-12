
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactLists } from "@/components/contacts/ContactLists";
import { ConnectionProvider } from "@/contexts/ConnectionContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { ContactListForm } from "@/components/contacts/ContactListForm";
import { useSubscriptionValidation } from "@/hooks/useSubscriptionValidation";
import { LimitReachedAlert } from "@/components/subscription/LimitReachedAlert";

const Contactos = () => {
  const [activeTab, setActiveTab] = useState("listas");
  const [newListDialogOpen, setNewListDialogOpen] = useState(false);
  const { limits, suscripcionActiva, validateAndBlock, checkLimit, loading, isExpired } = useSubscriptionValidation();
  
  const handleOpenNewListDialog = () => {
    if (validateAndBlock('contactos')) {
      setNewListDialogOpen(true);
    }
  };

  // Show loading only briefly
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isAtContactLimit = limits ? checkLimit('contactos') : false;
  const showSubscriptionAlert = !loading && isExpired;
  
  return (
    <ConnectionProvider>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Contactos</h1>
            <p className="text-muted-foreground">
              Gestiona tus listas de contactos
              {limits && (
                <span className="ml-2 text-sm">
                  ({limits.currentContactos}/{limits.maxContactos} contactos)
                </span>
              )}
              {showSubscriptionAlert && (
                <span className="ml-2 text-sm text-red-600">
                  - Plan vencido, funcionalidad limitada
                </span>
              )}
            </p>
          </div>
          <Button 
            className="flex gap-2 bg-green-500 hover:bg-green-600"
            onClick={handleOpenNewListDialog}
            disabled={isAtContactLimit && !showSubscriptionAlert}
          >
            <Plus className="h-4 w-4" />
            Nueva Lista
          </Button>
        </div>

        {/* Alerta discreta de suscripción vencida */}
        {showSubscriptionAlert && (
          <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm text-red-700">
              ⚠️ Tu plan ha vencido. Algunas funcionalidades pueden estar limitadas.{" "}
              <button 
                onClick={() => window.location.href = "/dashboard/planes"}
                className="text-red-800 underline hover:text-red-900"
              >
                Renovar plan
              </button>
            </div>
          </div>
        )}

        {/* Mostrar alerta si se alcanzó el límite y hay plan activo */}
        {isAtContactLimit && !showSubscriptionAlert && limits && (
          <LimitReachedAlert
            type="contactos"
            current={limits.currentContactos}
            max={limits.maxContactos}
            blocking={true}
          />
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-1">
            <TabsTrigger value="listas">Listas de Contactos</TabsTrigger>
          </TabsList>
          <TabsContent value="listas" className="mt-4">
            <Card>
              <CardContent className="p-4">
                <ContactLists onCreateNew={handleOpenNewListDialog} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={newListDialogOpen} onOpenChange={setNewListDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Lista de Contactos</DialogTitle>
            </DialogHeader>
            <ContactListForm 
              list={null} 
              onClose={() => setNewListDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>
    </ConnectionProvider>
  );
};

export default Contactos;
