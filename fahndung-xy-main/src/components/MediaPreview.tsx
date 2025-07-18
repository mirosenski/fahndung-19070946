'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { X, Maximize2, Minimize2, Play, Pause, Download, Share2 } from 'lucide-react';
import { ImageMetadata } from '~/types';

interface MediaPreviewProps {
  media: ImageMetadata;
  onClose: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function MediaPreview({ media, onClose, onEdit, onDelete }: MediaPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isVideo = media.mimeType.startsWith('video/');

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



  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 z-50">
      <Card className={`w-full h-full max-w-6xl ${isFullscreen ? 'max-h-full' : 'max-h-[95vh]'} flex flex-col`}>
        {/* Header */}
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              {media.originalName}
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
          {/* Medien-Vorschau */}
          <div className="flex-1 flex items-center justify-center bg-black p-4">
            {isVideo ? (
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  src={media.path}
                  className="w-full h-full object-contain"
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
            ) : (
              <Image
                src={media.path}
                alt={media.altText || media.originalName}
                width={media.width || 800}
                height={media.height || 600}
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>

          {/* Medien-Informationen */}
          <div className="p-4 border-t bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Metadaten */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Dateiname:</span>
                  <span className="text-sm font-medium">{media.originalName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Größe:</span>
                  <span className="text-sm">{formatFileSize(media.size)}</span>
                </div>
                {media.width && media.height && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Auflösung:</span>
                    <span className="text-sm">{media.width}×{media.height}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Format:</span>
                  <span className="text-sm">{media.originalFormat.toUpperCase()}</span>
                </div>
                {media.directory && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Verzeichnis:</span>
                    <span className="text-sm">{media.directory}</span>
                  </div>
                )}
                {isVideo && duration > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Länge:</span>
                    <span className="text-sm">{formatTime(duration)}</span>
                  </div>
                )}
              </div>

              {/* Tags und Aktionen */}
              <div className="space-y-2">
                {media.tags && media.tags.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {media.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Aktionen */}
                <div className="flex items-center gap-2 pt-2">
                  {onEdit && (
                    <Button size="sm" onClick={() => onEdit(media.id)}>
                      Bearbeiten
                    </Button>
                  )}
                  {onDelete && (
                    <Button size="sm" variant="destructive" onClick={() => onDelete(media.id)}>
                      Löschen
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    Teilen
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 