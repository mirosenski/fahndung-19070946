'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { 
  Crop, 
  RotateCw, 
  X, 
  Check,
  Settings,
  Palette,
  RotateCcw,
  Undo2,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ImageMetadata } from '@/types';
import { toast } from 'sonner';

interface ImageEditorProps {
  image: ImageMetadata;
  onClose: () => void;
  onSave: (editedImage: ImageMetadata) => void;
}

interface EditState {
  rotation: number;
  zoom: number;
  brightness: number;
  contrast: number;
  saturation: number;
  filter: string;
  crop: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}

// Crop Controls Component
interface CropControlsProps {
  editState: EditState;
  setEditState: React.Dispatch<React.SetStateAction<EditState>>;
}

const CropControls = ({ editState, setEditState }: CropControlsProps) => {
  return (
    <Card>
      <CardContent className="p-2 sm:p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Zuschneiden</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditState(prev => ({ 
                ...prev, 
                crop: { x: 0, y: 0, width: 100, height: 100 } 
              }))}
              className="text-xs"
            >
              Quadrat (1:1)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditState(prev => ({ 
                ...prev, 
                crop: { x: 0, y: 0, width: 160, height: 90 } 
              }))}
              className="text-xs"
            >
              Widescreen (16:9)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditState(prev => ({ 
                ...prev, 
                crop: { x: 0, y: 0, width: 90, height: 160 } 
              }))}
              className="text-xs"
            >
              Portrait (9:16)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditState(prev => ({ 
                ...prev, 
                crop: null 
              }))}
              className="text-xs"
            >
              Zurücksetzen
            </Button>
          </div>
        </div>
        
        {editState.crop && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">X-Position</label>
                <Slider
                  value={[editState.crop.x]}
                  onValueChange={([value]) => setEditState(prev => ({
                    ...prev,
                    crop: prev.crop ? { ...prev.crop, x: value || 0 } : null
                  }))}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Y-Position</label>
                <Slider
                  value={[editState.crop.y]}
                  onValueChange={([value]) => setEditState(prev => ({
                    ...prev,
                    crop: prev.crop ? { ...prev.crop, y: value || 0 } : null
                  }))}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Breite</label>
                <Slider
                  value={[editState.crop.width]}
                  onValueChange={([value]) => setEditState(prev => ({
                    ...prev,
                    crop: prev.crop ? { ...prev.crop, width: value || 100 } : null
                  }))}
                  max={100}
                  min={10}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Höhe</label>
                <Slider
                  value={[editState.crop.height]}
                  onValueChange={([value]) => setEditState(prev => ({
                    ...prev,
                    crop: prev.crop ? { ...prev.crop, height: value || 100 } : null
                  }))}
                  max={100}
                  min={10}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export function ImageEditor({ image, onClose, onSave }: ImageEditorProps) {
  const [editState, setEditState] = useState<EditState>({
    rotation: 0,
    zoom: 1,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    filter: 'normal',
    crop: null
  });
  
  const [activeTab, setActiveTab] = useState<'adjust' | 'filters' | 'crop'>('adjust');
  const [useCanvas, setUseCanvas] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Apply filters to canvas
  const applyFilters = useCallback(() => {
    if (!canvasRef.current || !imageRef.current || !isImageLoaded) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = imageRef.current.naturalWidth;
    canvas.height = imageRef.current.naturalHeight;

    // Apply filters using canvas
    ctx.filter = `
      brightness(${editState.brightness}%) 
      contrast(${editState.contrast}%)
      ${editState.filter === 'grayscale' ? 'grayscale(100%)' : ''}
      ${editState.filter === 'sepia' ? 'sepia(100%)' : ''}
      ${editState.filter === 'vintage' ? 'sepia(50%) hue-rotate(30deg) brightness(110%)' : ''}
      ${editState.filter === 'cool' ? 'hue-rotate(-30deg) saturate(120%)' : ''}
      ${editState.filter === 'warm' ? 'hue-rotate(30deg) saturate(120%) brightness(110%)' : ''}
    `;
    
    ctx.drawImage(imageRef.current, 0, 0);
  }, [editState, isImageLoaded]);

  // Debounced filter application
  // const debouncedApplyFilters = useCallback(
  //   debounce(() => {
  //     if (canvasRef.current && imageRef.current && isImageLoaded) {
  //       applyFilters();
  //     }
  //   }, 100),
  //   [applyFilters, isImageLoaded]
  // );

  // Interactive crop handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current || activeTab !== 'crop') return;
    const rect = canvasRef.current.getBoundingClientRect();
    setIsDragging(true);
    setDragStart({
      x: (e.clientX - rect.left) / rect.width * 100,
      y: (e.clientY - rect.top) / rect.height * 100
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !canvasRef.current || activeTab !== 'crop') return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 100;
    const y = (e.clientY - rect.top) / rect.height * 100;
    
    setEditState(prev => ({
      ...prev,
      crop: {
        width: Math.abs(x - dragStart.x),
        height: Math.abs(y - dragStart.y),
        x: Math.min(x, dragStart.x),
        y: Math.min(y, dragStart.y)
      }
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Verwende die neue API-Route für Bildbearbeitung
      const response = await fetch(`/api/images/${image.id}/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          edits: {
            rotation: editState.rotation,
            brightness: editState.brightness,
            contrast: editState.contrast,
            saturation: editState.saturation,
            filter: editState.filter,
            crop: editState.crop
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Bild erfolgreich bearbeitet und gespeichert');
          
          // Übergebe die Server-Daten an die onSave-Callback
          if (data.editedImage) {
            onSave(data.editedImage);
          }
          
          onClose();
          return;
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Fehler beim Speichern des Bildes');
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      toast.error('Fehler beim Speichern des Bildes');
    } finally {
      setIsSaving(false);
    }
  };

  const resetFilters = () => {
    setEditState({
      rotation: 0,
      zoom: 1,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      filter: 'normal',
      crop: null
    });
  };

  const hasChanges = editState.crop || editState.filter !== 'normal' || editState.brightness !== 100 || editState.contrast !== 100 || editState.rotation !== 0;

  // Browser support check
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.OffscreenCanvas) {
      setUseCanvas(false);
    }
  }, []);

  // Optimized image loading
  useEffect(() => {
    if (imageRef.current?.complete) {
      setIsImageLoaded(true);
      applyFilters();
    }
  }, [applyFilters]);

  // Debounced filter updates
  useEffect(() => {
    const handler = setTimeout(() => {
      if (canvasRef.current && imageRef.current && isImageLoaded) {
        applyFilters();
      }
    }, 100);
    return () => clearTimeout(handler);
  }, [applyFilters, isImageLoaded]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <Card className="w-full max-w-7xl max-h-[95vh] overflow-hidden shadow-2xl border-border">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg font-semibold">Bild bearbeiten</CardTitle>
            {hasChanges && (
              <Badge variant="secondary" className="text-xs">
                <Check className="w-3 h-3 mr-1" />
                Bearbeitungen aktiv
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClose} 
              className="h-8 px-3"
              aria-label="Bildeditor schließen"
            >
              <X className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Schließen</span>
            </Button>
          </div>
        </CardHeader>

        <div className="flex flex-col lg:flex-row h-[calc(95vh-120px)]">
          {/* Editor Canvas */}
          <div 
            className="flex-1 p-2 sm:p-4 bg-muted/30 flex items-center justify-center min-h-[300px] lg:min-h-0"
            onMouseDown={activeTab === 'crop' ? handleMouseDown : undefined}
            onMouseMove={activeTab === 'crop' ? handleMouseMove : undefined}
            onMouseUp={activeTab === 'crop' ? handleMouseUp : undefined}
            onMouseLeave={activeTab === 'crop' ? handleMouseUp : undefined}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {useCanvas ? (
                <div className="relative max-w-full max-h-full">
                  <canvas
                    ref={canvasRef}
                    className="max-w-full max-h-full object-contain border border-border rounded-lg shadow-sm"
                    style={{
                      transform: `rotate(${editState.rotation}deg) scale(${editState.zoom})`,
                      transition: 'transform 0.2s ease'
                    }}
                  />
                  <Image
                    ref={imageRef}
                    src={image.path}
                    alt={image.altText || image.originalName}
                    className="hidden"
                    onLoad={() => {
                      setIsImageLoaded(true);
                      applyFilters();
                    }}
                    width={800}
                    height={600}
                  />
                  {editState.crop && (
                    <div
                      className="absolute border-2 border-primary bg-primary/20"
                      style={{
                        left: `${editState.crop.x}%`,
                        top: `${editState.crop.y}%`,
                        width: `${editState.crop.width}%`,
                        height: `${editState.crop.height}%`,
                        transform: `rotate(${editState.rotation}deg) scale(${editState.zoom})`
                      }}
                    >
                      <div className="absolute -top-1 -left-1 w-2 h-2 bg-primary rounded-full"></div>
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></div>
                      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary rounded-full"></div>
                      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative max-w-full max-h-full">
                  <Image
                    src={image.path}
                    alt={image.altText || image.originalName}
                    className="max-w-full max-h-full object-contain border border-border rounded-lg shadow-sm"
                    style={{
                      transform: `rotate(${editState.rotation}deg) scale(${editState.zoom})`,
                      transition: 'transform 0.2s ease',
                      filter: `
                        brightness(${editState.brightness}%) 
                        contrast(${editState.contrast}%)
                        ${editState.filter === 'grayscale' ? 'grayscale(100%)' : ''}
                        ${editState.filter === 'sepia' ? 'sepia(100%)' : ''}
                        ${editState.filter === 'vintage' ? 'sepia(50%) hue-rotate(30deg) brightness(110%)' : ''}
                        ${editState.filter === 'cool' ? 'hue-rotate(-30deg) saturate(120%)' : ''}
                        ${editState.filter === 'warm' ? 'hue-rotate(30deg) saturate(120%) brightness(110%)' : ''}
                      `
                    }}
                    onLoad={() => setIsImageLoaded(true)}
                    width={800}
                    height={600}
                  />
                  {editState.crop && (
                    <div
                      className="absolute border-2 border-primary bg-primary/20"
                      style={{
                        left: `${editState.crop.x}%`,
                        top: `${editState.crop.y}%`,
                        width: `${editState.crop.width}%`,
                        height: `${editState.crop.height}%`,
                        transform: `rotate(${editState.rotation}deg) scale(${editState.zoom})`
                      }}
                    >
                      <div className="absolute -top-1 -left-1 w-2 h-2 bg-primary rounded-full"></div>
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></div>
                      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary rounded-full"></div>
                      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Controls */}
          <div className="w-full lg:w-80 border-l border-border bg-card p-2 sm:p-4 space-y-4 overflow-y-auto max-h-[60vh] lg:max-h-none">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "adjust" | "filters" | "crop")} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="adjust" className="text-xs px-2">
                  <Settings className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Anpassen</span>
                  <span className="sm:hidden">Anpass</span>
                </TabsTrigger>
                <TabsTrigger value="filters" className="text-xs px-2">
                  <Palette className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Filter</span>
                  <span className="sm:hidden">Filter</span>
                </TabsTrigger>
                <TabsTrigger value="crop" className="text-xs px-2">
                  <Crop className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Zuschneiden</span>
                  <span className="sm:hidden">Crop</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="adjust" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="p-2 sm:p-4 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Helligkeit</label>
                      <Slider
                        value={[editState.brightness]}
                        onValueChange={([value]) => 
                          setEditState(prev => ({ ...prev, brightness: value || 100 }))
                        }
                        max={200}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">{editState.brightness}%</span>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Kontrast</label>
                      <Slider
                        value={[editState.contrast]}
                        onValueChange={([value]) => 
                          setEditState(prev => ({ ...prev, contrast: value || 100 }))
                        }
                        max={200}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">{editState.contrast}%</span>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Zoom</label>
                      <Slider
                        value={[editState.zoom * 100]}
                        onValueChange={([value]) => 
                          setEditState(prev => ({ ...prev, zoom: (value || 100) / 100 }))
                        }
                        max={300}
                        min={50}
                        step={1}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">{Math.round(editState.zoom * 100)}%</span>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditState(prev => ({ ...prev, rotation: prev.rotation - 90 }))}
                        className="text-xs"
                        aria-label="Bild nach links drehen"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Links
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditState(prev => ({ ...prev, rotation: prev.rotation + 90 }))}
                        className="text-xs"
                        aria-label="Bild nach rechts drehen"
                      >
                        <RotateCw className="w-3 h-3 mr-1" />
                        Rechts
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="filters" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="p-2 sm:p-4">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: 'Normal', value: 'normal' },
                        { name: 'Grayscale', value: 'grayscale' },
                        { name: 'Sepia', value: 'sepia' },
                        { name: 'Vintage', value: 'vintage' },
                        { name: 'Cool', value: 'cool' },
                        { name: 'Warm', value: 'warm' }
                      ].map((filter) => (
                        <Button
                          key={filter.value}
                          size="sm"
                          variant={editState.filter === filter.value ? 'default' : 'outline'}
                          className="text-xs"
                          onClick={() => setEditState(prev => ({ ...prev, filter: filter.value }))}
                          aria-label={`Filter ${filter.name} anwenden`}
                        >
                          {filter.name}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="crop" className="space-y-4 mt-4">
                <CropControls editState={editState} setEditState={setEditState} />
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="flex-1"
                disabled={!hasChanges}
              >
                <Undo2 className="w-4 h-4 mr-2" />
                Zurücksetzen
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                className="flex-1"
                disabled={isSaving || !hasChanges}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Speichere...' : 'Speichern'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 