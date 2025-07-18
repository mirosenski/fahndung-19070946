'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { 
  Trash2, 
  Folder, 
  Move, 
  Grid3x3, 
  List,
  Edit3,
  MoreHorizontal,
  CheckCircle,
  Circle,
  Zap,
  Calendar,
  HardDrive
} from 'lucide-react';
import { ImageMetadata } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ImageGalleryProps {
  images: ImageMetadata[];
  onImageDelete: (id: string) => void;
  onImageClick: (image: ImageMetadata) => void;
  directories?: string[];
  onImageMove?: (imageId: string, targetDirectory: string) => void;
  onImageEdit?: (imageId: string) => void;
  onImageOptimize?: (imageId: string) => void;
}

type LayoutType = 'grid' | 'compact-list';

export default function ImageGallery({ 
  images, 
  onImageDelete, 
  onImageClick, 
  directories = [],
  onImageMove,
  onImageEdit,
  onImageOptimize
}: ImageGalleryProps) {
  const [layout, setLayout] = useState<LayoutType>('compact-list');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const handleImageClick = (image: ImageMetadata) => {
    if (selectedImages.length > 0) {
      // Wenn Bilder ausgewählt sind, nur Auswahl umschalten
      toggleSelection(image.id);
    } else {
      // Sonst Bild öffnen
      onImageClick(image);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bild wirklich löschen?')) {
      try {
        const response = await fetch(`/api/images/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          onImageDelete(id);
          setSelectedImages(prev => prev.filter(imgId => imgId !== id));
          toast.success('Bild gelöscht');
        }
      } catch {
        toast.error('Fehler beim Löschen');
      }
    }
  };

  const handleMove = async (imageId: string, targetDirectory: string) => {
    try {
      const response = await fetch('/api/images/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId, targetDirectory })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Bild nach "${targetDirectory}" verschoben`);
        onImageMove?.(imageId, targetDirectory);
        setSelectedImages(prev => prev.filter(id => id !== imageId));
      } else {
        toast.error(data.error || 'Fehler beim Verschieben');
      }
    } catch {
      toast.error('Fehler beim Verschieben des Bildes');
    }
  };

  const handleBulkMove = async (targetDirectory: string) => {
    try {
      const promises = selectedImages.map(imageId => 
        fetch('/api/images/move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageId, targetDirectory })
        })
      );
      
      await Promise.all(promises);
      toast.success(`${selectedImages.length} Bilder nach "${targetDirectory}" verschoben`);
      selectedImages.forEach(id => onImageMove?.(id, targetDirectory));
      setSelectedImages([]);
    } catch {
      toast.error('Fehler beim Verschieben der Bilder');
    }
  };

  const toggleSelection = (imageId: string) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const selectAll = () => {
    setSelectedImages(images.map(img => img.id));
  };

  const deselectAll = () => {
    setSelectedImages([]);
  };

  const handleBulkDelete = async () => {
    if (confirm(`${selectedImages.length} Bilder wirklich löschen?`)) {
      try {
        const promises = selectedImages.map(id => 
          fetch(`/api/images/${id}`, { method: 'DELETE' })
        );
        await Promise.all(promises);
        
        selectedImages.forEach(id => onImageDelete(id));
        setSelectedImages([]);
        toast.success(`${selectedImages.length} Bilder gelöscht`);
      } catch {
        toast.error('Fehler beim Löschen der Bilder');
      }
    }
  };

  const handleBulkEdit = () => {
    if (selectedImages.length === 1) {
      const imageId = selectedImages[0];
      if (imageId) {
        onImageEdit?.(imageId);
      }
    } else {
      toast.info('Bitte wählen Sie nur ein Bild zum Bearbeiten aus');
    }
  };

  // Drag & Drop Handlers
  const handleDragStart = useCallback((e: React.DragEvent, imageId: string) => {
    e.dataTransfer.setData('text/plain', imageId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const ImageCard = ({ image, isSelected, className = "", layout = 'grid' }: { 
    image: ImageMetadata; 
    isSelected: boolean;
    className?: string;
    layout?: LayoutType;
  }) => (
    <div
      className={`group relative bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer ${
        isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
      } ${className} ${layout === 'compact-list' ? 'flex items-center space-x-3 p-2' : ''}`}
      onClick={() => handleImageClick(image)}
      draggable
      onDragStart={(e) => handleDragStart(e, image.id)}
      onDragOver={handleDragOver}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-2 left-2 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSelection(image.id);
          }}
          className={`p-1 rounded-full transition-all ${
            isSelected 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-background/80 text-muted-foreground hover:bg-primary/20'
          }`}
        >
          {isSelected ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <Circle className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Action Menu */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 bg-background/80 hover:bg-background"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onImageEdit?.(image.id);
            }}>
              <Edit3 className="w-4 h-4 mr-2" />
              Bearbeiten
            </DropdownMenuItem>
            {onImageOptimize && (
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onImageOptimize(image.id);
              }}>
                <Zap className="w-4 h-4 mr-2" />
                Optimieren
              </DropdownMenuItem>
            )}
            {directories.length > 0 && (
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                const targetDir = directories.find(d => d !== image.directory);
                if (targetDir) handleMove(image.id, targetDir);
              }}>
                <Move className="w-4 h-4 mr-2" />
                Verschieben
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(image.id);
              }}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Löschen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Image */}
      <div className={`relative overflow-hidden ${layout === 'compact-list' ? 'w-12 h-12 flex-shrink-0' : 'aspect-square'}`}>
        <Image
          src={image.thumbnailPath || image.path}
          alt={image.altText || image.originalName}
          fill
          className="object-cover"
          sizes={layout === 'compact-list' ? '48px' : '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw'}
        />
        {image.optimized && layout !== 'compact-list' && (
          <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded">
            <Zap className="w-3 h-3" />
          </div>
        )}
      </div>
      
      <div className={`${layout === 'compact-list' ? 'flex-1 min-w-0' : 'p-3'}`}>
        <div className="text-sm font-medium text-foreground truncate">
          {image.originalName}
        </div>
        <div className="text-xs text-muted-foreground flex items-center space-x-1">
          <span>{formatFileSize(image.size)} • {image.originalFormat.toUpperCase()} → WebP</span>
          {image.directory && image.directory !== 'allgemein' && (
            <>
              <span>•</span>
              <Folder className="w-3 h-3" />
              <span>{image.directory}</span>
            </>
          )}
        </div>
        {layout === 'compact-list' && (
          <div className="flex items-center space-x-2 mt-1">
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(image.uploadedAt)}</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <HardDrive className="w-3 h-3" />
              <span>{formatFileSize(image.size)}</span>
            </div>
            {image.optimized && (
              <div className="flex items-center space-x-1 text-xs text-green-600">
                <Zap className="w-3 h-3" />
                <span>Optimiert</span>
              </div>
            )}
          </div>
        )}
        {image.tags.length > 0 && layout !== 'compact-list' && (
          <div className="mt-2 flex flex-wrap gap-1">
            {image.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {image.tags.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{image.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderLayout = () => {
    switch (layout) {
      case 'compact-list':
        return (
          <div className="space-y-1">
            {images.map((image) => (
              <ImageCard 
                key={image.id} 
                image={image} 
                isSelected={selectedImages.includes(image.id)}
                layout="compact-list"
                className="w-full"
              />
            ))}
          </div>
        );

      default: // grid
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-4">
            {images.map((image) => (
              <ImageCard 
                key={image.id} 
                image={image} 
                isSelected={selectedImages.includes(image.id)}
                className="h-auto max-w-full rounded-lg"
              />
            ))}
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {/* Layout Switcher und Bulk Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={layout === 'grid' ? 'default' : 'outline'}
            onClick={() => setLayout('grid')}
          >
            <Grid3x3 className="w-4 h-4 mr-2" />
            Grid
          </Button>
          <Button
            size="sm"
            variant={layout === 'compact-list' ? 'default' : 'outline'}
            onClick={() => setLayout('compact-list')}
          >
            <List className="w-4 h-4 mr-2" />
            Kompakt
          </Button>
        </div>
        
        {selectedImages.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg">
            <span className="text-sm font-medium">{selectedImages.length} ausgewählt</span>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={selectAll}
              >
                Alle auswählen
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={deselectAll}
              >
                Auswahl aufheben
              </Button>
            </div>
          </div>
        )}
      </div>

      {renderLayout()}

      {/* Bottom Action Bar */}
      {selectedImages.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-50">
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedImages.length} Bild{selectedImages.length > 1 ? 'er' : ''} ausgewählt
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {selectedImages.length === 1 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkEdit}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Bearbeiten
                </Button>
              )}
              
              {directories.length > 0 && (
                <Select onValueChange={handleBulkMove}>
                  <SelectTrigger className="w-auto">
                    <Move className="w-4 h-4 mr-2" />
                    Verschieben
                  </SelectTrigger>
                  <SelectContent>
                    {directories.map((directory) => (
                      <SelectItem key={directory} value={directory}>
                        Nach {directory}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Löschen
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={deselectAll}
              >
                Abbrechen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 