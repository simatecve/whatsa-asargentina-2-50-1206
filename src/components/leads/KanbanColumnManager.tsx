
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Plus, Edit, Trash2, GripVertical } from "lucide-react";
import { useKanbanColumns } from "@/hooks/useKanbanColumns";
import { KanbanColumn, CreateKanbanColumnRequest } from "@/types/kanban";
import { toast } from "sonner";

const COLOR_OPTIONS = [
  { value: 'bg-blue-100 border-blue-400 text-blue-800', label: 'Azul', preview: 'bg-blue-100' },
  { value: 'bg-purple-100 border-purple-400 text-purple-800', label: 'Morado', preview: 'bg-purple-100' },
  { value: 'bg-indigo-100 border-indigo-400 text-indigo-800', label: 'Índigo', preview: 'bg-indigo-100' },
  { value: 'bg-yellow-100 border-yellow-400 text-yellow-800', label: 'Amarillo', preview: 'bg-yellow-100' },
  { value: 'bg-orange-100 border-orange-400 text-orange-800', label: 'Naranja', preview: 'bg-orange-100' },
  { value: 'bg-green-100 border-green-400 text-green-800', label: 'Verde', preview: 'bg-green-100' },
  { value: 'bg-red-100 border-red-400 text-red-800', label: 'Rojo', preview: 'bg-red-100' },
  { value: 'bg-pink-100 border-pink-400 text-pink-800', label: 'Rosa', preview: 'bg-pink-100' },
  { value: 'bg-gray-100 border-gray-400 text-gray-800', label: 'Gris', preview: 'bg-gray-100' },
];

interface KanbanColumnManagerProps {
  onColumnsChange?: () => void;
}

const KanbanColumnManager: React.FC<KanbanColumnManagerProps> = ({ onColumnsChange }) => {
  const { columns, loading, createColumn, updateColumn, deleteColumn, reorderColumns } = useKanbanColumns();
  const [isOpen, setIsOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<KanbanColumn | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [localColumns, setLocalColumns] = useState<KanbanColumn[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    color_class: COLOR_OPTIONS[0].value,
    status_key: ''
  });

  // Update local columns when columns change
  useEffect(() => {
    setLocalColumns([...columns].sort((a, b) => a.order_position - b.order_position));
  }, [columns]);

  const resetForm = () => {
    setFormData({
      title: '',
      color_class: COLOR_OPTIONS[0].value,
      status_key: ''
    });
    setEditingColumn(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }

    if (editingColumn) {
      // Update existing column
      const success = await updateColumn(editingColumn.id, {
        title: formData.title,
        color_class: formData.color_class
      });
      
      if (success) {
        resetForm();
        onColumnsChange?.();
      }
    } else {
      // Create new column
      if (!formData.status_key.trim()) {
        toast.error("La clave de estado es obligatoria");
        return;
      }

      const nextOrder = Math.max(...columns.map(c => c.order_position), 0) + 1;
      
      const newColumn: CreateKanbanColumnRequest = {
        status_key: formData.status_key.toLowerCase().replace(/\s+/g, '_'),
        title: formData.title,
        color_class: formData.color_class,
        order_position: nextOrder
      };

      const success = await createColumn(newColumn);
      
      if (success) {
        resetForm();
        onColumnsChange?.();
      }
    }
  };

  const handleEdit = (column: KanbanColumn) => {
    setEditingColumn(column);
    setFormData({
      title: column.title,
      color_class: column.color_class,
      status_key: column.status_key
    });
  };

  const handleDelete = async (column: KanbanColumn) => {
    if (column.is_default) {
      toast.error("No se puede eliminar la columna predeterminada");
      return;
    }

    if (window.confirm(`¿Estás seguro de que quieres eliminar la columna "${column.title}"?`)) {
      const success = await deleteColumn(column.id);
      if (success) {
        onColumnsChange?.();
      }
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newColumns = [...localColumns];
    const draggedColumn = newColumns[draggedIndex];
    
    // Remove the dragged item
    newColumns.splice(draggedIndex, 1);
    // Insert it at the new position
    newColumns.splice(dropIndex, 0, draggedColumn);
    
    // Update local state immediately for better UX
    setLocalColumns(newColumns);
    setDraggedIndex(null);
    
    // Update order_position for all columns and save to database
    const reorderedColumns = newColumns.map((column, index) => ({
      ...column,
      order_position: index + 1
    }));
    
    const success = await reorderColumns(reorderedColumns);
    if (success) {
      onColumnsChange?.();
    } else {
      // Revert local state if save failed
      setLocalColumns([...columns].sort((a, b) => a.order_position - b.order_position));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Gestionar Columnas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestionar Columnas del Kanban</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {editingColumn ? 'Editar Columna' : 'Nueva Columna'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nombre de la columna"
                  required
                />
              </div>

              {!editingColumn && (
                <div>
                  <Label htmlFor="status_key">Clave de Estado</Label>
                  <Input
                    id="status_key"
                    value={formData.status_key}
                    onChange={(e) => setFormData({ ...formData, status_key: e.target.value })}
                    placeholder="Ej: in_progress, qualified, etc."
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Se usa internamente. Solo letras, números y guiones bajos.
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="color">Color</Label>
                <Select
                  value={formData.color_class}
                  onValueChange={(value) => setFormData({ ...formData, color_class: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLOR_OPTIONS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-4 h-4 rounded ${color.preview} border`} />
                          <span>{color.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  {editingColumn ? 'Actualizar' : 'Crear'}
                </Button>
                {editingColumn && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Columns List */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Columnas Existentes</h3>
            <p className="text-sm text-gray-500">Arrastra las columnas para cambiar el orden</p>
            
            {loading ? (
              <div className="text-center py-4">Cargando...</div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {localColumns.map((column, index) => (
                  <div
                    key={column.id}
                    className={`flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 cursor-move ${
                      draggedIndex === index ? 'opacity-50' : ''
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    <div className="flex items-center space-x-3">
                      <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                      <div className={`w-4 h-4 rounded ${column.color_class.split(' ')[0]} border`} />
                      <div>
                        <div className="font-medium">{column.title}</div>
                        <div className="text-sm text-gray-500">{column.status_key}</div>
                      </div>
                      {column.is_default && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Predeterminada
                        </span>
                      )}
                    </div>
                    
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(column)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!column.is_default && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(column)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KanbanColumnManager;
