
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Plan {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  moneda: string;
  periodo: string;
  max_instancias: number;
  max_contactos: number;
  max_campanas: number;
  max_conversaciones: number;
  max_mensajes: number;
  estado: boolean;
}

interface PlanFormData {
  nombre: string;
  descripcion: string;
  precio: string;
  moneda: string;
  periodo: string;
  max_instancias: string;
  max_contactos: string;
  max_campanas: string;
  max_conversaciones: string;
  max_mensajes: string;
  estado: boolean;
}

interface PlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editPlan: Plan | null;
  onSave: (formData: PlanFormData, editPlan: Plan | null) => Promise<boolean>;
}

export const PlanFormDialog = ({ open, onOpenChange, editPlan, onSave }: PlanFormDialogProps) => {
  const [formData, setFormData] = useState<PlanFormData>({
    nombre: "",
    descripcion: "",
    precio: "",
    moneda: "ARS",
    periodo: "mensual",
    max_instancias: "1",
    max_contactos: "500",
    max_campanas: "5",
    max_conversaciones: "100",
    max_mensajes: "1000",
    estado: true
  });

  useEffect(() => {
    if (editPlan) {
      setFormData({
        nombre: editPlan.nombre || "",
        descripcion: editPlan.descripcion || "",
        precio: editPlan.precio.toString() || "",
        moneda: editPlan.moneda || "ARS",
        periodo: editPlan.periodo || "mensual",
        max_instancias: editPlan.max_instancias.toString() || "1",
        max_contactos: editPlan.max_contactos.toString() || "500",
        max_campanas: editPlan.max_campanas.toString() || "5",
        max_conversaciones: editPlan.max_conversaciones?.toString() || "100",
        max_mensajes: editPlan.max_mensajes?.toString() || "1000",
        estado: editPlan.estado
      });
    } else {
      setFormData({
        nombre: "",
        descripcion: "",
        precio: "",
        moneda: "ARS",
        periodo: "mensual",
        max_instancias: "1",
        max_contactos: "500",
        max_campanas: "5",
        max_conversaciones: "100",
        max_mensajes: "1000",
        estado: true
      });
    }
  }, [editPlan, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value === "" || /^\d+$/.test(value)) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, estado: checked }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const success = await onSave(formData, editPlan);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editPlan ? 'Editar Plan' : 'Crear Nuevo Plan'}</DialogTitle>
          <DialogDescription>
            {editPlan 
              ? 'Actualice la información del plan seleccionado.' 
              : 'Complete el formulario para crear un nuevo plan de suscripción.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Plan *</Label>
              <Input
                id="nombre"
                name="nombre"
                placeholder="Ej: Plan Básico"
                value={formData.nombre}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="precio">Precio *</Label>
              <Input
                id="precio"
                name="precio"
                placeholder="0.00"
                value={formData.precio}
                onChange={handlePriceInputChange}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              placeholder="Descripción del plan..."
              value={formData.descripcion}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="moneda">Moneda</Label>
              <Select
                value={formData.moneda}
                onValueChange={(value) => handleSelectChange('moneda', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione moneda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ARS">ARS - Peso Argentino</SelectItem>
                  <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                  <SelectItem value="USD">USD - Dólar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="periodo">Periodo de Facturación</Label>
              <Select
                value={formData.periodo}
                onValueChange={(value) => handleSelectChange('periodo', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione periodo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensual">Mensual</SelectItem>
                  <SelectItem value="trimestral">Trimestral</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_instancias">Máx. Instancias</Label>
              <Input
                id="max_instancias"
                name="max_instancias"
                value={formData.max_instancias}
                onChange={handleNumberInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max_contactos">Máx. Contactos</Label>
              <Input
                id="max_contactos"
                name="max_contactos"
                value={formData.max_contactos}
                onChange={handleNumberInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max_campanas">Máx. Campañas</Label>
              <Input
                id="max_campanas"
                name="max_campanas"
                value={formData.max_campanas}
                onChange={handleNumberInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max_conversaciones">Máx. Conversaciones</Label>
              <Input
                id="max_conversaciones"
                name="max_conversaciones"
                value={formData.max_conversaciones}
                onChange={handleNumberInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max_mensajes">Máx. Mensajes</Label>
              <Input
                id="max_mensajes"
                name="max_mensajes"
                value={formData.max_mensajes}
                onChange={handleNumberInputChange}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="estado"
              checked={formData.estado}
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor="estado">Plan Activo</Label>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {editPlan ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
