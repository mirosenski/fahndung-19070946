import { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Alle Verzeichnisse abrufen
    try {
      const directories = await getDirectories();
      return res.status(200).json({ success: true, directories });
    } catch (error) {
      console.error('Fehler beim Abrufen der Verzeichnisse:', error);
      return res.status(500).json({ success: false, error: 'Fehler beim Abrufen der Verzeichnisse' });
    }
  }

  if (req.method === 'POST') {
    // Neues Verzeichnis erstellen
    try {
      let { name } = req.body;
      
      if (!name || typeof name !== 'string') {
        return res.status(400).json({ success: false, error: 'Verzeichnisname ist erforderlich' });
      }
      name = name.toLowerCase();

      const directoryPath = path.join(UPLOAD_DIR, name);
      
      // Prüfe ob Verzeichnis bereits existiert
      try {
        await fs.access(directoryPath);
        return res.status(409).json({ success: false, error: 'Verzeichnis existiert bereits' });
      } catch {
        // Verzeichnis existiert nicht, erstelle es
        await fs.mkdir(directoryPath, { recursive: true });
        
        // Erstelle auch Thumbnail-Verzeichnis
        const thumbnailDir = path.join(process.cwd(), 'public', 'thumbnails', name);
        await fs.mkdir(thumbnailDir, { recursive: true });
        
        return res.status(201).json({ success: true, directory: name });
      }
    } catch (error) {
      console.error('Fehler beim Erstellen des Verzeichnisses:', error);
      return res.status(500).json({ success: false, error: 'Fehler beim Erstellen des Verzeichnisses' });
    }
  }

  if (req.method === 'DELETE') {
    // Verzeichnis löschen
    try {
      const { name } = req.query;
      
      if (!name || typeof name !== 'string') {
        return res.status(400).json({ success: false, error: 'Verzeichnisname ist erforderlich' });
      }

      const directoryPath = path.join(UPLOAD_DIR, name);
      const thumbnailDir = path.join(process.cwd(), 'public', 'thumbnails', name);
      
      // Prüfe ob Verzeichnis existiert
      try {
        await fs.access(directoryPath);
      } catch {
        return res.status(404).json({ success: false, error: 'Verzeichnis nicht gefunden' });
      }

      // Lösche Verzeichnis und alle Dateien darin
      await fs.rm(directoryPath, { recursive: true, force: true });
      await fs.rm(thumbnailDir, { recursive: true, force: true });
      
      return res.status(200).json({ success: true, message: 'Verzeichnis gelöscht' });
    } catch (error) {
      console.error('Fehler beim Löschen des Verzeichnisses:', error);
      return res.status(500).json({ success: false, error: 'Fehler beim Löschen des Verzeichnisses' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

async function getDirectories(): Promise<string[]> {
  try {
    const items = await fs.readdir(UPLOAD_DIR);
    const directories = [];
    
    for (const item of items) {
      const itemPath = path.join(UPLOAD_DIR, item);
      const stats = await fs.stat(itemPath);
      
      if (stats.isDirectory()) {
        directories.push(item.toLowerCase());
      }
    }
    
    // Nur eindeutige, sortierte Verzeichnisse zurückgeben
    return [...new Set(directories)].sort();
  } catch (error) {
    console.error('Fehler beim Lesen der Verzeichnisse:', error);
    return [];
  }
} 