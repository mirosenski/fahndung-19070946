'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Edit, Save, Camera, MapPin, Calendar, FileText, Image as ImageIcon, Palette, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ImageMetadata } from '@/types';
import { ImageEditor } from '@/components/ImageEditor/ImageEditor';
import { toast } from 'sonner';

interface ImagePreviewProps {
  image: ImageMetadata;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<ImageMetadata>) => void;
}

export default function ImagePreview({ image, onClose, onUpdate }: ImagePreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [currentImage, setCurrentImage] = useState(image);
  const [editingData, setEditingData] = useState({
    filename: image.originalName,
    altText: image.altText || '',
    description: image.description || '',
    tags: image.tags.join(', ')
  });
  const [isOptimizing, setIsOptimizing] = useState(false);

  const reloadImage = async () => {
    try {
      const response = await fetch(`/api/images/${image.id}`);
      const data = await response.json();
      if (data.success && data.image) {
        setCurrentImage(data.image);
        onUpdate(image.id, data.image);
      }
    } catch (error) {
      console.error('Fehler beim Nachladen des Bildes:', error);
    }
  };

  const handleSave = async () => {
    const tags = editingData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    try {
      const response = await fetch(`/api/images/${image.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: editingData.filename,
          altText: editingData.altText,
          description: editingData.description,
          tags
        }),
      });

      if (response.ok) {
        await reloadImage();
        setIsEditing(false);
        toast.success('Bildinformationen erfolgreich gespeichert');
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
      toast.error('Fehler beim Speichern der Bildinformationen');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleOptimize = async () => {
    if (currentImage.optimized) {
      toast.info('Bild ist bereits optimiert');
      return;
    }

    setIsOptimizing(true);
    try {
      const response = await fetch(`/api/admin/optimize-images/${currentImage.id}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Bild erfolgreich optimiert');
        await reloadImage();
      } else {
        toast.error(data.error || 'Fehler bei der Optimierung');
      }
    } catch (error) {
      console.error('Optimierungsfehler:', error);
      toast.error('Fehler bei der Optimierung');
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-7xl max-h-[95vh] overflow-hidden shadow-2xl border-border">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg font-semibold">{currentImage.originalName}</CardTitle>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            {!isEditing && (
              <>
                <Button
                  onClick={() => setShowImageEditor(true)}
                  size="sm"
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  <Palette className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Bild bearbeiten</span>
                  <span className="sm:hidden">Bearbeiten</span>
                </Button>
                <Button
                  onClick={() => setIsEditing(true)}
                  size="sm"
                  variant="outline"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Metadaten</span>
                  <span className="sm:hidden">Meta</span>
                </Button>
                {!currentImage.optimized && (
                  <Button
                    onClick={handleOptimize}
                    disabled={isOptimizing}
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">
                      {isOptimizing ? 'Optimiere...' : 'Optimieren'}
                    </span>
                    <span className="sm:hidden">
                      {isOptimizing ? '...' : 'Opt'}
                    </span>
                  </Button>
                )}
              </>
            )}
            {isEditing && (
              <Button
                onClick={handleSave}
                size="sm"
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Speichern
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
            {/* Bildvorschau */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-0">
                  <div className="relative bg-muted/30 rounded-lg overflow-hidden">
                    <Image
                      src={`${currentImage.path}?v=${Date.now()}`}
                      alt={currentImage.altText || currentImage.originalName}
                      width={800}
                      height={600}
                      className="w-full h-auto"
                      priority
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Bildinformationen */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Bildinformationen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {currentImage.width} × {currentImage.height} px
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {formatFileSize(currentImage.size)} • {currentImage.originalFormat.toUpperCase()} → WebP
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Hochgeladen: {formatDate(currentImage.uploadedAt)}
                    </span>
                  </div>

                  {currentImage.exifData?.camera && (
                    <>
                      <Separator />
                      <div className="flex items-center space-x-2">
                        <Camera className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {currentImage.exifData.camera}
                        </span>
                      </div>
                    </>
                  )}

                  {currentImage.exifData?.location && (
                    <>
                      <Separator />
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {currentImage.exifData.location.latitude}, {currentImage.exifData.location.longitude}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Bearbeitungsbereich */}
            <div className="space-y-6">
              {/* Dateiname */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Dateiname</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Input
                      value={editingData.filename}
                      onChange={(e) => setEditingData(prev => ({ ...prev, filename: e.target.value }))}
                      placeholder="Dateiname eingeben..."
                      className="w-full"
                    />
                  ) : (
                    <div className="p-3 bg-muted/50 rounded-md text-foreground text-sm font-mono">
                      {image.originalName}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Alt-Text */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Alt-Text (für Barrierefreiheit)</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={editingData.altText}
                      onChange={(e) => setEditingData(prev => ({ ...prev, altText: e.target.value }))}
                      placeholder="Beschreiben Sie das Bild für Screen Reader..."
                      className="min-h-[80px]"
                    />
                  ) : (
                    <div className="p-3 bg-muted/50 rounded-md text-foreground text-sm">
                      {image.altText || 'Kein Alt-Text vorhanden'}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Beschreibung */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Beschreibung</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={editingData.description}
                      onChange={(e) => setEditingData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Fügen Sie eine Beschreibung hinzu..."
                      className="min-h-[80px]"
                    />
                  ) : (
                    <div className="p-3 bg-muted/50 rounded-md text-foreground text-sm">
                      {image.description || 'Keine Beschreibung vorhanden'}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={editingData.tags}
                      onChange={(e) => setEditingData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="Tags durch Kommas getrennt..."
                      className="min-h-[60px]"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {image.tags.length > 0 ? (
                        image.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">Keine Tags vorhanden</span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Bearbeitungsaktionen */}
              {isEditing && (
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex space-x-2">
                      <Button onClick={handleSave} className="flex-1">
                        <Save className="w-4 h-4 mr-2" />
                        Speichern
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsEditing(false);
                          setEditingData({
                            filename: image.originalName,
                            altText: image.altText || '',
                            description: image.description || '',
                            tags: image.tags.join(', ')
                          });
                        }}
                        className="flex-1"
                      >
                        Abbrechen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Image Editor Modal */}
      {showImageEditor && (
        <ImageEditor
          image={image}
          onClose={() => setShowImageEditor(false)}
          onSave={(editedImage) => {
            console.log('Bild bearbeitet:', editedImage);
            
            // Aktualisiere die Vorschau sofort mit den Server-Daten
            if (editedImage) {
              // Aktualisiere die Galerie mit dem bearbeiteten Bild
              onUpdate(image.id, editedImage);
              
              // Aktualisiere die Vorschau sofort
              setCurrentImage(editedImage);
              
              // Zeige Erfolgsmeldung
              toast.success('Bild erfolgreich bearbeitet und gespeichert');
              
              // Schließe nur den Editor, nicht die Vorschau
              setShowImageEditor(false);
            } else {
              toast.error('Bearbeitetes Bild konnte nicht gefunden werden');
            }
          }}
        />
      )}
    </div>
  );
} 