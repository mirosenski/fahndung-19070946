import { NextApiRequest, NextApiResponse } from 'next';
import { ImageDatabase } from '@/lib/database';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageId, edits } = req.body;
    
    if (!imageId || !edits) {
      return res.status(400).json({ error: 'Image ID and edits are required' });
    }

    console.log('🖼️ Bildbearbeitung gestartet:', { imageId, edits });

    const db = ImageDatabase.getInstance();
    await db.initialize();
    
    const image = await db.getImage(imageId);
    if (!image) {
      console.error('❌ Bild nicht gefunden:', imageId);
      return res.status(404).json({ error: 'Image not found' });
    }

    // Bildpfad
    const imagePath = path.join(process.cwd(), 'public', image.path.replace(/^\//, ''));
    
    if (!fs.existsSync(imagePath)) {
      console.error('❌ Bilddatei nicht gefunden:', imagePath);
      return res.status(404).json({ error: 'Image file not found' });
    }

    console.log('📁 Bildpfad gefunden:', imagePath);

    // Sharp-Instanz erstellen
    let sharpInstance = sharp(imagePath);

    // Metadaten abrufen
    const originalMetadata = await sharpInstance.metadata();
    console.log('📊 Original-Metadaten:', {
      width: originalMetadata.width,
      height: originalMetadata.height,
      format: originalMetadata.format
    });

    // Bearbeitungen anwenden
    if (edits.rotation && edits.rotation !== 0) {
      console.log('🔄 Rotation anwenden:', edits.rotation);
      sharpInstance = sharpInstance.rotate(edits.rotation);
    }

    if (edits.brightness !== undefined && edits.brightness !== 100) {
      const brightness = edits.brightness / 100;
      console.log('💡 Helligkeit anwenden:', brightness);
      sharpInstance = sharpInstance.modulate({ brightness });
    }

    if (edits.contrast !== undefined && edits.contrast !== 100) {
      const contrast = edits.contrast / 100;
      console.log('🎨 Kontrast anwenden:', contrast);
      sharpInstance = sharpInstance.linear(contrast, -(contrast * 0.5) + 0.5);
    }

    if (edits.saturation !== undefined && edits.saturation !== 100) {
      const saturation = edits.saturation / 100;
      console.log('🌈 Sättigung anwenden:', saturation);
      sharpInstance = sharpInstance.modulate({ saturation });
    }

    // Zuschneiden anwenden
    if (edits.crop && edits.crop.width > 0 && edits.crop.height > 0) {
      console.log('✂️ Zuschneiden anwenden:', edits.crop);
      
      const metadata = await sharpInstance.metadata();
      const width = metadata.width || 0;
      const height = metadata.height || 0;
      
      // Berechne absolute Pixel-Werte
      const cropX = Math.round((edits.crop.x / 100) * width);
      const cropY = Math.round((edits.crop.y / 100) * height);
      const cropWidth = Math.round((edits.crop.width / 100) * width);
      const cropHeight = Math.round((edits.crop.height / 100) * height);
      
      console.log('📐 Zuschneide-Parameter:', {
        x: cropX, y: cropY, width: cropWidth, height: cropHeight,
        originalWidth: width, originalHeight: height
      });
      
      // Prüfe ob Zuschneide-Bereich gültig ist
      if (cropX >= 0 && cropY >= 0 && cropWidth > 0 && cropHeight > 0 &&
          cropX + cropWidth <= width && cropY + cropHeight <= height) {
        sharpInstance = sharpInstance.extract({
          left: cropX,
          top: cropY,
          width: cropWidth,
          height: cropHeight
        });
      } else {
        console.warn('⚠️ Ungültige Zuschneide-Parameter, überspringe Zuschneiden');
      }
    }

    // Filter anwenden
    if (edits.filter && edits.filter !== 'normal') {
      console.log('🎭 Filter anwenden:', edits.filter);
      switch (edits.filter) {
        case 'grayscale':
          sharpInstance = sharpInstance.grayscale();
          break;
        case 'sepia':
          sharpInstance = sharpInstance.tint({ r: 112, g: 66, b: 20 });
          break;
        case 'vintage':
          sharpInstance = sharpInstance
            .modulate({ brightness: 1.1, saturation: 0.8 })
            .tint({ r: 255, g: 220, b: 180 });
          break;
        case 'cool':
          sharpInstance = sharpInstance.modulate({ hue: -30 });
          break;
        case 'warm':
          sharpInstance = sharpInstance.modulate({ hue: 30 });
          break;
      }
    }

    // Neuen Dateinamen generieren
    const timestamp = Date.now();
    const fileExtension = path.extname(image.originalName) || '.webp';
    const baseName = path.basename(image.originalName, fileExtension);
    const newFileName = `edited_${timestamp}_${baseName}.webp`;
    const newPath = path.join(process.cwd(), 'public', 'uploads', 'edited', newFileName);
    
    console.log('💾 Speichere bearbeitetes Bild:', newPath);
    
    // Verzeichnis erstellen falls nicht vorhanden
    const editedDir = path.dirname(newPath);
    if (!fs.existsSync(editedDir)) {
      fs.mkdirSync(editedDir, { recursive: true });
      console.log('📁 Verzeichnis erstellt:', editedDir);
    }

    // Bearbeitetes Bild speichern
    await sharpInstance
      .webp({ quality: 85 })
      .toFile(newPath);

    console.log('✅ Bild erfolgreich gespeichert');

    // Metadaten des bearbeiteten Bildes
    const editedMetadata = await sharp(newPath).metadata();
    const fileStats = fs.statSync(newPath);
    
    console.log('📊 Bearbeitete Metadaten:', {
      width: editedMetadata.width,
      height: editedMetadata.height,
      size: fileStats.size
    });
    
    // Neue Bildermetadaten erstellen
    const editedImage = {
      ...image,
      id: `edited_${image.id}_${timestamp}`,
      originalName: newFileName,
      path: `/uploads/edited/${newFileName}`,
      thumbnailPath: `/uploads/edited/${newFileName}`, // Vereinfacht - könnte auch Thumbnail generieren
      size: fileStats.size,
      width: editedMetadata.width || image.width,
      height: editedMetadata.height || image.height,
      uploadedAt: new Date().toISOString(),
      editedFrom: image.id,
      edits: edits
    };

    // Zur Datenbank hinzufügen
    await db.addImage(editedImage);
    console.log('💾 Bild zur Datenbank hinzugefügt');

    return res.status(200).json({ 
      success: true, 
      editedImage,
      message: 'Bild erfolgreich bearbeitet'
    });

  } catch (error) {
    console.error('❌ Image Edit Error:', error);
    return res.status(500).json({ 
      error: 'Fehler bei der Bildbearbeitung',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    });
  }
} 