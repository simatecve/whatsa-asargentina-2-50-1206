
interface MessageImageProps {
  dataUrl: string;
  messageText?: string | null;
}

export const MessageImage = ({ dataUrl, messageText }: MessageImageProps) => {
  return (
    <div className="space-y-2">
      <img 
        src={dataUrl}
        alt="Imagen adjunta"
        className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
        style={{ maxHeight: '300px', objectFit: 'contain' }}
        onError={(e) => {
          console.error('Error loading image:', e);
          console.log('Image data URL prefix:', dataUrl.substring(0, 100));
        }}
        onLoad={() => {
          console.log('Image loaded successfully');
        }}
        onClick={() => {
          // Abrir imagen en nueva ventana
          const newWindow = window.open();
          if (newWindow) {
            newWindow.document.write(`<img src="${dataUrl}" style="max-width:100%;max-height:100%;" />`);
          }
        }}
      />
      {messageText && <p className="whitespace-pre-wrap">{messageText}</p>}
    </div>
  );
};
