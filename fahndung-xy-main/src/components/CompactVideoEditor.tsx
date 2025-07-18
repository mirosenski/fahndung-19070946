'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { X, Save, Scissors, Maximize2, Minimize2, Play, Pause, Volume2 } from 'lucide-react';
import { ImageMetadata } from '~/types';

interface CompactVideoEditorProps {
  media: ImageMetadata;
  onClose: () => void;
  onSave: (updatedMedia: Partial<ImageMetadata>) => void;
}

export function CompactVideoEditor({ media, onClose, onSave }: CompactVideoEditorProps) {
  const [activeTab, setActiveTab] = useState('edit');
  const [isEditing, setIsEditing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editedMedia, setEditedMedia] = useState<Partial<ImageMetadata>>({
    ...media
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // Video-Controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  // Speichern-Handler
  const handleSave = async () => {
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 z-50">
      <Card className={`w-full h-full max-w-7xl ${isFullscreen ? 'max-h-full' : 'max-h-[95vh]'} flex flex-col`}>
        {/* Header */}
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Scissors className="w-4 h-4 sm:w-5 sm:h-5" />
              Video bearbeiten
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="h-8 w-8 p-0"
              >
                {isFullscreen ? <Minimize2 /> : <Maximize2 />}
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="edit" className="text-xs sm:text-sm">Bearbeiten</TabsTrigger>
              <TabsTrigger value="trim" className="text-xs sm:text-sm">Schnitt</TabsTrigger>
              <TabsTrigger value="info" className="text-xs sm:text-sm">Info</TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="mt-4 space-y-4">
              {/* Video-Player */}
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={media.path}
                  className="w-full h-64 object-contain"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                
                {/* Video-Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={togglePlay}
                      className="text-white hover:text-white"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    
                    <div className="flex-1">
                      <input
                        type="range"
                        min={0}
                        max={duration}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full"
                      />
                    </div>
                    
                    <span className="text-white text-xs">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Video-Metadaten */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Titel</label>
                <Input
                  value={editedMedia.originalName || ''}
                  onChange={(e) => setEditedMedia(prev => ({ 
                    ...prev, 
                    originalName: e.target.value 
                  }))}
                  className="text-sm"
                />
              </div>

              {/* Lautstärke */}
              <div className="space-y-2">
                <label className="text-xs flex items-center gap-1">
                  <Volume2 className="w-3 h-3" />
                  Lautstärke
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full"
                />
              </div>
            </TabsContent>

            <TabsContent value="trim" className="mt-4 space-y-4">
              {/* Schnitt-Controls */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs">Startzeit (s)</label>
                  <Input
                    type="number"
                    min={0}
                    max={duration}
                    value={Math.floor(currentTime)}
                    onChange={(e) => {
                      const time = parseFloat(e.target.value);
                      if (videoRef.current) {
                        videoRef.current.currentTime = time;
                        setCurrentTime(time);
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs">Endzeit (s)</label>
                  <Input
                    type="number"
                    min={0}
                    max={duration}
                    value={Math.floor(duration)}
                    onChange={(e) => {
                      // Hier würde die Schnitt-Logik implementiert
                      console.log('Endzeit gesetzt:', e.target.value);
                    }}
                  />
                </div>

                <Button 
                  onClick={() => {
                    // Hier würde die Video-Schnitt-Logik implementiert
                    console.log('Video schneiden...');
                  }}
                  disabled={isEditing}
                  className="w-full"
                >
                  <Scissors className="w-4 h-4 mr-2" />
                  Video schneiden
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="info" className="mt-4 space-y-4">
              {/* Video-Informationen */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Dateiname:</span>
                  <span className="text-xs">{media.originalName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Größe:</span>
                  <span className="text-xs">{(media.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Format:</span>
                  <span className="text-xs">{media.originalFormat.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Länge:</span>
                  <span className="text-xs">{formatTime(duration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Verzeichnis:</span>
                  <span className="text-xs">{media.directory}</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer mit Aktionen */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={isEditing}>
              <Save className="w-4 h-4 mr-2" />
              Speichern
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 