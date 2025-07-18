const { ImageDatabase } = require('./src/lib/database.ts');

async function testDatabase() {
  console.log('🔍 Test: ImageDatabase Klasse...');
  
  try {
    const db = ImageDatabase.getInstance();
    console.log('✅ Instance erstellt');
    
    await db.initialize();
    console.log('✅ Initialisiert');
    
    const images = await db.getAllImages();
    console.log('📸 Anzahl Bilder:', images.length);
    
    if (images.length > 0) {
      console.log('🔍 Erstes Bild:');
      console.log('  ID:', images[0].id);
      console.log('  Name:', images[0].originalName);
      console.log('  Directory:', images[0].directory);
    }
  } catch (error) {
    console.error('❌ Fehler:', error.message);
    console.error('❌ Stack:', error.stack);
  }
}

testDatabase(); 