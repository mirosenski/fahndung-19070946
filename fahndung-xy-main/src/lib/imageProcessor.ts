import sharp from 'sharp';
import { ImageEdits } from '@/types';
import { z } from 'zod';

// Validierungsschema für Bildbearbeitung
export const ImageEditSchema = z.object({
  rotation: z.number().min(-360).max(360).optional(),
  brightness: z.number().min(0).max(200).optional(),
  contrast: z.number().min(0).max(200).optional(),
  saturation: z.number().min(0).max(200).optional(),
  crop: z.object({
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
    width: z.number().min(1).max(100),
    height: z.number().min(1).max(100)
  }).nullable().optional(),
  filter: z.enum(['normal', 'grayscale', 'sepia', 'vintage', 'cool', 'warm']).optional()
});

export type ValidatedImageEdits = z.infer<typeof ImageEditSchema>;

export class ImageProcessor {
  private sharpInstance: sharp.Sharp;
  private metadata: sharp.Metadata | null = null;

  constructor(imageBuffer: Buffer | string) {
    this.sharpInstance = sharp(imageBuffer);
  }

  /**
   * Validiert und wendet Bildbearbeitungen an
   */
  async processEdits(edits: ImageEdits): Promise<void> {
    // Validiere Input
    const validation = ImageEditSchema.safeParse(edits);
    if (!validation.success) {
      throw new Error(`Ungültige Bearbeitungsparameter: ${validation.error.message}`);
    }

    const validatedEdits = validation.data;

    // Hole Metadaten
    this.metadata = await this.sharpInstance.metadata();

    // Wende Bearbeitungen an
    await this.applyRotation(validatedEdits.rotation);
    await this.applyColorAdjustments(validatedEdits);
    await this.applyCropping(validatedEdits.crop);
    await this.applyFilter(validatedEdits.filter);
  }

  /**
   * Wendet Rotation an
   */
  private async applyRotation(rotation?: number): Promise<void> {
    if (rotation && rotation !== 0) {
      console.log('🔄 Rotation anwenden:', rotation);
      this.sharpInstance = this.sharpInstance.rotate(rotation);
    }
  }

  /**
   * Wendet Farbanpassungen an
   */
  private async applyColorAdjustments(edits: ValidatedImageEdits): Promise<void> {
    const adjustments: { brightness?: number; saturation?: number } = {};

    if (edits.brightness !== undefined && edits.brightness !== 100) {
      adjustments.brightness = edits.brightness / 100;
      console.log('💡 Helligkeit anwenden:', adjustments.brightness);
    }

    if (edits.contrast !== undefined && edits.contrast !== 100) {
      const contrast = edits.contrast / 100;
      console.log('🎨 Kontrast anwenden:', contrast);
      this.sharpInstance = this.sharpInstance.linear(contrast, -(contrast * 0.5) + 0.5);
    }

    if (edits.saturation !== undefined && edits.saturation !== 100) {
      adjustments.saturation = edits.saturation / 100;
      console.log('🌈 Sättigung anwenden:', adjustments.saturation);
    }

    if (Object.keys(adjustments).length > 0) {
      this.sharpInstance = this.sharpInstance.modulate(adjustments);
    }
  }

  /**
   * Wendet Zuschneiden an
   */
  private async applyCropping(crop?: ValidatedImageEdits['crop']): Promise<void> {
    if (!crop || !this.metadata) return;

    const width = this.metadata.width || 0;
    const height = this.metadata.height || 0;

    // Berechne absolute Pixel-Werte
    const cropX = Math.round((crop.x / 100) * width);
    const cropY = Math.round((crop.y / 100) * height);
    const cropWidth = Math.round((crop.width / 100) * width);
    const cropHeight = Math.round((crop.height / 100) * height);

    console.log('📐 Zuschneide-Parameter:', {
      x: cropX, y: cropY, width: cropWidth, height: cropHeight,
      originalWidth: width, originalHeight: height
    });

    // Prüfe ob Zuschneide-Bereich gültig ist
    if (this.isValidCrop({ left: cropX, top: cropY, width: cropWidth, height: cropHeight }, width, height)) {
      this.sharpInstance = this.sharpInstance.extract({
        left: cropX,
        top: cropY,
        width: cropWidth,
        height: cropHeight
      });
    } else {
      console.warn('⚠️ Ungültige Zuschneide-Parameter, überspringe Zuschneiden');
    }
  }

  /**
   * Wendet Filter an
   */
  private async applyFilter(filter?: string): Promise<void> {
    if (!filter || filter === 'normal') return;

    console.log('🎭 Filter anwenden:', filter);

    switch (filter) {
      case 'grayscale':
        this.sharpInstance = this.sharpInstance.grayscale();
        break;
      case 'sepia':
        this.sharpInstance = this.sharpInstance.tint({ r: 112, g: 66, b: 20 });
        break;
      case 'vintage':
        this.sharpInstance = this.sharpInstance
          .modulate({ brightness: 1.1, saturation: 0.8 })
          .tint({ r: 255, g: 220, b: 180 });
        break;
      case 'cool':
        this.sharpInstance = this.sharpInstance.modulate({ hue: -30 });
        break;
      case 'warm':
        this.sharpInstance = this.sharpInstance.modulate({ hue: 30 });
        break;
    }
  }

  /**
   * Prüft ob Zuschneide-Parameter gültig sind
   */
  private isValidCrop(params: sharp.Region, width: number, height: number): boolean {
    return params.left >= 0 && 
           params.top >= 0 && 
           params.width > 0 && 
           params.height > 0 &&
           params.left + params.width <= width &&
           params.top + params.height <= height;
  }

  /**
   * Gibt das bearbeitete Bild als Buffer zurück
   */
  async toBuffer(): Promise<Buffer> {
    return this.sharpInstance.webp({ quality: 85 }).toBuffer();
  }

  /**
   * Speichert das bearbeitete Bild
   */
  async toFile(outputPath: string): Promise<void> {
    await this.sharpInstance.webp({ quality: 85 }).toFile(outputPath);
  }

  /**
   * Gibt Metadaten zurück
   */
  async getMetadata(): Promise<sharp.Metadata> {
    return this.sharpInstance.metadata();
  }

  /**
   * Generiert optimierten Dateinamen
   */
  static generateOptimizedFilename(originalName: string, edits: ImageEdits): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    
    // Erstelle kürzeren Hash basierend auf den tatsächlichen Änderungen
    const changes = [];
    if (edits.rotation && edits.rotation !== 0) changes.push(`r${edits.rotation}`);
    if (edits.brightness && edits.brightness !== 100) changes.push(`b${edits.brightness}`);
    if (edits.contrast && edits.contrast !== 100) changes.push(`c${edits.contrast}`);
    if (edits.saturation && edits.saturation !== 100) changes.push(`s${edits.saturation}`);
    if (edits.filter && edits.filter !== 'normal') changes.push(edits.filter);
    if (edits.crop) changes.push('crop');
    
    const changesHash = changes.length > 0 ? `_${changes.join('')}` : '';
    
    return `edited_${timestamp}_${randomId}${changesHash}.webp`;
  }

  /**
   * Erstellt Thumbnail
   */
  async createThumbnail(width: number = 300, height: number = 300): Promise<Buffer> {
    return this.sharpInstance
      .resize(width, height, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();
  }
} 