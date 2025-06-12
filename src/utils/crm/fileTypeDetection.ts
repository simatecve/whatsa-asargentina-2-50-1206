
export interface FileTypeDetection {
  type: 'image' | 'audio' | 'video' | 'document';
  mimeType: string;
  extension: string;
}

export const detectFileTypeFromBase64 = (base64String: string): FileTypeDetection => {
  // Limpiar el base64 removiendo prefijos si existen
  const cleanBase64 = base64String.replace(/^data:[^;]+;base64,/, '');
  
  try {
    // Decodificar los primeros bytes para obtener los magic numbers
    const binaryString = atob(cleanBase64.substring(0, 20));
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    console.log('Magic bytes:', Array.from(bytes.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' '));

    // Detectar imágenes
    // JPEG: FF D8 FF
    if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
      return { type: 'image', mimeType: 'image/jpeg', extension: 'jpg' };
    }
    
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      return { type: 'image', mimeType: 'image/png', extension: 'png' };
    }
    
    // GIF: 47 49 46 38
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
      return { type: 'image', mimeType: 'image/gif', extension: 'gif' };
    }
    
    // WebP: 52 49 46 46 ... 57 45 42 50
    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
        bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
      return { type: 'image', mimeType: 'image/webp', extension: 'webp' };
    }

    // Detectar audio
    // MP3: FF FB o FF F3 o FF F2 o ID3
    if ((bytes[0] === 0xFF && (bytes[1] & 0xE0) === 0xE0) || 
        (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33)) {
      return { type: 'audio', mimeType: 'audio/mpeg', extension: 'mp3' };
    }
    
    // WAV: 52 49 46 46 ... 57 41 56 45
    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
        bytes[8] === 0x57 && bytes[9] === 0x41 && bytes[10] === 0x56 && bytes[11] === 0x45) {
      return { type: 'audio', mimeType: 'audio/wav', extension: 'wav' };
    }
    
    // OGG: 4F 67 67 53
    if (bytes[0] === 0x4F && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53) {
      return { type: 'audio', mimeType: 'audio/ogg', extension: 'ogg' };
    }

    // M4A/AAC: puede empezar con varios patrones
    if ((bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) ||
        (bytes[0] === 0xFF && (bytes[1] & 0xF0) === 0xF0)) {
      return { type: 'audio', mimeType: 'audio/mp4', extension: 'm4a' };
    }

    // Detectar video
    // MP4: 66 74 79 70 (ftyp)
    if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
      // Verificar si es específicamente video MP4
      const brandBytes = bytes.slice(8, 12);
      const brand = String.fromCharCode(...brandBytes);
      if (brand.includes('mp4') || brand.includes('M4V') || brand.includes('isom')) {
        return { type: 'video', mimeType: 'video/mp4', extension: 'mp4' };
      }
    }
    
    // AVI: 52 49 46 46 ... 41 56 49 20
    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
        bytes[8] === 0x41 && bytes[9] === 0x56 && bytes[10] === 0x49 && bytes[11] === 0x20) {
      return { type: 'video', mimeType: 'video/avi', extension: 'avi' };
    }

    // Detectar documentos
    // PDF: 25 50 44 46
    if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
      return { type: 'document', mimeType: 'application/pdf', extension: 'pdf' };
    }
    
    // ZIP (también usado por DOCX, XLSX, etc): 50 4B 03 04
    if (bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04) {
      return { type: 'document', mimeType: 'application/zip', extension: 'zip' };
    }

    console.log('Unknown file type, defaulting to image');
    return { type: 'image', mimeType: 'image/jpeg', extension: 'jpg' };
    
  } catch (error) {
    console.error('Error detecting file type:', error);
    return { type: 'image', mimeType: 'image/jpeg', extension: 'jpg' };
  }
};
