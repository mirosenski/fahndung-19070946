import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'data', 'images.json');

console.log('🔍 Teste Datenbank-Datei...');
console.log(`📂 Pfad: ${DB_PATH}`);
console.log(`📁 Existiert: ${fs.existsSync(DB_PATH)}`);

try {
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  console.log(`📄 Datei gelesen, Größe: ${data.length} Zeichen`);
  
  const parsedData = JSON.parse(data);
  console.log(`🔍 Parsed Data Type: ${typeof parsedData}, Is Array: ${Array.isArray(parsedData)}`);
  console.log(`📊 Anzahl Bilder: ${parsedData.length}`);
  
  if (parsedData.length > 0) {
    console.log(`📸 Erstes Bild: ${parsedData[0].id}`);
    console.log(`📁 Directory: ${parsedData[0].directory}`);
  }
} catch (error) {
  console.error('❌ Fehler:', error);
} 