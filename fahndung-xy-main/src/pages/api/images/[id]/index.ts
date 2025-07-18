import { NextApiRequest, NextApiResponse } from 'next';
import { ImageDatabase } from '@/lib/database';
import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'Ungültige Bild-ID' });
  }

  try {
    const db = ImageDatabase.getInstance();
    await db.initialize();

    switch (req.method) {
      case 'GET':
        const image = await db.getImage(id);
        
        if (!image) {
          return res.status(404).json(
            { success: false, error: 'Bild nicht gefunden' }
          );
        }

        return res.status(200).json({ success: true, image });

      case 'PUT':
        const { tags, altText, description, filename } = req.body;

        const updates: Partial<{ 
          tags: string[]; 
          altText: string; 
          description: string; 
          originalName: string;
        }> = {};
        
        if (tags !== undefined) updates.tags = tags;
        if (altText !== undefined) updates.altText = altText;
        if (description !== undefined) updates.description = description;
        if (filename !== undefined) updates.originalName = filename;
        
        await db.updateImage(id, updates);
        
        return res.status(200).json({ success: true });

      case 'DELETE':
        const imageToDelete = await db.getImage(id);
        
        if (!imageToDelete) {
          return res.status(404).json(
            { success: false, error: 'Bild nicht gefunden' }
          );
        }

        // Lösche Dateien
        const uploadPath = path.join(process.cwd(), 'public', imageToDelete.path);
        const thumbnailPath = path.join(process.cwd(), 'public', imageToDelete.thumbnailPath);
        
        try {
          await fs.unlink(uploadPath);
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
            console.log('Originalbild konnte nicht gelöscht werden:', error);
          }
        }
        
        try {
          await fs.unlink(thumbnailPath);
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
            console.log('Thumbnail konnte nicht gelöscht werden:', error);
          }
        }

        // Lösche aus Datenbank
        await db.deleteImage(id);
        
        return res.status(200).json({ success: true });

      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Fehler bei Bild-Operation:', error);
    return res.status(500).json(
      { success: false, error: 'Fehler bei Bild-Operation' }
    );
  }
} 