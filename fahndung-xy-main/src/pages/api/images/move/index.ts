import { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import { ImageDatabase } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { imageId, targetDirectory: rawTargetDirectory } = req.body;
    
    if (!imageId || !rawTargetDirectory) {
      return res.status(400).json({ 
        success: false, 
        error: 'imageId und targetDirectory sind erforderlich' 
      });
    }
    const targetDirectory = rawTargetDirectory.toLowerCase();

    const db = ImageDatabase.getInstance();
    await db.initialize();
    
    // Bild aus Datenbank abrufen
    const image = await db.getImage(imageId);
    if (!image) {
      return res.status(404).json({ success: false, error: 'Bild nicht gefunden' });
    }

    // Verzeichnisse erstellen falls nicht vorhanden
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', targetDirectory);
    const thumbnailDir = path.join(process.cwd(), 'public', 'thumbnails', targetDirectory);
    
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.mkdir(thumbnailDir, { recursive: true });

    // Aktuelle Pfade
    const currentImagePath = path.join(process.cwd(), 'public', image.path);
    const currentThumbnailPath = path.join(process.cwd(), 'public', image.thumbnailPath);
    
    // Neue Pfade
    const newImagePath = path.join(uploadDir, image.filename);
    const newThumbnailPath = path.join(thumbnailDir, path.basename(image.thumbnailPath));
    
    // Prüfe ob Quelldateien existieren
    try {
      await fs.access(currentImagePath);
      await fs.access(currentThumbnailPath);
    } catch {
      return res.status(404).json({ 
        success: false, 
        error: 'Bilddateien nicht gefunden' 
      });
    }

    // Dateien verschieben
    await fs.rename(currentImagePath, newImagePath);
    await fs.rename(currentThumbnailPath, newThumbnailPath);

    // Metadaten aktualisieren
    const updatedImage = {
      ...image,
      directory: targetDirectory, // immer klein
      path: `/uploads/${targetDirectory}/${image.filename}`,
      thumbnailPath: `/thumbnails/${targetDirectory}/${path.basename(image.thumbnailPath)}`,
      updatedAt: new Date().toISOString()
    };

    await db.updateImage(imageId, updatedImage);

    return res.status(200).json({ 
      success: true, 
      image: updatedImage,
      message: `Bild erfolgreich nach ${targetDirectory} verschoben` 
    });

  } catch (error) {
    console.error('Fehler beim Verschieben des Bildes:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Fehler beim Verschieben des Bildes' 
    });
  }
} 