'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Badge } from '~/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Slider } from '~/components/ui/slider';
import { 
  X, 
  Save, 
  RotateCw, 
  Image as ImageIcon,
  Settings,
  Check,
  AlertCircle,
  Maximize2,
  Minimize2,
  Undo2,
  Redo2,
  Sun,
  Contrast,
  Droplets
} from 'lucide-react';
import { ImageMetadata } from '~/types';
import { validateImageConversion } from '~/utils/imageConversion';

interface CompactImageEditorProps {
  image: ImageMetadata;
  onClose: () => void;
  onSave: (updatedImage: Partial<ImageMetadata>) => void;
  onOptimize?: (imageId: string) => void;
  onConvertToWebP?: (imageId: string) => void;
}

interface ImageTransform {
  rotation: number;
  brightness: number;
  contrast: number;
  saturation: number;
  scale: number;
  crop: { x: number; y: number; width: number; height: number } | null;
}

export function CompactImageEditor({ 
  image, 
  onClose, 
  onSave,
  onOptimize,
  onConvertToWebP
}: CompactImageEditorProps) {
  const [activeTab, setActiveTab] = useState('edit');
  const [isEditing, setIsEditing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editedImage, setEditedImage] = useState<Partial<ImageMetadata>>({
    altText: image.altText || '',
    description: image.description || '',
    tags: image.tags || []
  });
  const [newTag, setNewTag] = useState('');
  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  
  // Bildbearbeitung States
  const [transform, setTransform] = useState<ImageTransform>({
    rotation: 0,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    scale: 1,
    crop: null
  });
  const [transformHistory, setTransformHistory] = useState<ImageTransform[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);


  // Bildvalidierung
  const validateImage = useCallback(() => {
    const issues = validateImageConversion({
      originalName: image.originalName,
      fileSize: image.size,
      width: image.width || 0,
      height: image.height || 0
    });
    setValidationIssues(issues.issues);
    return issues.isValid;
  }, [image]);

  // Transform-Historie verwalten
  const addToHistory = useCallback((newTransform: ImageTransform) => {
    const newHistory = transformHistory.slice(0, historyIndex + 1);
    newHistory.push(newTransform);
    setTransformHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [transformHistory, historyIndex]);

  // Undo/Redo
  const undo = () => {
    if (historyIndex > 0) {
      const prevTransform = transformHistory[historyIndex - 1];
      if (prevTransform) {
        setHistoryIndex(historyIndex - 1);
        setTransform(prevTransform);
      }
    }
  };

  const redo = () => {
    if (historyIndex < transformHistory.length - 1) {
      const nextTransform = transformHistory[historyIndex + 1];
      if (nextTransform) {
        setHistoryIndex(historyIndex + 1);
        setTransform(nextTransform);
      }
    }
  };

  // Echte Bildbearbeitung anwenden und Datei erstellen
  const applyTransformAndSave = useCallback(async () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas-Größe setzen
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Transform anwenden
    ctx.save();
    
    // Rotation
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((transform.rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Bild zeichnen
    ctx.drawImage(img, 0, 0);

    // Filter anwenden
    if (transform.brightness !== 100 || transform.contrast !== 100 || transform.saturation !== 100) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i] || 0;
        const g = data[i + 1] || 0;
        const b = data[i + 2] || 0;
        
        // Helligkeit
        let newR = Math.min(255, r * (transform.brightness / 100));
        let newG = Math.min(255, g * (transform.brightness / 100));
        let newB = Math.min(255, b * (transform.brightness / 100));

        // Kontrast
        const factor = (259 * (transform.contrast + 255)) / (255 * (259 - transform.contrast));
        newR = Math.min(255, Math.max(0, factor * (newR - 128) + 128));
        newG = Math.min(255, Math.max(0, factor * (newG - 128) + 128));
        newB = Math.min(255, Math.max(0, factor * (newB - 128) + 128));

        // Sättigung
        const gray = 0.299 * newR + 0.587 * newG + 0.114 * newB;
        data[i] = Math.min(255, gray + (newR - gray) * (transform.saturation / 100));
        data[i + 1] = Math.min(255, gray + (newG - gray) * (transform.saturation / 100));
        data[i + 2] = Math.min(255, gray + (newB - gray) * (transform.saturation / 100));
      }

      ctx.putImageData(imageData, 0, 0);
    }

    ctx.restore();

    // Canvas als Blob konvertieren
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      // Datei erstellen
      const fileName = `edited_${image.originalName}`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });

      // FormData für Upload erstellen
      const formData = new FormData();
      formData.append('image', file);
      formData.append('originalId', image.id);
      formData.append('transform', JSON.stringify(transform));

      try {
        const response = await fetch('/api/images/process', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
                     if (result.success) {
             // Metadaten aktualisieren
             const updatedImage: Partial<ImageMetadata> = {
               ...editedImage,
               path: result.processedImageUrl,
               thumbnailPath: result.processedImageUrl,
               originalName: fileName,
               size: file.size,
               editedFrom: image.id
             };

            // Speichern
            await onSave(updatedImage);
            
            // Erfolg anzeigen
            console.log('✅ Bild erfolgreich bearbeitet und gespeichert');
          }
        } else {
          console.error('❌ Fehler beim Speichern des bearbeiteten Bildes');
        }
      } catch (error) {
        console.error('❌ Fehler beim Upload:', error);
      }
    }, 'image/jpeg', 0.9);
  }, [transform, image, editedImage, onSave]);

  // Transform ändern
  const updateTransform = useCallback((updates: Partial<ImageTransform>) => {
    const newTransform = { ...transform, ...updates };
    setTransform(newTransform);
    addToHistory(newTransform);
  }, [transform, addToHistory]);

  // Bild laden und Canvas initialisieren
  useEffect(() => {
    const img = imageRef.current;
    if (img) {
      img.onload = () => {
        // Canvas für Vorschau erstellen
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
          }
        }
      };
    }
  }, []);

  // Tag hinzufügen
  const addTag = () => {
    if (newTag.trim() && !editedImage.tags?.includes(newTag.trim())) {
      setEditedImage(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  // Tag entfernen
  const removeTag = (tagToRemove: string) => {
    setEditedImage(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  // Speichern
  const handleSave = async () => {
    if (!validateImage()) {
      return;
    }

    setIsEditing(true);
    try {
      // Wenn Transform-Änderungen vorhanden sind, echte Bildbearbeitung anwenden
      if (transform.rotation !== 0 || transform.brightness !== 100 || 
          transform.contrast !== 100 || transform.saturation !== 100) {
        await applyTransformAndSave();
      } else {
        // Nur Metadaten speichern
        await onSave(editedImage);
      }
      onClose();
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    } finally {
      setIsEditing(false);
    }
  };

  // Optimieren
  const handleOptimize = async () => {
    if (onOptimize) {
      setIsEditing(true);
      try {
        await onOptimize(image.id);
      } catch (error) {
        console.error('Fehler bei der Optimierung:', error);
      } finally {
        setIsEditing(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 z-50">
      <Card className={`w-full h-full max-w-7xl ${isFullscreen ? 'max-h-full' : 'max-h-[95vh]'} flex flex-col`}>
        {/* Header */}
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              Bild bearbeiten
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="h-8 w-8 p-0"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* Hauptinhalt - Werkzeuge oben, Bild unten */}
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* Werkzeugbereich oben */}
          <div className="flex-shrink-0 p-4 border-b bg-muted/30">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="edit" className="text-xs sm:text-sm">Bearbeiten</TabsTrigger>
                <TabsTrigger value="transform" className="text-xs sm:text-sm">Transform</TabsTrigger>
                <TabsTrigger value="info" className="text-xs sm:text-sm">Info</TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="mt-4 space-y-4">
                {/* Dateiname und Format */}
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Dateiname</label>
                  <div className="flex gap-2">
                    <Input
                      value={editedImage.originalName || image.originalName}
                      onChange={(e) => setEditedImage(prev => ({ ...prev, originalName: e.target.value }))}
                      placeholder="Dateiname ohne Endung"
                      className="text-sm flex-1"
                    />
                    <div className="flex items-center px-3 bg-muted/50 rounded-md text-sm text-muted-foreground">
                      .{image.originalFormat}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Nur der Name ohne Dateiendung. Das Format bleibt unverändert.
                  </p>
                </div>

                {/* Format-Konvertierung */}
                {image.originalFormat !== 'webp' && (
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Format-Konvertierung</label>
                    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-blue-800">
                          Aktuelles Format: {image.originalFormat.toUpperCase()}
                        </p>
                        <p className="text-xs text-blue-600">
                          Konvertierung zu WebP für bessere Kompression
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-blue-700 border-blue-300 hover:bg-blue-100"
                        onClick={() => {
                          if (onConvertToWebP) {
                            onConvertToWebP(image.id);
                          }
                        }}
                      >
                        <Settings className="w-3 h-3 mr-1" />
                        Zu WebP
                      </Button>
                    </div>
                  </div>
                )}

                {/* Alt-Text */}
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Alt-Text</label>
                  <Input
                    value={editedImage.altText || ''}
                    onChange={(e) => setEditedImage(prev => ({ ...prev, altText: e.target.value }))}
                    placeholder="Beschreibung für Barrierefreiheit"
                    className="text-sm"
                  />
                </div>
                
                {/* Beschreibung */}
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Beschreibung</label>
                  <Textarea
                    value={editedImage.description || ''}
                    onChange={(e) => setEditedImage(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optionale Beschreibung"
                    className="text-sm min-h-[80px]"
                  />
                </div>

                {/* Tags */}
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Tags</label>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      placeholder="Tag hinzufügen"
                      className="text-sm flex-1"
                    />
                    <Button size="sm" onClick={addTag} disabled={!newTag.trim()}>
                      <Check className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {editedImage.tags?.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="w-2 h-2" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="transform" className="mt-4 space-y-4">
                {/* Warnung für echte Bildbearbeitung */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-xs text-amber-800">
                    <strong>⚠️ Echte Bildbearbeitung:</strong> Änderungen werden auf die Datei angewendet und gespeichert.
                  </p>
                </div>

                {/* Undo/Redo */}
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={undo}
                    disabled={historyIndex <= 0}
                    className="text-xs"
                  >
                    <Undo2 className="w-3 h-3 mr-1" />
                    Rückgängig
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={redo}
                    disabled={historyIndex >= transformHistory.length - 1}
                    className="text-xs"
                  >
                    <Redo2 className="w-3 h-3 mr-1" />
                    Wiederholen
                  </Button>
                </div>

                {/* Rotation */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <RotateCw className="w-3 h-3" />
                      Rotation: {transform.rotation}°
                    </label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => updateTransform({ rotation: transform.rotation + 90 })}
                      className="text-xs"
                    >
                      +90°
                    </Button>
                  </div>
                  <Slider
                    value={[transform.rotation]}
                    onValueChange={([value]) => updateTransform({ rotation: value })}
                    min={-180}
                    max={180}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Helligkeit */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Sun className="w-3 h-3" />
                      Helligkeit: {transform.brightness}%
                    </label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => updateTransform({ brightness: 100 })}
                      className="text-xs"
                    >
                      Reset
                    </Button>
                  </div>
                  <Slider
                    value={[transform.brightness]}
                    onValueChange={([value]) => updateTransform({ brightness: value })}
                    min={0}
                    max={200}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Kontrast */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Contrast className="w-3 h-3" />
                      Kontrast: {transform.contrast}%
                    </label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => updateTransform({ contrast: 100 })}
                      className="text-xs"
                    >
                      Reset
                    </Button>
                  </div>
                  <Slider
                    value={[transform.contrast]}
                    onValueChange={([value]) => updateTransform({ contrast: value })}
                    min={0}
                    max={200}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Sättigung */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Droplets className="w-3 h-3" />
                      Sättigung: {transform.saturation}%
                    </label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => updateTransform({ saturation: 100 })}
                      className="text-xs"
                    >
                      Reset
                    </Button>
                  </div>
                  <Slider
                    value={[transform.saturation]}
                    onValueChange={([value]) => updateTransform({ saturation: value })}
                    min={0}
                    max={200}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                {/* Optimierung */}
                <div>
                  <Button 
                    onClick={handleOptimize}
                    disabled={isEditing || image.optimized}
                    className="w-full sm:w-auto"
                    variant={image.optimized ? "secondary" : "default"}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {image.optimized ? 'Bereits optimiert' : 'Optimieren'}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="info" className="mt-4">
                <div className="space-y-3 text-sm">
                  <div className="flex flex-col space-y-1">
                    <span className="text-muted-foreground text-xs font-medium">Dateiname</span>
                    <p className="font-mono text-sm bg-muted/50 p-2 rounded truncate">{image.originalName}</p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-muted-foreground text-xs font-medium">Dateigröße</span>
                    <p className="text-sm bg-muted/50 p-2 rounded">{(image.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-muted-foreground text-xs font-medium">Format</span>
                    <p className="text-sm bg-muted/50 p-2 rounded">{image.originalFormat} → WebP</p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-muted-foreground text-xs font-medium">Dimensionen</span>
                    <p className="text-sm bg-muted/50 p-2 rounded">{image.width} × {image.height} Pixel</p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-muted-foreground text-xs font-medium">Upload-Datum</span>
                    <p className="text-sm bg-muted/50 p-2 rounded">{new Date(image.uploadedAt).toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-muted-foreground text-xs font-medium">Verzeichnis</span>
                    <p className="text-sm bg-muted/50 p-2 rounded">{image.directory || 'allgemein'}</p>
                  </div>
                </div>

                {/* Validierung */}
                {validationIssues.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Warnungen</span>
                    </div>
                    <div className="space-y-1">
                      {validationIssues.map((issue, index) => (
                        <div key={index} className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                          {issue}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Bildbereich unten */}
          <div className="flex-1 p-4 bg-black/5 flex items-center justify-center min-h-0">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Verstecktes Bild für Canvas */}
              <div style={{ display: 'none' }}>
                <Image
                  ref={imageRef}
                  src={image.thumbnailPath || image.path}
                  alt={image.altText || image.originalName}
                  width={image.width || 800}
                  height={image.height || 600}
                  unoptimized
                  crossOrigin="anonymous"
                />
              </div>
              
              {/* Canvas für Bildbearbeitung */}
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                style={{
                  filter: `brightness(${transform.brightness}%) contrast(${transform.contrast}%) saturate(${transform.saturation}%)`,
                  transform: `rotate(${transform.rotation}deg) scale(${transform.scale})`
                }}
              />
              
              {image.optimized && (
                <Badge className="absolute top-4 right-4 bg-green-500 text-white">
                  <Check className="w-3 h-3 mr-1" />
                  Optimiert
                </Badge>
              )}
            </div>
          </div>

          {/* Aktions-Buttons */}
          <div className="flex-shrink-0 flex justify-end gap-2 p-4 border-t bg-muted/30">
            <Button variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={isEditing}>
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? 'Speichere...' : 'Speichern'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 