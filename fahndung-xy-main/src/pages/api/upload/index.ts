import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { exiftool } from 'exiftool-vendored';
import { ImageDatabase } from '@/lib/database';
import { ImageMetadata } from '@/types';

// Multer-Konfiguration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (req, file, cb) => {
    // Unterstützte Medientypen
    const allowedMimeTypes = [
      // Bilder
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 
      'image/bmp', 'image/tiff', 'image/svg+xml',
      // Videos
      'video/mp4', 'video/webm', 'video/avi', 'video/mov', 'video/mkv',
      'video/flv', 'video/wmv',
      // Dokumente
      'application/pdf', 'text/plain', 'application/json'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Dateityp ${file.mimetype} wird nicht unterstützt`));
    }
  },
});

// Multer-Middleware
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: unknown) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Multer-Middleware ausführen
    await runMiddleware(req, res, upload.single('file'));

    const file = (req as { file?: { buffer: Buffer; originalname: string; size: number; mimetype: string } }).file;
    
    if (!file) {
      return res.status(400).json({ success: false, error: 'Keine Datei gefunden' });
    }

    const buffer = file.buffer;

    // Generiere eindeutige ID
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const originalFilename = `${id}-${file.originalname}`;

    // Erstelle Upload-Ordner falls nicht vorhanden
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const thumbnailDir = path.join(process.cwd(), 'public', 'thumbnails');
    await mkdir(uploadDir, { recursive: true });
    await mkdir(thumbnailDir, { recursive: true });

    // Verzeichnis aus Request-Body oder Standard
    const directory = ((req.body as { directory?: string })?.directory || 'allgemein').toLowerCase();
    
    // Erstelle Verzeichnis falls nicht vorhanden
    const targetUploadDir = path.join(uploadDir, directory);
    const targetThumbnailDir = path.join(thumbnailDir, directory);
    await mkdir(targetUploadDir, { recursive: true });
    await mkdir(targetThumbnailDir, { recursive: true });

    // Speichere Originaldatei
    const finalOriginalPath = path.join(targetUploadDir, originalFilename);
    await writeFile(finalOriginalPath, buffer);

    // Extrahiere Metadaten basierend auf Dateityp
    let imageInfo = { width: 0, height: 0 };
    let exifData = {};
    let thumbnailFilename = '';
    let thumbnailPath = '';

    if (file.mimetype.startsWith('image/')) {
      try {
        // Extrahiere Bildinformationen
        imageInfo = await sharp(buffer).metadata();
        
        // Generiere Thumbnail für Bilder
        thumbnailFilename = `thumb-${originalFilename}`;
        thumbnailPath = path.join(targetThumbnailDir, thumbnailFilename);
        
        await sharp(buffer)
          .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(thumbnailPath);

        // Extrahiere EXIF-Daten für Bilder
        try {
          exifData = await exiftool.read(finalOriginalPath);
        } catch (error) {
          console.log('EXIF-Daten konnten nicht extrahiert werden:', error);
        }
      } catch (error) {
        console.error('Fehler bei der Bildverarbeitung:', error);
        // Fallback: Verwende Originaldatei ohne Thumbnail
        thumbnailFilename = originalFilename;
        thumbnailPath = finalOriginalPath;
      }
    } else {
      // Für Videos und andere Dateien: Verwende Originaldatei als Thumbnail
      thumbnailFilename = originalFilename;
      thumbnailPath = finalOriginalPath;
    }

    const originalFormat = path.extname(file.originalname).toLowerCase().replace('.', '');

    // Erstelle Bildmetadaten
    const imageMetadata: ImageMetadata = {
      id,
      filename: originalFilename,
      originalName: file.originalname,
      path: `/uploads/${directory}/${originalFilename}`,
      thumbnailPath: `/thumbnails/${directory}/${thumbnailFilename}`,
      size: file.size,
      width: imageInfo.width || 0,
      height: imageInfo.height || 0,
      mimeType: file.mimetype,
      originalFormat,
      directory,
      tags: [],
      altText: '',
      description: '',
      exifData,
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      optimized: false,
    };

    // Speichere in Datenbank
    const db = ImageDatabase.getInstance();
    await db.initialize();
    await db.addImage(imageMetadata);

    return res.status(200).json({
      success: true,
      image: imageMetadata
    });

  } catch (error) {
    console.error('Upload-Fehler:', error);
    return res.status(500).json(
      { success: false, error: error instanceof Error ? error.message : 'Upload fehlgeschlagen' }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}; 