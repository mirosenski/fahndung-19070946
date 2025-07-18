import { ImageDatabase } from '../src/lib/database';

async function fixAllImages() {
  console.log('🔧 Starte Bild-Migration...');
  
  const db = ImageDatabase.getInstance();
  await db.initialize();
  
  const images = await db.getAllImages();
  console.log(`📸 ${images.length} Bilder gefunden`);
  
  let fixedCount = 0;
  for (const img of images) {
    if (!img.directory) {
      console.log(`🔧 Korrigiere Bild ${img.id}: ${img.originalName}`);
      await db.updateImage(img.id, { 
        directory: 'allgemein' 
      });
      fixedCount++;
    }
  }
  
  console.log(`✅ Migration abgeschlossen: ${fixedCount} Bilder korrigiert`);
}

fixAllImages().catch(console.error); 