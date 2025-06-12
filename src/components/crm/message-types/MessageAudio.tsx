
import { useState, useRef } from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileTypeDetection } from "@/utils/crm/fileTypeDetection";

interface MessageAudioProps {
  dataUrl: string;
  detection: FileTypeDetection;
  messageText?: string | null;
}

export const MessageAudio = ({ dataUrl, detection, messageText }: MessageAudioProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleAudioPlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="space-y-2">
      <div className="bg-gray-100 p-4 rounded-lg max-w-xs">
        <div className="flex items-center space-x-3">
          <Button
            size="sm"
            variant="outline"
            onClick={handleAudioPlayPause}
            className="h-10 w-10 rounded-full p-0"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">
              Mensaje de audio
            </p>
            <p className="text-xs text-gray-500">
              {detection.extension.toUpperCase()}
            </p>
          </div>
        </div>
        <audio 
          ref={audioRef}
          src={dataUrl}
          onEnded={handleAudioEnded}
          preload="metadata"
          className="hidden"
        />
      </div>
      {messageText && <p className="whitespace-pre-wrap">{messageText}</p>}
    </div>
  );
};
