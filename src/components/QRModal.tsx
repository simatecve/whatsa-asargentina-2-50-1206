
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface QRModalProps {
  open: boolean;
  onClose: () => void;
  qrCode: string | null;
  instanceName: string;
}

const QRModal = ({ open, onClose, qrCode, instanceName }: QRModalProps) => {
  // Format the QR code data if it's a base64 string without the data URI prefix
  const formattedQRCode = React.useMemo(() => {
    if (!qrCode) return null;
    
    // Make sure qrCode is a string before using string methods
    const qrCodeString = String(qrCode);
    
    // If the QR code already has a data URI prefix, return it as is
    if (qrCodeString.startsWith('data:')) return qrCodeString;
    
    // If it's a base64 string without prefix, add the data URI prefix
    // The API might return just the base64 content without the data URI prefix
    return `data:image/png;base64,${qrCodeString}`;
  }, [qrCode]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Escanee el código QR con WhatsApp</DialogTitle>
          <DialogDescription>
            Conecte su dispositivo móvil a esta instancia
          </DialogDescription>
        </DialogHeader>
        
        {formattedQRCode ? (
          <div className="flex flex-col items-center">
            <p className="text-sm text-center mb-4">
              Para conectar la instancia <strong>{instanceName}</strong>, abra WhatsApp en su teléfono,
              vaya a Configuración &gt; Dispositivos vinculados y escanee este código QR
            </p>
            
            <AspectRatio ratio={1} className="bg-white border rounded-md overflow-hidden max-w-xs mx-auto">
              <img
                src={formattedQRCode}
                alt="QR Code"
                className="w-full h-full object-contain"
              />
            </AspectRatio>
          </div>
        ) : (
          <div className="flex flex-col items-center py-8">
            <p className="text-muted-foreground">No se pudo generar el código QR</p>
          </div>
        )}
        
        <DialogFooter className="mt-4">
          <Button onClick={onClose} className="w-full">
            Ya he conectado mi WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QRModal;
