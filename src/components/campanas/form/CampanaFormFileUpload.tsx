
import { useState } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CampanaFormFileUploadProps {
  onFileUploaded: (url: string) => void;
  currentFileUrl?: string | null;
}

export const CampanaFormFileUpload = ({ onFileUploaded, currentFileUrl }: CampanaFormFileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(currentFileUrl || null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validar tamaño del archivo (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("El archivo es demasiado grande. Máximo 10MB permitido.");
      return;
    }
    
    setIsUploading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Debe iniciar sesión para subir archivos");
        return;
      }
      
      // Crear una ruta única para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      console.log('Subiendo archivo:', filePath);
      
      // Subir el archivo a Supabase Storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('campaign-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) {
        console.error('Error al subir archivo:', uploadError);
        throw uploadError;
      }
      
      console.log('Archivo subido exitosamente:', uploadData);
      
      // Obtener la URL pública del archivo
      const { data: { publicUrl } } = supabase.storage
        .from('campaign-files')
        .getPublicUrl(filePath);
        
      console.log('URL pública generada:', publicUrl);
        
      setFileUrl(publicUrl);
      onFileUploaded(publicUrl);
      toast.success("Archivo subido correctamente");
      
    } catch (error) {
      console.error("Error al subir el archivo:", error);
      toast.error("Error al subir el archivo. Intente nuevamente.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = async () => {
    if (!fileUrl) return;
    
    try {
      // Extraer la ruta del archivo de la URL
      const urlParts = fileUrl.split('/');
      const bucketIndex = urlParts.findIndex(part => part === 'campaign-files');
      if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
        const filePath = urlParts.slice(bucketIndex + 1).join('/');
        
        // Eliminar el archivo del storage
        const { error } = await supabase.storage
          .from('campaign-files')
          .remove([filePath]);
          
        if (error) {
          console.error('Error al eliminar archivo:', error);
        }
      }
      
      setFileUrl(null);
      onFileUploaded('');
      toast.success("Archivo eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar el archivo:", error);
      toast.error("Error al eliminar el archivo");
    }
  };

  return (
    <div>
      <div className="flex items-center mb-2">
        <Upload className="mr-2 h-4 w-4 text-azul-500" />
        <h3 className="font-medium">Adjunto (opcional)</h3>
      </div>
      
      <div className="flex flex-col gap-2">
        {!fileUrl ? (
          <>
            <Input 
              type="file" 
              onChange={handleFileUpload}
              disabled={isUploading}
              className="cursor-pointer"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            {isUploading && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo archivo...
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <Upload className="mr-2 h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">Archivo subido correctamente</span>
            </div>
            <div className="flex items-center gap-2">
              <a 
                href={fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Ver archivo
              </a>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
