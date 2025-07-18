import { NextApiRequest, NextApiResponse } from 'next';
import { ImageDatabase } from '@/lib/database';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = ImageDatabase.getInstance();
    await db.initialize();
    
    const images = await db.getAllImages();
    
    // Berechne Statistiken
    const totalImages = images.length;
    const totalSize = images.reduce((sum, img) => sum + img.size, 0);
    const maxSize = 10 * 1024 * 1024 * 1024; // 10GB
    const avgSize = totalImages > 0 ? totalSize / totalImages : 0;
    
    // Format-Verteilung
    const formats = images.reduce((acc, img) => {
      const format = img.originalFormat.toLowerCase();
      acc[format] = (acc[format] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Verzeichnis-Verteilung
    const directories = images.reduce((acc, img) => {
      const dir = img.directory || 'allgemein';
      acc[dir] = (acc[dir] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Speicherplatz-Info vom System
    const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
    let availableSpace = 0;
    
    try {
      fs.statSync(uploadsPath);
      // Vereinfachte Berechnung - in Produktion würde man diskusage verwenden
      availableSpace = maxSize - totalSize;
    } catch (error) {
      console.warn('Konnte Speicherplatz nicht ermitteln:', error);
      availableSpace = maxSize - totalSize;
    }
    
    const statistics = {
      totalImages,
      totalSize,
      maxSize,
      availableSpace,
      avgSize,
      formats,
      directories,
      usagePercent: (totalSize / maxSize) * 100
    };
    
    return res.status(200).json({ 
      success: true, 
      stats: statistics,
      debug: {
        uploadsPath,
        availableSpace: formatBytes(availableSpace)
      }
    });
  } catch (error) {
    console.error('Stats API Error:', error);
    return res.status(500).json({ success: false, error: 'Fehler beim Abrufen der Statistiken' });
  }
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 