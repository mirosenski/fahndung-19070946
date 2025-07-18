const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DB_PATH = path.join(__dirname, '..', 'data', 'images.json');
const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');

// Hilfsfunktion: Dateien in Verzeichnis scannen
async function scanDirectoryForFiles(dirPath, baseUrl) {
  const files = [];
  
  if (!fs.existsSync(dirPath)) {
    return files;
  }
  
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isFile()) {
      const ext = path.extname(item).toLowerCase();
      const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
      const isVideo = ['.mp4', '.avi', '.mov', '.wmv', '.webm'].includes(ext);
      
      if (isImage || isVideo) {
        const mediaType = isImage ? 'image' : 'video';
        const mimeType = isImage ? `image/${ext.slice(1)}` : `video/${ext.slice(1)}`;
        
        // Extrahiere Metadaten für Bilder
        let width = 0, height = 0;
        if (isImage) {
          try {
            const metadata = await sharp(fullPath).metadata();
            width = metadata.width || 0;
            height = metadata.height || 0;
          } catch (error) {
            console.warn(`Konnte Metadaten für ${item} nicht lesen:`, error.message);
          }
        }
        
        const fileUrl = `${baseUrl}/${item}`;
        const directory = path.basename(dirPath);
        
        const mediaItem = {
          id: `scanned_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          filename: item,
          originalName: item,
          path: fileUrl,
          thumbnailPath: fileUrl,
          size: stat.size,
          width,
          height,
          mimeType,
          originalFormat: ext.slice(1),
          directory,
          tags: [],
          uploadedAt: new Date(stat.mtime).toISOString(),
          updatedAt: new Date(stat.mtime).toISOString(),
          mediaType,
          optimized: false,
          version: 'scanned'
        };
        
        files.push(mediaItem);
      }
    }
  }
  
  return files;
}

async function scanAllDirectories() {
  console.log('🔍 Starte Medien-Scan...');
  
  try {
    // Lade bestehende Datenbank
    let existingImages = [];
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      existingImages = JSON.parse(data);
      console.log(`📊 Bestehende Datenbank: ${existingImages.length} Bilder`);
    }
    
    const scannedFiles = [];
    
    if (fs.existsSync(UPLOADS_DIR)) {
      const directories = fs.readdirSync(UPLOADS_DIR, { withFileTypes: true })
        .filter(item => item.isDirectory())
        .map(item => item.name);
      
      console.log(`📁 Gefundene Verzeichnisse: ${directories.join(', ')}`);
      
      for (const dir of directories) {
        const dirPath = path.join(UPLOADS_DIR, dir);
        const baseUrl = `/uploads/${dir}`;
        
        console.log(`🔍 Scanne Verzeichnis: ${dir}`);
        const files = await scanDirectoryForFiles(dirPath, baseUrl);
        scannedFiles.push(...files);
        console.log(`  → ${files.length} Dateien gefunden`);
      }
    } else {
      console.log('⚠️ Uploads-Verzeichnis nicht gefunden');
    }
    
    // Füge neue Dateien hinzu (nur wenn sie noch nicht existieren)
    let addedCount = 0;
    const newImages = [...existingImages];
    
    for (const file of scannedFiles) {
      const existing = existingImages.find(img => 
        img.path === file.path || 
        (img.filename === file.filename && img.directory === file.directory)
      );
      
      if (!existing) {
        newImages.push(file);
        addedCount++;
        console.log(`  ➕ Neue Datei: ${file.filename}`);
      }
    }
    
    // Speichere aktualisierte Datenbank
    if (addedCount > 0) {
      fs.writeFileSync(DB_PATH, JSON.stringify(newImages, null, 2));
      console.log(`✅ ${addedCount} neue Dateien zur Datenbank hinzugefügt`);
    } else {
      console.log('✅ Keine neuen Dateien gefunden');
    }
    
    console.log(`📊 Gesamt: ${newImages.length} Bilder in der Datenbank`);
    
  } catch (error) {
    console.error('❌ Fehler beim Scannen:', error);
  }
}

// Führe Scan aus
scanAllDirectories(); 