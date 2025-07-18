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
      if (!image.directory) {
        // Bestimme das Verzeichnis aus dem Pfad
        const pathParts = image.path.split('/');
        let directory = 'allgemein';
        
        // Wenn der Pfad /uploads/[directory]/[filename] ist
        if (pathParts.length > 3) {
          directory = pathParts[2];
        }
        
        image.directory = directory;
        migrated++;
      }
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
      console.log(JSON.stringify(images[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ Fehler bei der Migration:', error);
  }
}

migrateDatabase(); 