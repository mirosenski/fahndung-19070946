import { NextApiRequest, NextApiResponse } from 'next';
import { ImageDatabase } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const db = ImageDatabase.getInstance();
    await db.initialize();
    
    const tags = await db.getAllTags();
    
    return res.status(200).json({ success: true, tags });
  } catch (error) {
    console.error('Fehler beim Abrufen der Tags:', error);
    return res.status(500).json(
      { success: false, error: 'Fehler beim Abrufen der Tags' }
    );
  }
} 