import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { MediaMetadata, ImageMetadata } from "~/types";
import { validateMediaConversion } from "~/utils/imageConversion";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { ImageDatabase } from "~/lib/database";

// Validierungsschema für Medien-Bearbeitung
const MediaEditsSchema = z.object({
  // Bild-Bearbeitung
  rotation: z.number().min(-360).max(360).optional(),
  brightness: z.number().min(0).max(200).optional(),
  contrast: z.number().min(0).max(200).optional(),
  saturation: z.number().min(0).max(200).optional(),
  crop: z.object({
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
    width: z.number().min(1).max(100),
    height: z.number().min(1).max(100)
  }).optional(),
  filter: z.enum(['normal', 'grayscale', 'sepia', 'vintage', 'cool', 'warm']).optional(),
  
  // Video-Bearbeitung
  trim: z.object({
    start: z.number().min(0),
    end: z.number().min(0)
  }).optional(),
  volume: z.number().min(0).max(2).optional(),
  playbackSpeed: z.number().min(0.25).max(4).optional(),
  resolution: z.string().optional()
});

// Hilfsfunktion: Dateien in Verzeichnis scannen (rekursiv)
async function scanDirectoryForFiles(dirPath: string, baseUrl: string, relativePath: string = ''): Promise<MediaMetadata[]> {
  const files: MediaMetadata[] = [];
  
  if (!fs.existsSync(dirPath)) {
    return files;
  }
  
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isFile()) {
      const ext = path.extname(item).toLowerCase();
      const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
      const isVideo = ['.mp4', '.avi', '.mov', '.wmv', '.webm'].includes(ext);
      
      if (isImage || isVideo) {
        const mediaType = isImage ? 'image' : 'video';
        const mimeType = isImage ? `image/${ext.slice(1)}` : `video/${ext.slice(1)}`;
        
        // Extrahiere Metadaten für Bilder
        let width = 0, height = 0;
        if (isImage) {
          try {
            const metadata = await sharp(fullPath).metadata();
            width = metadata.width || 0;
            height = metadata.height || 0;
          } catch (error) {
            console.warn(`Konnte Metadaten für ${item} nicht lesen:`, error);
          }
        }
        
        const fileUrl = relativePath ? `${baseUrl}/${relativePath}/${item}` : `${baseUrl}/${item}`;
        const directory = relativePath || 'root';
        
        const mediaItem: MediaMetadata = {
          id: `scanned_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          filename: item,
          originalName: item,
          path: fileUrl,
          thumbnailPath: fileUrl,
          size: stat.size,
          width,
          height,
          mimeType,
          originalFormat: ext.slice(1),
          directory,
          tags: [],
          uploadedAt: new Date(stat.mtime).toISOString(),
          updatedAt: new Date(stat.mtime).toISOString(),
          mediaType,
          optimized: false,
          version: 'scanned'
        };
        
        files.push(mediaItem);
      }
    } else if (stat.isDirectory()) {
      // Rekursiv Unterverzeichnisse scannen
      const subRelativePath = relativePath ? `${relativePath}/${item}` : item;
      const subFiles = await scanDirectoryForFiles(fullPath, baseUrl, subRelativePath);
      files.push(...subFiles);
    }
  }
  
  return files;
}

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
      const db = ImageDatabase.getInstance();
      await db.initialize();
      
      let media = await db.getAllImages() as MediaMetadata[];
      
      // Filter: Nur Dateien aus dem uploads Verzeichnis anzeigen
      media = media.filter(m => {
        const path = m.path || m.thumbnailPath || '';
        return path.includes('/uploads/') || path.startsWith('uploads/');
      });
      
      // Filter nach Medientyp
      if (input.mediaType) {
        media = media.filter(m => m.mediaType === input.mediaType);
      }
      
      // Filter nach Suchbegriff
      if (input.search) {
        media = media.filter(m => 
          m.originalName.toLowerCase().includes(input.search!.toLowerCase()) ||
          m.tags.some(tag => tag.toLowerCase().includes(input.search!.toLowerCase())) ||
          m.altText?.toLowerCase().includes(input.search!.toLowerCase()) ||
          m.description?.toLowerCase().includes(input.search!.toLowerCase())
        );
      }
      
      // Filter nach Tags
      if (input.tags && input.tags.length > 0) {
        media = media.filter(m => 
          input.tags!.some(tag => m.tags.includes(tag))
        );
      }
      
      // Filter nach Verzeichnis
      if (input.directory) {
        media = media.filter(m => m.directory === input.directory);
      }
      
      return { success: true, media };
    }),

  // Verzeichnisse scannen und Dateien erkennen
  scanDirectories: protectedProcedure
    .mutation(async () => {
      const db = ImageDatabase.getInstance();
      await db.initialize();
      
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      const scannedFiles: MediaMetadata[] = [];
      
      if (fs.existsSync(uploadsDir)) {
        console.log('🔍 Scanne uploads-Verzeichnis...');
        
        // Scanne nur das uploads-Verzeichnis rekursiv
        const files = await scanDirectoryForFiles(uploadsDir, '/uploads', '');
        scannedFiles.push(...files);
        
        console.log(`📁 Gefundene Dateien in uploads: ${scannedFiles.length}`);
      } else {
        console.log('⚠️ Uploads-Verzeichnis nicht gefunden, erstelle es...');
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Füge gescannte Dateien zur Datenbank hinzu (nur wenn sie noch nicht existieren)
      let addedCount = 0;
      for (const file of scannedFiles) {
        const existing = await db.getImage(file.id);
        if (!existing) {
          await db.addImage(file as ImageMetadata);
          addedCount++;
        }
      }
      
      return { 
        success: true, 
        scannedFiles: scannedFiles.length,
        addedFiles: addedCount
      };
    }),

  // Verzeichnisse auflisten (rekursiv)
  listDirectories: protectedProcedure
    .query(async () => {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      const directories: Array<{
        name: string;
        path: string;
        fileCount: number;
        fullPath: string;
      }> = [];
      
      function scanDirectories(dirPath: string, relativePath: string = ''): void {
        if (!fs.existsSync(dirPath)) return;
        
        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        for (const item of items) {
          if (item.isDirectory()) {
            const fullPath = path.join(dirPath, item.name);
            const dirRelativePath = relativePath ? `${relativePath}/${item.name}` : item.name;
            
            // Zähle Dateien in diesem Verzeichnis
            let fileCount = 0;
            try {
              const dirItems = fs.readdirSync(fullPath);
              fileCount = dirItems.filter(file => {
                const ext = path.extname(file).toLowerCase();
                return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.avi', '.mov', '.wmv', '.webm'].includes(ext);
              }).length;
            } catch (error) {
              console.warn(`Konnte Verzeichnis ${fullPath} nicht lesen:`, error);
            }
            
            directories.push({
              name: item.name,
              path: `/uploads/${dirRelativePath}`,
              fileCount,
              fullPath: dirRelativePath
            });
            
            // Rekursiv Unterverzeichnisse scannen
            scanDirectories(fullPath, dirRelativePath);
          }
        }
      }
      
      // Erstelle uploads-Verzeichnis falls nicht vorhanden
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      scanDirectories(uploadsDir);
      
      return { success: true, directories };
    }),

  // Verzeichnis erstellen
  createDirectory: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input }) => {
      const dirPath = path.join(process.cwd(), 'public', 'uploads', input.name);
      
      if (fs.existsSync(dirPath)) {
        throw new Error('Verzeichnis existiert bereits');
      }
      
      fs.mkdirSync(dirPath, { recursive: true });
      
      return { success: true, path: `/uploads/${input.name}` };
    }),

  // Datei verschieben
  moveFile: protectedProcedure
    .input(z.object({ 
      mediaId: z.string(), 
      targetDirectory: z.string() 
    }))
    .mutation(async ({ input }) => {
      const db = ImageDatabase.getInstance();
      await db.initialize();
      
      const media = await db.getImage(input.mediaId);
      
      if (!media) {
        throw new Error('Medium nicht gefunden');
      }
      
      const sourcePath = path.join(process.cwd(), 'public', media.path.replace(/^\//, ''));
      const targetPath = path.join(process.cwd(), 'public', 'uploads', input.targetDirectory, media.filename);
      
      if (!fs.existsSync(sourcePath)) {
        throw new Error('Quelldatei nicht gefunden');
      }
      
      // Zielverzeichnis erstellen falls nicht vorhanden
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Datei verschieben
      fs.renameSync(sourcePath, targetPath);
      
      // Metadaten aktualisieren
      const newPath = `/uploads/${input.targetDirectory}/${media.filename}`;
      await db.updateImage(input.mediaId, { 
        path: newPath,
        directory: input.targetDirectory
      });
      
      return { success: true, newPath };
    }),

  // Einzelnes Medium abrufen
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = ImageDatabase.getInstance();
      await db.initialize();
      
      const media = await db.getImage(input.id) as MediaMetadata;
      
      if (!media) {
        throw new Error('Medium nicht gefunden');
      }
      
      return { success: true, media };
    }),

  // Medien-Bearbeitung anwenden
  processEdits: protectedProcedure
    .input(z.object({
      mediaId: z.string(),
      edits: MediaEditsSchema
    }))
    .mutation(async ({ input }) => {
      const db = ImageDatabase.getInstance();
      await db.initialize();
      
      const media = await db.getImage(input.mediaId) as MediaMetadata;
      
      if (!media) {
        throw new Error('Medium nicht gefunden');
      }
      
      // Validiere Bearbeitungen
      const validation = validateMediaConversion(media, input.edits);
      if (!validation.isValid) {
        throw new Error(`Validierungsfehler: ${validation.issues.join(', ')}`);
      }
      
      // Bildbearbeitung mit Sharp
      if (media.mediaType === 'image') {
        const imagePath = path.join(process.cwd(), 'public', media.path.replace(/^\//, ''));
        
        if (!fs.existsSync(imagePath)) {
          throw new Error('Bilddatei nicht gefunden');
        }
        
        let sharpInstance = sharp(imagePath);
        
        // Rotation anwenden
        if (input.edits.rotation && input.edits.rotation !== 0) {
          sharpInstance = sharpInstance.rotate(input.edits.rotation);
        }
        
        // Helligkeit und Kontrast anwenden
        if (input.edits.brightness || input.edits.contrast) {
          const brightness = input.edits.brightness ? input.edits.brightness / 100 : 1;
          const contrast = input.edits.contrast ? input.edits.contrast / 100 : 1;
          sharpInstance = sharpInstance.modulate({ brightness });
          // Kontrast separat anwenden
          if (input.edits.contrast) {
            sharpInstance = sharpInstance.linear(contrast, 0);
          }
        }
        
        // Sättigung anwenden
        if (input.edits.saturation) {
          sharpInstance = sharpInstance.modulate({ saturation: input.edits.saturation / 100 });
        }
        
        // Zuschneiden anwenden
        if (input.edits.crop) {
          const metadata = await sharpInstance.metadata();
          const width = metadata.width || 0;
          const height = metadata.height || 0;
          
          const cropX = Math.round((input.edits.crop.x / 100) * width);
          const cropY = Math.round((input.edits.crop.y / 100) * height);
          const cropWidth = Math.round((input.edits.crop.width / 100) * width);
          const cropHeight = Math.round((input.edits.crop.height / 100) * height);
          
          sharpInstance = sharpInstance.extract({
            left: cropX,
            top: cropY,
            width: cropWidth,
            height: cropHeight
          });
        }
        
        // Filter anwenden
        if (input.edits.filter && input.edits.filter !== 'normal') {
          switch (input.edits.filter) {
            case 'grayscale':
              sharpInstance = sharpInstance.grayscale();
              break;
            case 'sepia':
              sharpInstance = sharpInstance.tint({ r: 112, g: 66, b: 20 });
              break;
            case 'vintage':
              sharpInstance = sharpInstance
                .modulate({ brightness: 1.1, saturation: 0.8 })
                .tint({ r: 255, g: 220, b: 180 });
              break;
            case 'cool':
              sharpInstance = sharpInstance.modulate({ hue: -30 });
              break;
            case 'warm':
              sharpInstance = sharpInstance.modulate({ hue: 30 });
              break;
          }
        }
        
        // Bearbeitetes Bild speichern
        const timestamp = Date.now();
        const newFileName = `edited_${timestamp}_${media.filename}`;
        const newPath = path.join(process.cwd(), 'public', 'uploads', 'edited', newFileName);
        
        // Verzeichnis erstellen falls nicht vorhanden
        const editedDir = path.dirname(newPath);
        if (!fs.existsSync(editedDir)) {
          fs.mkdirSync(editedDir, { recursive: true });
        }
        
        await sharpInstance.webp({ quality: 85 }).toFile(newPath);
        
        // Neue Metadaten erstellen
        const editedMetadata = await sharp(newPath).metadata();
        const fileStats = fs.statSync(newPath);
        
        const editedMedia: MediaMetadata = {
          ...media,
          id: `edited_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          originalName: newFileName,
          path: `/uploads/edited/${newFileName}`,
          thumbnailPath: `/uploads/edited/${newFileName}`,
          size: fileStats.size,
          width: editedMetadata.width || media.width || 0,
          height: editedMetadata.height || media.height || 0,
          uploadedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          editedFrom: media.id,
          edits: input.edits,
          optimized: true,
          version: '2025-optimized',
          mediaType: 'image'
        };
        
        // Zur Datenbank hinzufügen - Konvertiere zu ImageMetadata
        const imageMetadata = {
          ...editedMedia,
          width: editedMedia.width || 0,
          height: editedMedia.height || 0
        } as ImageMetadata;
        await db.addImage(imageMetadata);
        
        return { success: true, editedMedia };
      }
      
      // Video-Bearbeitung (Platzhalter für FFmpeg-Integration)
      if (media.mediaType === 'video') {
        // TODO: Implementiere FFmpeg-Integration für Video-Bearbeitung
        throw new Error('Video-Bearbeitung noch nicht implementiert');
      }
      
      throw new Error('Unbekannter Medientyp');
    }),

  // Medien-Metadaten aktualisieren
  updateMetadata: protectedProcedure
    .input(z.object({
      mediaId: z.string(),
      metadata: z.object({
        tags: z.array(z.string()).optional(),
        altText: z.string().optional(),
        description: z.string().optional(),
        originalName: z.string().optional()
      })
    }))
    .mutation(async ({ input }) => {
      const db = ImageDatabase.getInstance();
      await db.initialize();
      
      await db.updateImage(input.mediaId, input.metadata);
      
      return { success: true };
    }),

  // Medium löschen
  delete: protectedProcedure
    .input(z.object({ mediaId: z.string() }))
    .mutation(async ({ input }) => {
      const db = ImageDatabase.getInstance();
      await db.initialize();
      
      const media = await db.getImage(input.mediaId);
      
      if (!media) {
        throw new Error('Medium nicht gefunden');
      }
      
      // Datei löschen
      const filePath = path.join(process.cwd(), 'public', media.path.replace(/^\//, ''));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Thumbnail löschen
      const thumbnailPath = path.join(process.cwd(), 'public', media.thumbnailPath.replace(/^\//, ''));
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
      
      // Aus Datenbank löschen
      await db.deleteImage(input.mediaId);
      
      return { success: true };
    }),

  // Statistiken abrufen
  getStats: protectedProcedure
    .query(async () => {
      const db = ImageDatabase.getInstance();
      await db.initialize();
      
      const media = await db.getAllImages() as MediaMetadata[];
      
      const stats = {
        total: media.length,
        images: media.filter(m => m.mediaType === 'image').length,
        videos: media.filter(m => m.mediaType === 'video').length,
        totalSize: media.reduce((sum, m) => sum + m.size, 0),
        directories: [...new Set(media.map(m => m.directory))],
        formats: [...new Set(media.map(m => m.originalFormat))]
      };
      
      return { success: true, stats };
    }),

  // Datei-Upload (Platzhalter für zukünftige Implementierung)
  upload: protectedProcedure
    .input(z.object({
      fileName: z.string(),
      fileType: z.string(),
      fileSize: z.number(),
      directory: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      // TODO: Implementiere tatsächlichen Datei-Upload
      // Für jetzt: Simuliere erfolgreichen Upload
      const timestamp = Date.now();
      const newFileName = `upload_${timestamp}_${input.fileName}`;
      
      return { 
        success: true, 
        message: 'Datei erfolgreich hochgeladen',
        fileName: newFileName
      };
    })
}); 