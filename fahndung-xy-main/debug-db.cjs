const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'data', 'images.json');

console.log('🔍 Debug: Datenbank-Datei prüfen...');
console.log('📂 Pfad:', DB_PATH);

try {
  // Prüfe ob Datei existiert
  if (fs.existsSync(DB_PATH)) {
    console.log('✅ Datei existiert');
    
    // Lese Datei
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    console.log('📄 Dateigröße:', data.length, 'Zeichen');
    
    // Parse JSON
    const parsedData = JSON.parse(data);
    console.log('🔍 Parsed Data Type:', typeof parsedData);
    console.log('🔍 Is Array:', Array.isArray(parsedData));
    
    if (Array.isArray(parsedData)) {
      console.log('📸 Anzahl Bilder:', parsedData.length);
      
      if (parsedData.length > 0) {
        console.log('🔍 Erstes Bild:');
        console.log('  ID:', parsedData[0].id);
        console.log('  Name:', parsedData[0].originalName);
        console.log('  Directory:', parsedData[0].directory);
        console.log('  Path:', parsedData[0].path);
      }
    } else {
      console.log('❌ Daten ist kein Array!');
    }
  } else {
    console.log('❌ Datei existiert nicht!');
  }
} catch (error) {
  console.error('❌ Fehler:', error.message);
} 