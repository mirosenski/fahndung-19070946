import { NextApiRequest, NextApiResponse } from 'next';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // FormData parsen (vereinfacht für Demo)
    const chunks: Buffer[] = [];
    
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    req.on('end', async () => {
      try {
        const buffer = Buffer.concat(chunks);
        const boundary = req.headers['content-type']?.split('boundary=')[1];
        
        if (!boundary) {
          return res.status(400).json({ success: false, message: 'No boundary found' });
        }

        // Einfache FormData-Parsing für Demo
        const parts = buffer.toString().split(`--${boundary}`);
        
        let imageBuffer: Buffer | null = null;
        let originalId = '';
        let transform = '';

        for (const part of parts) {
          if (part.includes('Content-Disposition: form-data')) {
            if (part.includes('name="image"')) {
              // Bild-Daten extrahieren
              const imageStart = part.indexOf('\r\n\r\n') + 4;
              const imageEnd = part.lastIndexOf('\r\n');
              if (imageStart > 3 && imageEnd > imageStart) {
                imageBuffer = Buffer.from(part.substring(imageStart, imageEnd));
              }
            } else if (part.includes('name="originalId"')) {
              // Original-ID extrahieren
              const valueStart = part.indexOf('\r\n\r\n') + 4;
              const valueEnd = part.lastIndexOf('\r\n');
              if (valueStart > 3 && valueEnd > valueStart) {
                originalId = part.substring(valueStart, valueEnd);
              }
            } else if (part.includes('name="transform"')) {
              // Transform-Daten extrahieren
              const valueStart = part.indexOf('\r\n\r\n') + 4;
              const valueEnd = part.lastIndexOf('\r\n');
              if (valueStart > 3 && valueEnd > valueStart) {
                transform = part.substring(valueStart, valueEnd);
              }
            }
          }
        }

        if (!imageBuffer) {
          return res.status(400).json({ success: false, message: 'No image data found' });
        }

        // Verzeichnis erstellen
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'processed');
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true });
        }

        // Dateiname generieren
        const timestamp = Date.now();
        const fileName = `processed_${originalId}_${timestamp}.jpg`;
        const filePath = join(uploadDir, fileName);

        // Datei speichern
        await writeFile(filePath, imageBuffer);

        // URL für Frontend
        const processedImageUrl = `/uploads/processed/${fileName}`;

        console.log(`✅ Bild erfolgreich bearbeitet: ${fileName}`);
        console.log(`📊 Transform-Daten: ${transform}`);

        res.status(200).json({
          success: true,
          processedImageUrl,
          fileName,
          originalId,
          transform: JSON.parse(transform || '{}')
        });

      } catch (error) {
        console.error('❌ Fehler beim Verarbeiten der Bilddaten:', error);
        res.status(500).json({ success: false, message: 'Error processing image data' });
      }
    });

  } catch (error) {
    console.error('❌ Fehler im API-Handler:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
} 