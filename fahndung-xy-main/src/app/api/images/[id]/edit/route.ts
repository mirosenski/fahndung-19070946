import { NextResponse } from 'next/server';
import { ImageDatabase } from '@/lib/database';
import { ImageProcessor } from '@/lib/imageProcessor';
import path from 'path';
import fs from 'fs';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { edits } = await request.json();
    const { id: imageId } = await params;
    
    console.log('🖼️ Bildbearbeitung gestartet:', { imageId, edits });

    // Datenbankzugriff
    const db = ImageDatabase.getInstance();
    await db.initialize();
    
    const image = await db.getImage(imageId);
    if (!image) {
      console.error('❌ Bild nicht gefunden:', imageId);
      return NextResponse.json(
        { error: 'Bild nicht gefunden' },
        { status: 404 }
      );
    }

    // Bildpfad
    const imagePath = path.join(process.cwd(), 'public', image.path.replace(/^\//, ''));
    
    if (!fs.existsSync(imagePath)) {
      console.error('❌ Bilddatei nicht gefunden:', imagePath);
      return NextResponse.json(
        { error: 'Bilddatei nicht gefunden' },
        { status: 404 }
      );
    }

    console.log('📁 Bildpfad gefunden:', imagePath);

    // Lade Bild als Buffer
    const imageBuffer = fs.readFileSync(imagePath);
    
    // ImageProcessor mit Buffer verwenden
    const processor = new ImageProcessor(imageBuffer);
    
    // Metadaten abrufen
    const originalMetadata = await processor.getMetadata();
    console.log('📊 Original-Metadaten:', {
      width: originalMetadata.width,
      height: originalMetadata.height,
      format: originalMetadata.format
    });

    // Bearbeitungen anwenden
    await processor.processEdits(edits);

    // Neuen Dateinamen generieren (kürzer)
    const newFileName = ImageProcessor.generateOptimizedFilename(image.originalName, edits);
    const newPath = path.join(process.cwd(), 'public', 'uploads', 'edited', newFileName);
    
    console.log('💾 Speichere bearbeitetes Bild:', newPath);
    
    // Verzeichnis erstellen falls nicht vorhanden
    const editedDir = path.dirname(newPath);
    if (!fs.existsSync(editedDir)) {
      fs.mkdirSync(editedDir, { recursive: true });
      console.log('📁 Verzeichnis erstellt:', editedDir);
    }

    // Bearbeitetes Bild speichern
    await processor.toFile(newPath);

    console.log('✅ Bild erfolgreich gespeichert');

    // Metadaten des bearbeiteten Bildes
    const editedMetadata = await processor.getMetadata();
    const fileStats = fs.statSync(newPath);
    
    console.log('📊 Bearbeitete Metadaten:', {
      width: editedMetadata.width,
      height: editedMetadata.height,
      size: fileStats.size
    });
    
    // Neue Bildermetadaten erstellen
    const editedImage = {
      ...image,
      id: `edited_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      originalName: newFileName,
      path: `/uploads/edited/${newFileName}`,
      thumbnailPath: `/uploads/edited/${newFileName}`,
      size: fileStats.size,
      width: editedMetadata.width || image.width,
      height: editedMetadata.height || image.height,
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      editedFrom: image.id,
      edits: edits,
      optimized: true,
      version: '2025-optimized'
    };

    // Zur Datenbank hinzufügen
    await db.addImage(editedImage);
    console.log('💾 Bild zur Datenbank hinzugefügt');

    return NextResponse.json({ 
      success: true, 
      editedImage,
      message: 'Bild erfolgreich bearbeitet',
      version: '2025-optimized'
    });

  } catch (error) {
    console.error('❌ Image Edit Error:', error);
    return NextResponse.json(
      { 
        error: 'Fehler bei der Bildbearbeitung',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler',
        code: 'E-500-IMG'
      },
      { status: 500 }
    );
  }
} 