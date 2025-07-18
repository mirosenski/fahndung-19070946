import { NextApiRequest, NextApiResponse } from 'next';
import { ImageDatabase } from '@/lib/database';
import { ImageMetadata } from '@/types';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const imageId = req.query.id as string;
    
    if (!imageId) {
      return res.status(400).json({ error: 'Bild-ID erforderlich' });
    }
    
    const db = ImageDatabase.getInstance();
    await db.initialize();
    
    const image = await db.getImage(imageId);
    if (!image) {
      return res.status(404).json({ error: 'Bild nicht gefunden' });
    }

    // Prüfe ob bereits optimiert
    if (image.optimized) {
      return res.status(200).json({ message: 'Bild ist bereits optimiert' });
    }

    await processSingleImage(image);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Bild erfolgreich optimiert' 
    });
  } catch (error) {
    console.error('Single image optimization error:', error);
    return res.status(500).json({
      error: 'Optimization failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

async function processSingleImage(image: ImageMetadata) {
  const originalPath = path.join(process.cwd(), 'public', image.path);
  
  // Prüfe ob Original existiert
  if (!await fileExists(originalPath)) {
    console.warn(`⚠️ Original file missing: ${originalPath}`);
    return;
  }

  // Metadaten lesen
  const metadata = await sharp(originalPath).metadata();
  const originalSize = await getFileSize(originalPath);

  // Konvertiere zu WebP mit optimierten Einstellungen
  const optimizedPath = originalPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  
  await sharp(originalPath)
    .webp({
      quality: 80,
      effort: 6,
      nearLossless: true,
      alphaQuality: 85
    })
    .toFile(optimizedPath);

  // Überprüfe neue Datei
  const newSize = await getFileSize(optimizedPath);
  const savedBytes = originalSize - newSize;
  
  console.log(`📸 Optimized ${image.id}: ${formatBytes(originalSize)} → ${formatBytes(newSize)} (${savedBytes > 0 ? '+' : ''}${formatBytes(savedBytes)})`);

  // Aktualisiere Datenbank
  const db = ImageDatabase.getInstance();
  await db.updateImage(image.id, {
    path: image.path.replace(/\.(jpg|jpeg|png)$/i, '.webp'),
    optimized: true,
    size: newSize,
    width: metadata.width || image.width,
    height: metadata.height || image.height,
    convertedFormat: 'webp',
    mimeType: 'image/webp'
  });

  // Lösche Original nach Bestätigung
  await fs.unlink(originalPath);
  console.log(`🗑️ Original deleted: ${originalPath}`);
}

// Hilfsfunktionen
async function fileExists(path: string) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

async function getFileSize(path: string) {
  const stats = await fs.stat(path);
  return stats.size;
}

function formatBytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
} 