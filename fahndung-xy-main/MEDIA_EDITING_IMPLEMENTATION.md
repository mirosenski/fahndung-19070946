# Erweiterte Bild- und Video-Bearbeitung - Implementierung

## 🎯 Übersicht

Diese Implementierung erweitert das bestehende T3-Stack um professionelle Bild- und Video-Bearbeitungsfunktionen mit einheitlicher API und moderner UI.

## 🏗️ Architektur

### 1. Erweiterte Typen (`src/types/index.ts`)

```typescript
// Einheitliche Medien-Metadaten
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
  exifData?: any;
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

// Einheitliche Bearbeitungsparameter
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
```

### 2. tRPC-Router (`src/server/api/routers/media.ts`)

```typescript
export const mediaRouter = createTRPCRouter({
  // Alle Medien abrufen
  getAll: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      tags: z.array(z.string()).optional(),
      mediaType: z.enum(['image', 'video']).optional(),
      directory: z.string().optional()
    }))
    .query(async ({ input }) => {
      // Implementierung...
    }),

  // Medien-Bearbeitung anwenden
  processEdits: protectedProcedure
    .input(z.object({
      mediaId: z.string(),
      edits: MediaEditsSchema
    }))
    .mutation(async ({ input }) => {
      // Sharp-basierte Bildbearbeitung
      // FFmpeg-basierte Video-Bearbeitung
    }),

  // Weitere Endpunkte...
});
```

### 3. Validierung (`src/utils/imageConversion.ts`)

```typescript
export const validateMediaConversion = (media: MediaMetadata, edits: MediaEdits) => {
  const issues: string[] = [];
  
  if (media.mediaType === 'image') {
    // Bild-Validierung
    if (edits.rotation && edits.rotation % 90 !== 0) {
      issues.push('Rotation muss Vielfaches von 90° sein');
    }
    // Weitere Validierungen...
  } else if (media.mediaType === 'video') {
    // Video-Validierung
    if (edits.trim && edits.trim.end > media.duration!) {
      issues.push('Trim-Endzeit darf nicht über Videolänge liegen');
    }
    // Weitere Validierungen...
  }
  
  return { isValid: issues.length === 0, issues };
};
```

### 4. Custom Hook (`src/hooks/useMediaEditor.ts`)

```typescript
export const useMediaEditor = (initialMedia: MediaMetadata) => {
  const [media, setMedia] = useState<MediaMetadata>(initialMedia);
  const [previewUrl, setPreviewUrl] = useState<string>(initialMedia.path);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);

  // Bearbeitungen anwenden
  const applyEdits = useCallback(async (edits: MediaEdits) => {
    // Implementierung...
  }, [media]);

  // Weitere Funktionen...
  
  return {
    media,
    previewUrl,
    isProcessing,
    validationIssues,
    applyEdits,
    updateEdit,
    resetEdits,
    updateMetadata,
    hasChanges: hasChanges(),
    saveEdits,
    generateFilterString
  };
};
```

## 🎨 UI-Komponenten

### 1. EnhancedImageEditor (`src/components/EnhancedImageEditor.tsx`)

- **Tabs-basierte Benutzeroberfläche**
- **Echtzeit-Vorschau** mit CSS-Filtern
- **Canvas-basierte Filter** für komplexe Effekte
- **Responsive Design** mit Fullscreen-Modus
- **Validierung** mit Fehleranzeige

### 2. CompactVideoEditor (`src/components/CompactVideoEditor.tsx`)

- **Video-spezifische Controls**
- **FFmpeg-Integration** für Client-Side Processing
- **Zeit-basierte Schnitt-Controls**
- **Lautstärke-Regler**
- **Metadaten-Anzeige**

## 🔧 Backend-Integration

### 1. Sharp für Bildbearbeitung

```typescript
// Rotation
if (input.edits.rotation && input.edits.rotation !== 0) {
  sharpInstance = sharpInstance.rotate(input.edits.rotation);
}

// Helligkeit und Kontrast
if (input.edits.brightness || input.edits.contrast) {
  const brightness = input.edits.brightness ? input.edits.brightness / 100 : 1;
  sharpInstance = sharpInstance.modulate({ brightness });
  if (input.edits.contrast) {
    sharpInstance = sharpInstance.linear(input.edits.contrast / 100, 0);
  }
}

// Filter
if (input.edits.filter && input.edits.filter !== 'normal') {
  switch (input.edits.filter) {
    case 'grayscale':
      sharpInstance = sharpInstance.grayscale();
      break;
    case 'sepia':
      sharpInstance = sharpInstance.tint({ r: 112, g: 66, b: 20 });
      break;
    // Weitere Filter...
  }
}
```

