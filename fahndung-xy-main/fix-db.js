const fs = require('fs');

// Lade die Datenbank
const data = fs.readFileSync('data/images.json', 'utf-8');
const images = JSON.parse(data);

console.log(`📸 ${images.length} Bilder gefunden`);

// Füge directory-Feld hinzu
let fixed = 0;
for (const image of images) {
  if (!image.directory) {
    image.directory = 'allgemein';
    fixed++;
  }
}

console.log(`🔄 ${fixed} Bilder korrigiert`);

// Speichere zurück
fs.writeFileSync('data/images.json', JSON.stringify(images, null, 2));
console.log('✅ Datenbank gespeichert');

// Zeige erstes Bild
if (images.length > 0) {
  console.log('\n📋 Erstes Bild:');
  console.log(JSON.stringify({
    id: images[0].id,
    path: images[0].path,
    thumbnailPath: images[0].thumbnailPath,
    directory: images[0].directory
  }, null, 2));
} 