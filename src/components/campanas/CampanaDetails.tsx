import { Fragment } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Campana } from "./types";
import { CampanaBadge } from "./CampanaBadge";
import { Smartphone } from "lucide-react";
interface CampanaDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campana: Campana | null;
}
export const CampanaDetails = ({
  open,
  onOpenChange,
  campana
}: CampanaDetailsProps) => {
  if (!campana) return null;
  const fechaCreacion = new Date(campana.created_at).toLocaleDateString();
  const fechaInicio = campana.fecha_inicio ? new Date(campana.fecha_inicio).toLocaleDateString() : "No iniciada";
  const fechaFin = campana.fecha_fin ? new Date(campana.fecha_fin).toLocaleDateString() : "No finalizada";
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md md:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {campana.nombre}
          </DialogTitle>
          <DialogDescription>
            Lista: {campana.lista_nombre}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <h4 className="text-sm font-semibold">Estado:</h4>
            <CampanaBadge estado={campana.estado} />
          </div>
          
          <div>
            <h4 className="text-sm font-semibold">Instancia:</h4>
            <div className="flex items-center mt-1 gap-1">
              <Smartphone className="h-4 w-4" />
              <span>{campana.instance_nombre || "Sin instancia asignada"}</span>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold">Fecha de creación:</h4>
            <p>{fechaCreacion}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold">Fecha de inicio:</h4>
            <p>{fechaInicio}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold">Fecha de finalización:</h4>
            <p>{fechaFin}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold">Delay:</h4>
            <p>{campana.delay_minimo} - {campana.delay_maximo} segundos</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <Badge variant="outline" className="font-normal w-full">
              {campana.total_contactos || 0} Contactos
            </Badge>
          </div>
          <div className="text-center">
            
          </div>
          <div className="text-center">
            
          </div>
        </div>
        
        {campana.mensaje && <Fragment>
            <h4 className="text-sm font-semibold mt-4">Mensaje:</h4>
            <div className="p-3 bg-gray-50 rounded border mt-1 whitespace-pre-wrap">
              {campana.mensaje}
            </div>
          </Fragment>}
        
        {campana.archivo_url && <Fragment>
            <h4 className="text-sm font-semibold mt-4">Archivo adjunto:</h4>
            <div className="mt-1">
              <a href={campana.archivo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                {campana.archivo_url}
              </a>
            </div>
          </Fragment>}
      </DialogContent>
    </Dialog>;
};