import { NextApiRequest, NextApiResponse } from 'next';
import { ImageDatabase } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const db = ImageDatabase.getInstance();
    await db.initialize();
    
    const images = await db.getAllImages();
    
    // Sammle alle verfügbaren Formate
    const originalFormats = [...new Set(images.map(img => img.originalFormat))];
    const convertedFormats = [...new Set(images.map(img => img.convertedFormat).filter(Boolean))];
    
    const allFormats = [...new Set([...originalFormats, ...convertedFormats])];
    
    return res.status(200).json({ 
      success: true, 
      formats: allFormats,
      originalFormats,
      convertedFormats
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Formate:', error);
    return res.status(500).json(
      { success: false, error: 'Fehler beim Abrufen der Formate' }
    );
  }
} 