### 2. FFmpeg für Video-Bearbeitung (Platzhalter)

```typescript
// Video-Schnitt
if (edits.trim) {
  await ffmpeg.exec([
    '-i', media.path,
    '-ss', String(edits.trim.start),
    '-to', String(edits.trim.end),
    '-c', 'copy',
    'output.mp4'
  ]);
}
```

## 🚀 Verwendung

### 1. Bildbearbeitung

```typescript
import { EnhancedImageEditor } from '~/components/EnhancedImageEditor';

function MyComponent() {
  const [selectedImage, setSelectedImage] = useState<MediaMetadata | null>(null);
  
  return (
    <EnhancedImageEditor
      media={selectedImage}
      onClose={() => setSelectedImage(null)}
      onSave={(updatedMedia) => {
        // Speichern der Bearbeitungen
        console.log('Bearbeitetes Bild:', updatedMedia);
      }}
    />
  );
}
```

### 2. Video-Bearbeitung

```typescript
import { CompactVideoEditor } from '~/components/CompactVideoEditor';

function MyComponent() {
  const [selectedVideo, setSelectedVideo] = useState<MediaMetadata | null>(null);
  
  return (
    <CompactVideoEditor
      media={selectedVideo}
      onClose={() => setSelectedVideo(null)}
      onSave={(updatedMedia) => {
        // Speichern der Bearbeitungen
        console.log('Bearbeitetes Video:', updatedMedia);
      }}
    />
  );
}
```

### 3. Custom Hook

```typescript
import { useMediaEditor } from '~/hooks/useMediaEditor';

function MyComponent() {
  const {
    media,
    previewUrl,
    isProcessing,
    applyEdits,
    updateEdit,
    resetEdits,
    hasChanges,
    saveEdits
  } = useMediaEditor(initialMedia);

  const handleRotation = () => {
    updateEdit('rotation', (media.edits?.rotation || 0) + 90);
  };

  const handleSave = async () => {
    const success = await saveEdits();
    if (success) {
      console.log('Bearbeitungen gespeichert');
    }
  };
}
```

## 📋 Features

### ✅ Implementiert

1. **Einheitliche Typen** für Bilder und Videos
2. **tRPC-Router** für Medien-Bearbeitung
3. **Validierung** mit detaillierten Fehlermeldungen
4. **Custom Hook** für State-Management
5. **EnhancedImageEditor** mit moderner UI
6. **CompactVideoEditor** mit Video-spezifischen Features
7. **Sharp-Integration** für professionelle Bildbearbeitung
8. **CSS-Filter** für Client-Side Vorschau
9. **Responsive Design** mit Fullscreen-Modus
10. **Fehlerbehandlung** und Validierung

### 🔄 In Entwicklung

1. **FFmpeg-Integration** für Video-Bearbeitung
2. **Web Workers** für Performance-Optimierung
3. **Chunked Upload** für große Dateien
4. **Lighthouse-Tests** für Performance
5. **Erweiterte Filter** und Effekte

## 🛠️ Installation

### 1. Abhängigkeiten installieren

```bash
npm install sharp @ffmpeg/ffmpeg @ffmpeg/util
```

### 2. FFmpeg-Script hinzufügen

```html
<!-- In _document.tsx oder layout.tsx -->
<script
  src="https://unpkg.com/@ffmpeg/ffmpeg@0.12.4/dist/umd/ffmpeg.min.js"
  strategy="beforeInteractive"
/>
```

### 3. Router registrieren

```typescript
// In src/server/api/root.ts
import { mediaRouter } from "~/server/api/routers/media";

export const appRouter = createTRPCRouter({
  // ... andere Router
  media: mediaRouter,
});
```

## 🎯 Nächste Schritte

1. **FFmpeg-Integration vervollständigen**
2. **Web Workers implementieren**
3. **Performance-Optimierungen**
4. **Erweiterte Filter hinzufügen**
5. **Tests schreiben**
6. **Dokumentation erweitern**

## 📊 Performance-Optimierungen

- **Web Workers** für CPU-intensive Operationen
- **Chunked Upload** für große Dateien
- **Lazy Loading** für Komponenten
- **Memoization** für teure Berechnungen
- **Debouncing** für UI-Updates

Diese Implementierung bietet eine solide Grundlage für professionelle Bild- und Video-Bearbeitung im T3-Stack mit moderner Architektur und erweiterbarer Struktur. 