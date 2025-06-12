
import { FileTypeDetection } from "@/utils/crm/fileTypeDetection";

interface MessageVideoProps {
  dataUrl: string;
  detection: FileTypeDetection;
  messageText?: string | null;
}

export const MessageVideo = ({ dataUrl, detection, messageText }: MessageVideoProps) => {
  return (
    <div className="space-y-2">
      <video 
        controls 
        className="max-w-xs rounded-lg" 
        style={{ maxHeight: '300px' }}
        preload="metadata"
      >
        <source src={dataUrl} type={detection.mimeType} />
        Tu navegador no soporta el elemento de video.
      </video>
      {messageText && <p className="whitespace-pre-wrap">{messageText}</p>}
    </div>
  );
};
