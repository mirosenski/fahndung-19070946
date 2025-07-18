'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { X, Save, RotateCw, Filter } from 'lucide-react';
import { MediaMetadata, MediaEdits } from '~/types';
import { validateMediaConversion } from '~/utils/imageConversion';

interface EnhancedImageEditorProps {
  media: MediaMetadata;
  onClose: () => void;
  onSave: (updatedMedia: Partial<MediaMetadata>) => void;
}

export function EnhancedImageEditor({ media, onClose, onSave }: EnhancedImageEditorProps) {
  const [activeTab, setActiveTab] = useState<'adjust' | 'filters' | 'crop'>('adjust');
  const [isEditing, setIsEditing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editedMedia, setEditedMedia] = useState<Partial<MediaMetadata>>({
    ...media,
    edits: media.edits || {}
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Bild-Validierung
  const validateMedia = useCallback(() => {
    const issues = validateMediaConversion(editedMedia as MediaMetadata, editedMedia.edits || {});
    return issues.isValid;
  }, [editedMedia]);

  // Speichern-Handler
  const handleSave = async () => {
    if (!validateMedia()) return;
    
    setIsEditing(true);
    try {
      await onSave(editedMedia);
      onClose();
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    } finally {
      setIsEditing(false);
    }
  };

  // Transformation-Handler
  const updateEdit = useCallback((key: keyof MediaEdits, value: number | string | { x: number; y: number; width: number; height: number }) => {
    setEditedMedia(prev => ({
      ...prev,
      edits: {
        ...prev.edits,
        [key]: value
      }
    }));
  }, []);

  // Canvas-basierte Vorschau
  const applyFilters = useCallback(() => {
    if (!canvasRef.current || !imageRef.current || !isImageLoaded) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = imageRef.current.naturalWidth;
    canvas.height = imageRef.current.naturalHeight;

    const edits = editedMedia.edits || {};
    
    // Apply filters using canvas
    ctx.filter = `
      brightness(${edits.brightness || 100}%) 
      contrast(${edits.contrast || 100}%)
      ${edits.filter === 'grayscale' ? 'grayscale(100%)' : ''}
      ${edits.filter === 'sepia' ? 'sepia(100%)' : ''}
      ${edits.filter === 'vintage' ? 'sepia(50%) hue-rotate(30deg) brightness(110%)' : ''}
      ${edits.filter === 'cool' ? 'hue-rotate(-30deg) saturate(120%)' : ''}
      ${edits.filter === 'warm' ? 'hue-rotate(30deg) saturate(120%) brightness(110%)' : ''}
    `;
    
    ctx.drawImage(imageRef.current, 0, 0);
  }, [editedMedia.edits, isImageLoaded]);

  // Reset filters
  const resetFilters = () => {
    setEditedMedia(prev => ({
      ...prev,
      edits: {
        rotation: 0,
        brightness: 100,
        contrast: 100,
        saturation: 100,
        filter: 'normal',
        crop: undefined
      }
    }));
  };

  // Check for changes
  const hasChanges = editedMedia.edits && (
    editedMedia.edits.rotation !== 0 ||
    editedMedia.edits.brightness !== 100 ||
    editedMedia.edits.contrast !== 100 ||
    editedMedia.edits.saturation !== 100 ||
    editedMedia.edits.filter !== 'normal' ||
    editedMedia.edits.crop
  );

  // Apply filters when edits change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 z-50">
      <Card className={`w-full h-full max-w-7xl ${isFullscreen ? 'max-h-full' : 'max-h-[95vh]'} flex flex-col`}>
        {/* Header */}
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
              Bild bearbeiten
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="h-8 w-8 p-0"
              >
                {isFullscreen ? '⊖' : '⊕'}
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

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'adjust' | 'filters' | 'crop')} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="adjust" className="text-xs sm:text-sm">Anpassen</TabsTrigger>
              <TabsTrigger value="filters" className="text-xs sm:text-sm">Filter</TabsTrigger>
              <TabsTrigger value="crop" className="text-xs sm:text-sm">Zuschneiden</TabsTrigger>
            </TabsList>

            <TabsContent value="adjust" className="mt-4 space-y-4">
              {/* Rotation */}
              <div className="space-y-2">
                <label className="text-xs font-medium">Rotation</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateEdit('rotation', (editedMedia.edits?.rotation || 0) - 90)}
                    className="text-xs"
                  >
                    <RotateCw className="w-3 h-3 mr-1" />
                    -90°
                  </Button>
                  <span className="text-sm">{(editedMedia.edits?.rotation || 0)}°</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateEdit('rotation', (editedMedia.edits?.rotation || 0) + 90)}
                    className="text-xs"
                  >
                    <RotateCw className="w-3 h-3 mr-1" />
                    +90°
                  </Button>
                </div>
              </div>

              {/* Helligkeit */}
              <div className="space-y-2">
                <label className="text-xs font-medium">Helligkeit</label>
                <input 
                  type="range" 
                  min="0" 
                  max="200" 
                  value={editedMedia.edits?.brightness || 100}
                  onChange={(e) => updateEdit('brightness', parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">{(editedMedia.edits?.brightness || 100)}%</span>
              </div>

              {/* Kontrast */}
              <div className="space-y-2">
                <label className="text-xs font-medium">Kontrast</label>
                <input 
                  type="range" 
                  min="0" 
                  max="200" 
                  value={editedMedia.edits?.contrast || 100}
                  onChange={(e) => updateEdit('contrast', parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">{(editedMedia.edits?.contrast || 100)}%</span>
              </div>

              {/* Sättigung */}
              <div className="space-y-2">
                <label className="text-xs font-medium">Sättigung</label>
                <input 
                  type="range" 
                  min="0" 
                  max="200" 
                  value={editedMedia.edits?.saturation || 100}
                  onChange={(e) => updateEdit('saturation', parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">{(editedMedia.edits?.saturation || 100)}%</span>
              </div>
            </TabsContent>

            <TabsContent value="filters" className="mt-4 space-y-4">
              {/* Filter-Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={editedMedia.edits?.filter === 'normal' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateEdit('filter', 'normal')}
                  className="text-xs"
                >
                  Normal
                </Button>
                <Button
                  variant={editedMedia.edits?.filter === 'grayscale' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateEdit('filter', 'grayscale')}
                  className="text-xs"
                >
                  Graustufen
                </Button>
                <Button
                  variant={editedMedia.edits?.filter === 'sepia' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateEdit('filter', 'sepia')}
                  className="text-xs"
                >
                  Sepia
                </Button>
                <Button
                  variant={editedMedia.edits?.filter === 'vintage' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateEdit('filter', 'vintage')}
                  className="text-xs"
                >
                  Vintage
                </Button>
                <Button
                  variant={editedMedia.edits?.filter === 'cool' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateEdit('filter', 'cool')}
                  className="text-xs"
                >
                  Cool
                </Button>
                <Button
                  variant={editedMedia.edits?.filter === 'warm' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateEdit('filter', 'warm')}
                  className="text-xs"
                >
                  Warm
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="crop" className="mt-4 space-y-4">
              {/* Zuschneiden-Controls */}
              <div className="space-y-2">
                <label className="text-xs font-medium">Zuschneiden</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs">X-Position (%)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={editedMedia.edits?.crop?.x || 0}
                      onChange={(e) => updateEdit('crop', {
                        x: parseFloat(e.target.value),
                        y: editedMedia.edits?.crop?.y || 0,
                        width: editedMedia.edits?.crop?.width || 100,
                        height: editedMedia.edits?.crop?.height || 100
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-xs">Y-Position (%)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={editedMedia.edits?.crop?.y || 0}
                      onChange={(e) => updateEdit('crop', {
                        x: editedMedia.edits?.crop?.x || 0,
                        y: parseFloat(e.target.value),
                        width: editedMedia.edits?.crop?.width || 100,
                        height: editedMedia.edits?.crop?.height || 100
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-xs">Breite (%)</label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={editedMedia.edits?.crop?.width || 100}
                      onChange={(e) => updateEdit('crop', {
                        x: editedMedia.edits?.crop?.x || 0,
                        y: editedMedia.edits?.crop?.y || 0,
                        width: parseFloat(e.target.value),
                        height: editedMedia.edits?.crop?.height || 100
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-xs">Höhe (%)</label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={editedMedia.edits?.crop?.height || 100}
                      onChange={(e) => updateEdit('crop', {
                        x: editedMedia.edits?.crop?.x || 0,
                        y: editedMedia.edits?.crop?.y || 0,
                        width: editedMedia.edits?.crop?.width || 100,
                        height: parseFloat(e.target.value)
                      })}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Bild-Preview */}
          <div className="flex-1 p-4 bg-black/5 flex items-center justify-center min-h-0">
            <div className="relative max-w-full max-h-full">
              <Image
                ref={imageRef}
                src={media.path}
                alt={media.altText || media.originalName}
                width={media.width || 800}
                height={media.height || 600}
                className="max-w-full max-h-full object-contain border border-border rounded-lg shadow-sm"
                style={{
                  transform: `rotate(${editedMedia.edits?.rotation || 0}deg)`,
                  transition: 'transform 0.2s ease',
                  filter: `
                    brightness(${editedMedia.edits?.brightness || 100}%) 
                    contrast(${editedMedia.edits?.contrast || 100}%)
                    ${editedMedia.edits?.filter === 'grayscale' ? 'grayscale(100%)' : ''}
                    ${editedMedia.edits?.filter === 'sepia' ? 'sepia(100%)' : ''}
                    ${editedMedia.edits?.filter === 'vintage' ? 'sepia(50%) hue-rotate(30deg) brightness(110%)' : ''}
                    ${editedMedia.edits?.filter === 'cool' ? 'hue-rotate(-30deg) saturate(120%)' : ''}
                    ${editedMedia.edits?.filter === 'warm' ? 'hue-rotate(30deg) saturate(120%) brightness(110%)' : ''}
                  `
                }}
                onLoad={() => setIsImageLoaded(true)}
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 opacity-0 pointer-events-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0 flex justify-between items-center gap-2 p-4 border-t bg-muted/30">
            <Button variant="outline" onClick={resetFilters}>
              Zurücksetzen
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Abbrechen
              </Button>
              <Button onClick={handleSave} disabled={isEditing || !hasChanges}>
                <Save className="w-4 h-4 mr-2" />
                Speichern
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 