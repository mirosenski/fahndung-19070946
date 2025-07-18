import { MediaMetadata, MediaEdits } from '~/types';

export interface ImageConversionRules {
  maxFileNameLength: number;
  preserveOriginalName: boolean;
  targetFormat: 'webp';
  quality: number;
  maxWidth: number;
  maxHeight: number;
}

export const DEFAULT_IMAGE_RULES: ImageConversionRules = {
  maxFileNameLength: 10,
  preserveOriginalName: true,
  targetFormat: 'webp',
  quality: 85,
  maxWidth: 1920,
  maxHeight: 1080
};

export function generateOptimizedFileName(originalName: string, rules: ImageConversionRules = DEFAULT_IMAGE_RULES): string {
  if (!rules.preserveOriginalName) {
    // Generiere einen kurzen Namen basierend auf Timestamp
    const timestamp = Date.now().toString().slice(-6);
    return `img_${timestamp}.${rules.targetFormat}`;
  }

  // Entferne Dateiendung und Sonderzeichen
  let cleanName = originalName.replace(/\.[^/.]+$/, ''); // Entferne Dateiendung
  cleanName = cleanName.replace(/[^a-zA-Z0-9äöüßÄÖÜ]/g, ''); // Nur alphanumerische Zeichen
  
  // Kürze auf maximale Länge
  if (cleanName.length > rules.maxFileNameLength) {
    cleanName = cleanName.substring(0, rules.maxFileNameLength);
  }
  
  // Stelle sicher, dass der Name nicht leer ist
  if (!cleanName) {
    const timestamp = Date.now().toString().slice(-6);
    cleanName = `img_${timestamp}`;
  }
  
  return `${cleanName}.${rules.targetFormat}`;
}

export function validateImageConversion(input: {
  originalName: string;
  fileSize: number;
  width: number;
  height: number;
}, rules: ImageConversionRules = DEFAULT_IMAGE_RULES): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Prüfe Dateiname
  if (input.originalName.length > rules.maxFileNameLength + 10) { // +10 für Dateiendung
    issues.push(`Dateiname zu lang (max ${rules.maxFileNameLength} Zeichen)`);
  }
  
  // Prüfe Dateigröße (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (input.fileSize > maxSize) {
    issues.push('Datei zu groß (max 10MB)');
  }
  
  // Prüfe Dimensionen
  if (input.width > rules.maxWidth || input.height > rules.maxHeight) {
    issues.push(`Bild zu groß (max ${rules.maxWidth}x${rules.maxHeight})`);
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

export function getConversionSettings(rules: ImageConversionRules = DEFAULT_IMAGE_RULES) {
  return {
    format: rules.targetFormat,
    quality: rules.quality,
    maxWidth: rules.maxWidth,
    maxHeight: rules.maxHeight
  };
} 

// Erweiterte Validierungsfunktion für Medien-Bearbeitung
export const validateMediaConversion = (media: MediaMetadata, edits: MediaEdits) => {
  const issues: string[] = [];
  
  if (media.mediaType === 'image') {
    // Bild-Validierung
    if (edits.rotation && edits.rotation % 90 !== 0) {
      issues.push('Rotation muss Vielfaches von 90° sein');
    }
    
    if (edits.brightness && (edits.brightness < 0 || edits.brightness > 200)) {
      issues.push('Helligkeit muss zwischen 0% und 200% liegen');
    }
    
    if (edits.contrast && (edits.contrast < 0 || edits.contrast > 200)) {
      issues.push('Kontrast muss zwischen 0% und 200% liegen');
    }
    
    if (edits.saturation && (edits.saturation < 0 || edits.saturation > 200)) {
      issues.push('Sättigung muss zwischen 0% und 200% liegen');
    }
    
    if (edits.crop) {
      if (edits.crop.x < 0 || edits.crop.y < 0 || edits.crop.width <= 0 || edits.crop.height <= 0) {
        issues.push('Zuschneide-Parameter müssen positiv sein');
      }
      if (edits.crop.x + edits.crop.width > 100 || edits.crop.y + edits.crop.height > 100) {
        issues.push('Zuschneide-Bereich darf nicht über 100% hinausgehen');
      }
    }
  } else if (media.mediaType === 'video') {
    // Video-Validierung
    if (edits.trim) {
      if (edits.trim.start < 0) {
        issues.push('Startzeit darf nicht negativ sein');
      }
      if (edits.trim.end > (media.duration || 0)) {
        issues.push('Endzeit darf nicht über Videolänge liegen');
      }
      if (edits.trim.start >= edits.trim.end) {
        issues.push('Startzeit muss vor Endzeit liegen');
      }
    }
    
    if (edits.playbackSpeed && (edits.playbackSpeed < 0.25 || edits.playbackSpeed > 4)) {
      issues.push('Geschwindigkeit muss zwischen 0.25x und 4x liegen');
    }
    
    if (edits.volume && (edits.volume < 0 || edits.volume > 2)) {
      issues.push('Lautstärke muss zwischen 0 und 200% liegen');
    }
  }
  
  return { isValid: issues.length === 0, issues };
};

// Hilfsfunktion für Bildformat-Validierung
export const validateImageFormat = (filename: string): boolean => {
  const supportedFormats = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff'];
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return supportedFormats.includes(extension);
};

// Hilfsfunktion für Videoformat-Validierung
export const validateVideoFormat = (filename: string): boolean => {
  const supportedFormats = ['.mp4', '.webm', '.avi', '.mov', '.mkv', '.flv'];
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return supportedFormats.includes(extension);
};

// Hilfsfunktion für Dateigröße-Validierung
export const validateFileSize = (size: number, maxSize: number = 100 * 1024 * 1024): boolean => {
  return size <= maxSize;
};

// Hilfsfunktion für Metadaten-Extraktion
export const extractMediaMetadata = async (file: File): Promise<Partial<MediaMetadata>> => {
  const metadata: Partial<MediaMetadata> = {
    originalName: file.name,
    size: file.size,
    mimeType: file.type,
    originalFormat: file.name.split('.').pop()?.toLowerCase() || '',
    uploadedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [],
    directory: 'allgemein'
  };

  // Bestimme Medientyp
  if (file.type.startsWith('image/')) {
    metadata.mediaType = 'image';
  } else if (file.type.startsWith('video/')) {
    metadata.mediaType = 'video';
  }

  return metadata;
}; 