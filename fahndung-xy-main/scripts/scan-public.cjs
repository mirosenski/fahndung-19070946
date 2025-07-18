const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DB_PATH = path.join(__dirname, '..', 'data', 'images.json');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Hilfsfunktion: Dateien in Verzeichnis scannen (rekursiv)
async function scanDirectoryForFiles(dirPath, baseUrl = '', relativePath = '') {
  const files = [];
  
  if (!fs.existsSync(dirPath)) {
    return files;
  }
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      
      try {
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
            
            const fileUrl = relativePath ? `/${relativePath}/${item}` : `/${item}`;
            const directory = relativePath || 'root';
            
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
        } else if (stat.isDirectory()) {
          // Rekursiv Unterverzeichnisse scannen
          const subRelativePath = relativePath ? `${relativePath}/${item}` : item;
          const subFiles = await scanDirectoryForFiles(fullPath, baseUrl, subRelativePath);
          files.push(...subFiles);
        }
      } catch (error) {
        console.warn(`Konnte ${fullPath} nicht lesen:`, error.message);
      }
    }
  } catch (error) {
    console.warn(`Konnte Verzeichnis ${dirPath} nicht lesen:`, error.message);
  }
  
  return files;
}

async function scanPublicDirectory() {
  console.log('🔍 Starte Public-Verzeichnis-Scan...');
  
  try {
    // Lade bestehende Datenbank
    let existingImages = [];
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      existingImages = JSON.parse(data);
      console.log(`📊 Bestehende Datenbank: ${existingImages.length} Bilder`);
    }
    
    console.log(`📁 Scanne Verzeichnis: ${PUBLIC_DIR}`);
    
    // Scanne das gesamte public-Verzeichnis rekursiv
    const scannedFiles = await scanDirectoryForFiles(PUBLIC_DIR);
    
    console.log(`📁 Gefundene Dateien: ${scannedFiles.length}`);
    
    // Zeige gefundene Dateien an
    for (const file of scannedFiles) {
      console.log(`  📄 ${file.directory}/${file.filename} (${file.mediaType})`);
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
        console.log(`  ➕ Neue Datei: ${file.directory}/${file.filename}`);
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
    
    // Zeige Verzeichnisstruktur
    console.log('\n📁 Verzeichnisstruktur:');
    function showDirectoryStructure(dirPath, indent = '') {
      if (!fs.existsSync(dirPath)) return;
      
      try {
        const items = fs.readdirSync(dirPath);
        for (const item of items) {
          const fullPath = path.join(dirPath, item);
          
          try {
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
              console.log(`${indent}📁 ${item}/`);
              showDirectoryStructure(fullPath, indent + '  ');
            } else {
              const ext = path.extname(item).toLowerCase();
              const isMedia = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.avi', '.mov', '.wmv', '.webm'].includes(ext);
              const icon = isMedia ? '🖼️' : '📄';
              console.log(`${indent}${icon} ${item}`);
            }
          } catch (error) {
            console.log(`${indent}❌ ${item} (Fehler: ${error.message})`);
          }
        }
      } catch (error) {
        console.log(`${indent}❌ Verzeichnis nicht lesbar: ${error.message}`);
      }
    }
    
    showDirectoryStructure(PUBLIC_DIR);
    
  } catch (error) {
    console.error('❌ Fehler beim Scannen:', error);
  }
}

// Führe Scan aus
scanPublicDirectory(); 