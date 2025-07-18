import { NextApiRequest, NextApiResponse } from 'next';
import { ImageDatabase } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Cache deaktivieren
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  try {
    const db = ImageDatabase.getInstance();
    await db.initialize();
    
    const images = await db.getAllImages();
    console.log(`🔍 API: ${images.length} Bilder geladen`);
    
    // TEMPORÄR: Keine Filter, nur sortieren
    images.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    
    return res.status(200).json({ 
      success: true, 
      images,
      debug: {
        totalImages: images.length,
        directories: [...new Set(images.map(img => img.directory || 'keine'))]
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: 'Fehler beim Abrufen' });
  }
} 