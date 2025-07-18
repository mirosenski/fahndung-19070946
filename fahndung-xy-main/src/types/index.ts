export interface ImageMetadata {
  id: string;
  filename: string;
  originalName: string;
  path: string;
  thumbnailPath: string;
  size: number;
  width: number;
  height: number;
  mimeType: string;
  originalFormat: string;
  convertedFormat?: string;
  directory: string; // Neues Feld für Verzeichnis
  tags: string[];
  altText?: string;
  description?: string;
  exifData?: {
    camera?: string;
    date?: string;
    location?: {
      latitude?: number;
      longitude?: number;
    };
    [key: string]: string | number | boolean | null | undefined | {
      latitude?: number;
      longitude?: number;
    };
  };
  uploadedAt: string;
  updatedAt: string;
  // Neue Felder für moderne Bildbearbeitung
  editedFrom?: string;
  edits?: ImageEdits;
  optimized?: boolean;
  version?: string;
  storagePath?: string;
  cdnUrl?: string;
  lastModified?: string;
}

// Neue Interface für Bildbearbeitungsparameter
export interface ImageEdits {
  rotation?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  filter?: 'normal' | 'grayscale' | 'sepia' | 'vintage' | 'cool' | 'warm';
}

// Erweiterte MediaMetadata-Interface für einheitliche Bild- und Video-Bearbeitung
export interface MediaMetadata {
  id: string;
  filename: string;
  originalName: string;
  path: string;
  thumbnailPath: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number; // Für Videos
  mimeType: string;
  originalFormat: string;
  convertedFormat?: string;
  directory: string;
  tags: string[];
  altText?: string;
  description?: string;
  exifData?: {
    camera?: string;
    date?: string;
    location?: {
      latitude?: number;
      longitude?: number;
    };
    [key: string]: string | number | boolean | null | undefined | {
      latitude?: number;
      longitude?: number;
    };
  };
  uploadedAt: string;
  updatedAt: string;
  editedFrom?: string;
  edits?: MediaEdits;
  optimized?: boolean;
  version?: string;
  storagePath?: string;
  cdnUrl?: string;
  lastModified?: string;
  mediaType: 'image' | 'video'; // Neues Feld
}

// Neue Interface für Medien-Bearbeitungen
export interface MediaEdits {
  // Bilder
  rotation?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  filter?: 'normal' | 'grayscale' | 'sepia' | 'vintage' | 'cool' | 'warm';
  
  // Videos
  trim?: {
    start: number;
    end: number;
  };
  volume?: number;
  playbackSpeed?: number;
  resolution?: string;
}

export interface UploadResponse {
  success: boolean;
  image?: ImageMetadata;
  error?: string;
}

export interface GalleryFilters {
  tags: string[];
  formats: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  searchTerm: string;
  minSize?: number;
  maxSize?: number;
}

export interface ImageInfo {
  altText: string;
  description: string;
  tags: string[];
} 