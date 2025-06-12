
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Message } from "@/hooks/useCRMData";
import { detectFileTypeFromBase64 } from "@/utils/crm/fileTypeDetection";
import { MessageAudio } from "./message-types/MessageAudio";
import { MessageImage } from "./message-types/MessageImage";
import { MessageVideo } from "./message-types/MessageVideo";
import { MessageDocument } from "./message-types/MessageDocument";

interface MessageContentProps {
  message: Message;
}

export const MessageContent = ({ message }: MessageContentProps) => {
  console.log('Message adjunto:', message.adjunto ? 'Present' : 'Not present');
  console.log('Message archivo_url:', message.archivo_url ? 'Present' : 'Not present');
  
  // Prioridad 1: Adjunto en base64
  if (message.adjunto) {
    console.log('Processing base64 adjunto, length:', message.adjunto.length);
    
    try {
      const detection = detectFileTypeFromBase64(message.adjunto);
      console.log('Detected file type:', detection);
      
      // Construir la URL de datos completa
      const dataUrl = message.adjunto.startsWith('data:') 
        ? message.adjunto 
        : `data:${detection.mimeType};base64,${message.adjunto}`;

      if (detection.type === 'image') {
        return <MessageImage dataUrl={dataUrl} messageText={message.mensaje} />;
      }

      if (detection.type === 'audio') {
        return <MessageAudio dataUrl={dataUrl} detection={detection} messageText={message.mensaje} />;
      }

      if (detection.type === 'video') {
        return <MessageVideo dataUrl={dataUrl} detection={detection} messageText={message.mensaje} />;
      }

      // Para documentos y otros tipos de archivo
      return <MessageDocument dataUrl={dataUrl} detection={detection} messageText={message.mensaje} />;
      
    } catch (error) {
      console.error('Error processing base64 attachment:', error);
      return <p className="whitespace-pre-wrap">{message.mensaje}</p>;
    }
  }

  // Priority 2: URL-based attachments (fallback for compatibility)
  if (message.archivo_url) {
    if (message.tipo_mensaje === 'imagen') {
      return (
        <div className="space-y-2">
          <img 
            src={message.archivo_url} 
            alt={message.archivo_nombre || 'Imagen'}
            className="max-w-xs rounded-lg"
            style={{ maxHeight: '300px', objectFit: 'contain' }}
          />
          {message.mensaje && <p className="whitespace-pre-wrap">{message.mensaje}</p>}
        </div>
      );
    }

    if (message.tipo_mensaje === 'audio') {
      return (
        <div className="space-y-2">
          <audio controls className="max-w-xs">
            <source src={message.archivo_url} type={message.archivo_tipo || 'audio/mpeg'} />
          </audio>
          {message.mensaje && <p className="whitespace-pre-wrap">{message.mensaje}</p>}
        </div>
      );
    }

    if (message.tipo_mensaje === 'video') {
      return (
        <div className="space-y-2">
          <video controls className="max-w-xs rounded-lg" style={{ maxHeight: '300px' }}>
            <source src={message.archivo_url} type={message.archivo_tipo || 'video/mp4'} />
          </video>
          {message.mensaje && <p className="whitespace-pre-wrap">{message.mensaje}</p>}
        </div>
      );
    }

    if (message.tipo_mensaje === 'documento') {
      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 p-2 border rounded-lg">
            <div className="flex-1">
              <p className="font-medium">{message.archivo_nombre}</p>
            </div>
            <Button size="sm" variant="outline" asChild>
              <a href={message.archivo_url} download={message.archivo_nombre}>
                <Download className="h-4 w-4" />
              </a>
            </Button>
          </div>
          {message.mensaje && <p className="whitespace-pre-wrap">{message.mensaje}</p>}
        </div>
      );
    }
  }

  return <p className="whitespace-pre-wrap">{message.mensaje}</p>;
};
