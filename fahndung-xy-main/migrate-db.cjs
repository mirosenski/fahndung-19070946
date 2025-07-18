const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'images.json');

async function migrateDatabase() {
  try {
    console.log('📊 Lade Datenbank...');
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const images = JSON.parse(data);
    
    console.log(`📸 ${images.length} Bilder gefunden`);
    
    let migrated = 0;
    
    for (const image of images) {
      // Bestimme das Verzeichnis aus dem Pfad
      const pathParts = image.path.split('/');
      let directory = 'allgemein';
      
      // Wenn der Pfad /uploads/[directory]/[filename] ist
      if (pathParts.length > 3) {
        directory = pathParts[2];
      }
      
      // Setze directory immer auf "allgemein", da die Bilder im Root-Verzeichnis liegen
      image.directory = 'allgemein';
      migrated++;
    }
    
    if (migrated > 0) {
      console.log(`🔄 Migriere ${migrated} Bilder...`);
      fs.writeFileSync(DB_PATH, JSON.stringify(images, null, 2));
      console.log('✅ Migration abgeschlossen');
    } else {
      console.log('✅ Keine Migration nötig');
    }
    
    // Zeige ein Beispiel
    if (images.length > 0) {
      console.log('\n📋 Beispiel-Bild:');
      console.log(JSON.stringify({
        id: images[0].id,
        path: images[0].path,
        thumbnailPath: images[0].thumbnailPath,
        directory: images[0].directory
      }, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Fehler bei der Migration:', error);
  }
}

migrateDatabase(); 