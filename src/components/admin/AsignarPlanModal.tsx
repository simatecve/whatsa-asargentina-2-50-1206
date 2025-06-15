
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Plan {
  id: string;
  nombre: string;
  precio: number;
  max_instancias: number;
  max_contactos: number;
  max_campanas: number;
  max_conversaciones: number;
  max_mensajes: number;
  periodo: string;
}

interface Usuario {
  user_id: string;
  nombre: string;
  email: string;
}

interface AsignarPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AsignarPlanModal = ({ open, onOpenChange, onSuccess }: AsignarPlanModalProps) => {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchPlanes();
      fetchUsuarios();
    }
  }, [open]);

  useEffect(() => {
    // Filter users based on search input
    if (userSearch.trim() === "") {
      setFilteredUsuarios(usuarios);
    } else {
      const filtered = usuarios.filter(usuario => 
        usuario.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        usuario.nombre.toLowerCase().includes(userSearch.toLowerCase())
      );
      setFilteredUsuarios(filtered);
    }
  }, [userSearch, usuarios]);

  const fetchPlanes = async () => {
    try {
      const { data, error } = await supabase
        .from("planes")
        .select("*")
        .eq("estado", true)
        .order("precio");

      if (error) throw error;
      setPlanes(data || []);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Error al cargar los planes");
    }
  };

  const fetchUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("user_id, nombre, email")
        .eq("perfil", "usuario")
        .order("nombre");

      if (error) throw error;
      setUsuarios(data || []);
      setFilteredUsuarios(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error al cargar los usuarios");
    }
  };

  const handleAsignar = async () => {
    if (!selectedPlanId || !selectedUserId) {
      toast.error("Por favor seleccione un usuario y un plan");
      return;
    }

    setLoading(true);
    try {
      // Cancelar suscripción activa existente
      await supabase
        .from("suscripciones")
        .update({ estado: "cancelada" })
        .eq("user_id", selectedUserId)
        .eq("estado", "activa");

      // Crear nueva suscripción
      const fechaInicio = new Date();
      const fechaFin = new Date();
      fechaFin.setMonth(fechaFin.getMonth() + 1); // 1 mes por defecto

      const { error } = await supabase
        .from("suscripciones")
        .insert({
          user_id: selectedUserId,
          plan_id: selectedPlanId,
          fecha_inicio: fechaInicio.toISOString(),
          fecha_fin: fechaFin.toISOString(),
          estado: "activa"
        });

      if (error) throw error;

      const selectedUser = usuarios.find(u => u.user_id === selectedUserId);
      toast.success(`Plan asignado correctamente a ${selectedUser?.nombre}`);
      onSuccess();
      onOpenChange(false);
      setSelectedPlanId("");
      setSelectedUserId("");
      setUserSearch("");
    } catch (error) {
      console.error("Error asignando plan:", error);
      toast.error("Error al asignar el plan");
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = planes.find(p => p.id === selectedPlanId);
  const selectedUser = usuarios.find(u => u.user_id === selectedUserId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Asignar Plan a Usuario</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="usuario">Seleccionar Usuario</Label>
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por email o nombre..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un usuario" />
                </SelectTrigger>
                <SelectContent>
                  {filteredUsuarios.map((usuario) => (
                    <SelectItem key={usuario.user_id} value={usuario.user_id}>
                      {usuario.nombre} - {usuario.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="plan">Seleccionar Plan</Label>
            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un plan" />
              </SelectTrigger>
              <SelectContent>
                {planes.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.nombre} - ${plan.precio}/{plan.periodo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPlan && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium">Límites del plan:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Instancias: {selectedPlan.max_instancias}</div>
                <div>Contactos: {selectedPlan.max_contactos}</div>
                <div>Campañas: {selectedPlan.max_campanas}</div>
                <div>Conversaciones: {selectedPlan.max_conversaciones}</div>
                <div className="col-span-2">Mensajes: {selectedPlan.max_mensajes}</div>
              </div>
            </div>
          )}

          {selectedUser && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium">Usuario seleccionado:</h4>
              <p className="text-sm">{selectedUser.nombre}</p>
              <p className="text-sm text-gray-600">{selectedUser.email}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAsignar} disabled={loading || !selectedPlanId || !selectedUserId}>
            {loading ? "Asignando..." : "Asignar Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
