
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileTypeDetection } from "@/utils/crm/fileTypeDetection";

interface MessageDocumentProps {
  dataUrl: string;
  detection: FileTypeDetection;
  messageText?: string | null;
}

export const MessageDocument = ({ dataUrl, detection, messageText }: MessageDocumentProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 p-3 border rounded-lg bg-gray-50 max-w-xs">
        <div className="flex-1">
          <p className="font-medium text-sm">Archivo adjunto</p>
          <p className="text-xs text-muted-foreground">
            {detection.extension.toUpperCase()} • {detection.mimeType}
          </p>
        </div>
        <Button size="sm" variant="outline" asChild>
          <a href={dataUrl} download={`archivo.${detection.extension}`}>
            <Download className="h-4 w-4" />
          </a>
        </Button>
      </div>
      {messageText && <p className="whitespace-pre-wrap">{messageText}</p>}
    </div>
  );
};
