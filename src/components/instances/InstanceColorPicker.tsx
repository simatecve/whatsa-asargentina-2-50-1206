
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Palette } from "lucide-react";
import { updateInstanceColor } from "@/services/apiService";
import { toast } from "@/components/ui/use-toast";

interface InstanceColorPickerProps {
  instanceName: string;
  currentColor: string;
  onColorChange: (newColor: string) => void;
}

const colorOptions = [
  { name: "Naranja", value: "#f97316", bg: "bg-orange-50", border: "border-orange-400", text: "text-orange-800", icon: "text-orange-600" },
  { name: "Azul", value: "#3b82f6", bg: "bg-blue-50", border: "border-blue-400", text: "text-blue-800", icon: "text-blue-600" },
  { name: "Violeta", value: "#8b5cf6", bg: "bg-violet-50", border: "border-violet-400", text: "text-violet-800", icon: "text-violet-600" },
  { name: "Verde", value: "#10b981", bg: "bg-green-50", border: "border-green-400", text: "text-green-800", icon: "text-green-600" },
  { name: "Rojo", value: "#ef4444", bg: "bg-red-50", border: "border-red-400", text: "text-red-800", icon: "text-red-600" },
  { name: "Rosa", value: "#ec4899", bg: "bg-pink-50", border: "border-pink-400", text: "text-pink-800", icon: "text-pink-600" },
  { name: "Índigo", value: "#6366f1", bg: "bg-indigo-50", border: "border-indigo-400", text: "text-indigo-800", icon: "text-indigo-600" },
  { name: "Amarillo", value: "#eab308", bg: "bg-yellow-50", border: "border-yellow-400", text: "text-yellow-800", icon: "text-yellow-600" }
];

export const InstanceColorPicker = ({ instanceName, currentColor, onColorChange }: InstanceColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleColorSelect = async (color: string) => {
    setUpdating(true);
    try {
      await updateInstanceColor(instanceName, color);
      onColorChange(color);
      setIsOpen(false);
      toast({
        title: "Color actualizado",
        description: "El color de la instancia se ha actualizado correctamente"
      });
    } catch (error) {
      console.error("Error updating instance color:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el color de la instancia",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="w-full text-xs" disabled={updating}>
          <Palette className="h-3 w-3 mr-1" />
          Cambiar color
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48">
        <div className="grid grid-cols-4 gap-2">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              className={`w-8 h-8 rounded-full border-2 ${
                currentColor === color.value ? 'border-gray-800' : 'border-gray-300'
              } hover:scale-110 transition-transform`}
              style={{ backgroundColor: color.value }}
              onClick={() => handleColorSelect(color.value)}
              title={color.name}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
