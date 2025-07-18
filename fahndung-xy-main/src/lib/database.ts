import { ImageMetadata } from '@/types';
import { promises as fs } from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'images.json');

export class ImageDatabase {
  private static instance: ImageDatabase;
  private images: ImageMetadata[] = [];
  private initialized = false;

  private constructor() {}

  static getInstance(): ImageDatabase {
    if (!ImageDatabase.instance) {
      ImageDatabase.instance = new ImageDatabase();
    }
    return ImageDatabase.instance;
  }

  private async migrateImages(): Promise<void> {
    let needsMigration = false;
    
    for (const image of this.images) {
      // Migration 1: Directory-Felder korrigieren
      if (!image.directory) {
        const pathParts = image.path.split('/');
        image.directory = pathParts.length > 3 && pathParts[2] ? pathParts[2] : 'allgemein';
        needsMigration = true;
      }
      
      // Migration 2: Optimized-Feld für bereits konvertierte Bilder setzen
      if (image.convertedFormat === 'webp' && image.optimized === undefined) {
        image.optimized = true;
        needsMigration = true;
      }
    }
    
    if (needsMigration) {
      console.log('🔄 Migriere Bilder: Korrigiere directory-Felder und setze optimized-Flag...');
      await this.save();
      console.log('✅ Migration abgeschlossen');
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Stelle sicher, dass das Verzeichnis existiert
      await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
      
      console.log(`📂 Versuche Datenbank-Datei zu lesen: ${DB_PATH}`);
      
      // Versuche die Datei zu lesen
      const data = await fs.readFile(DB_PATH, 'utf-8');
      console.log(`📄 Datei gelesen, Größe: ${data.length} Zeichen`);
      
      const parsedData = JSON.parse(data);
      console.log(`🔍 Parsed Data Type: ${typeof parsedData}, Is Array: ${Array.isArray(parsedData)}`);
      
      if (Array.isArray(parsedData)) {
        this.images = parsedData;
        console.log(`✅ Datenbank erfolgreich initialisiert mit ${this.images.length} Bildern`);
        
        // Führe Migration durch
        await this.migrateImages();
      } else {
        console.log('⚠️ Datenbank-Datei enthält kein Array, starte mit leerem Array');
        this.images = [];
        await this.save();
      }
    } catch (error) {
      console.log('📁 Datenbank-Datei nicht gefunden oder Fehler beim Lesen, starte mit leerem Array');
      console.log('Fehler:', error);
      this.images = [];
      await this.save();
    }
    
    this.initialized = true;
  }

  private async save(): Promise<void> {
    try {
      await fs.writeFile(DB_PATH, JSON.stringify(this.images, null, 2));
      console.log(`💾 Datenbank gespeichert mit ${this.images.length} Bildern`);
    } catch (error) {
      console.error('❌ Fehler beim Speichern der Datenbank:', error);
    }
  }

  async addImage(image: ImageMetadata): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
    // directory immer klein speichern
    if (image.directory) {
      image.directory = image.directory.toLowerCase();
    }
    this.images.push(image);
    await this.save();
  }

  async updateImage(id: string, updates: Partial<ImageMetadata>): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
    const index = this.images.findIndex(img => img.id === id);
    if (index !== -1) {
      // directory immer klein speichern
      if (updates.directory) {
        updates.directory = updates.directory.toLowerCase();
      }
      this.images[index] = { 
        ...this.images[index], 
        ...updates, 
        updatedAt: new Date().toISOString()
      } as ImageMetadata;
      await this.save();
    }
  }

  async deleteImage(id: string): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
    this.images = this.images.filter(img => img.id !== id);
    await this.save();
  }

  async getImage(id: string): Promise<ImageMetadata | null> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.images.find(img => img.id === id) || null;
  }

  async getAllImages(): Promise<ImageMetadata[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    // directory immer klein zurückgeben
    return this.images.map(img => ({ 
      ...img, 
      directory: img.directory?.toLowerCase() || 'allgemein' 
    }));
  }

  async getImagesByTags(tags: string[]): Promise<ImageMetadata[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.images.filter(img => 
      tags.some(tag => img.tags.includes(tag))
    );
  }

  async searchImages(searchTerm: string): Promise<ImageMetadata[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    const term = searchTerm.toLowerCase();
    return this.images.filter(img => 
      img.originalName.toLowerCase().includes(term) ||
      img.tags.some(tag => tag.toLowerCase().includes(term))
    );
  }

  async getAllTags(): Promise<string[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    const allTags = this.images.flatMap(img => img.tags);
    return [...new Set(allTags)];
  }
} 