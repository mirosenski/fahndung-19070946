import React, { useRef, useState, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { 
  Upload, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Move
} from "lucide-react";
import Image from "next/image";

interface CardImageEditorProps {
  imageUrl: string;
  title: string;
  location: string;
  status: string;
  priority: string;
  onImageChange?: (file: File) => void;
  onPositionChange?: (position: { x: number; y: number }) => void;
  onZoomChange?: (zoom: number) => void;
  onReset?: () => void;
}

export const CardImageEditor = ({
  imageUrl,
  title,
  location,
  status,
  priority,
  onImageChange,
  onPositionChange,
  onZoomChange,
  onReset
}: CardImageEditorProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  // Drag & Drop Handler
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!imageRef.current) return;
    
    setDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    
    e.preventDefault();
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging || !cardRef.current) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Begrenzung auf Container (289x386px Karte, 256x256px Bild)
    const maxX = 0;
    const maxY = 0;
    const minX = -(256 * zoom - 289);
    const minY = -(256 * zoom - 386);

    const clampedX = Math.max(Math.min(newX, maxX), minX);
    const clampedY = Math.max(Math.min(newY, maxY), minY);

    const newPosition = { x: clampedX, y: clampedY };
    setPosition(newPosition);
    onPositionChange?.(newPosition);
  }, [dragging, dragStart, zoom, onPositionChange]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  // Event Listeners für Drag & Drop
  React.useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, handleMouseMove, handleMouseUp]);

  // Zoom Handler
  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 0.1, 2);
    setZoom(newZoom);
    onZoomChange?.(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 0.1, 0.5);
    setZoom(newZoom);
    onZoomChange?.(newZoom);
  };

  // Reset Handler
  const handleReset = () => {
    setPosition({ x: 0, y: 0 });
    setZoom(1);
    onReset?.();
  };

  // File Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onImageChange) {
      onImageChange(e.target.files[0]);
    }
  };

  // Status Badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge variant="default">Veröffentlicht</Badge>;
      case "DRAFT":
        return <Badge variant="secondary">Entwurf</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Priority Badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <Badge variant="destructive">EILFAHNDUNG</Badge>;
      case "NEW":
        return <Badge variant="default">NEU</Badge>;
      default:
        return <Badge variant="secondary">NORMAL</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Karten-Vorschau */}
      <Card className="w-fit">
        <CardHeader>
          <CardTitle className="text-sm">Karten-Vorschau</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={cardRef}
            className="relative w-[289px] h-[386px] rounded-[15px] border border-solid border-[#c7c7c7] backdrop-blur-[50px] backdrop-brightness-[100%] bg-[linear-gradient(0deg,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0.4)_100%)] overflow-hidden"
          >
            {/* Bild-Container */}
            <div
              ref={imageRef}
              className="absolute w-[256px] h-[256px] top-1/2 left-1/2"
              style={{
                transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                cursor: dragging ? "grabbing" : "grab",
              }}
              onMouseDown={handleMouseDown}
            >
              <Image
                src={imageUrl}
                alt={title}
                width={256}
                height={256}
                className="object-cover w-full h-full rounded-[10px] shadow-lg"
                draggable={false}
              />
            </div>

            {/* Overlay für Status und Informationen */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
              <div className="flex items-center gap-2 mb-2">
                {getStatusBadge(status)}
                {getPriorityBadge(priority)}
              </div>
              <div className="text-white text-sm mb-1">
                {location} | {new Date().toLocaleDateString('de-DE')}
              </div>
              <div className="text-white font-bold text-lg">
                {title}
              </div>
            </div>

            {/* Drag-Hinweis */}
            {!dragging && (
              <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                <Move className="w-3 h-3 inline mr-1" />
                Ziehen zum Verschieben
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Steuerungselemente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Bild-Steuerung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bild ersetzen */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Bild ersetzen</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Neues Bild auswählen
              </Button>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Zoom-Steuerung */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Zoom: {Math.round(zoom * 100)}%</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <div className="flex-1 bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${((zoom - 0.5) / 1.5) * 100}%` }}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 2}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Position-Reset */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Position zurücksetzen</label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Zurücksetzen
            </Button>
          </div>

          {/* Aktuelle Position anzeigen */}
          <div className="text-xs text-muted-foreground">
            Position: X: {Math.round(position.x)}px, Y: {Math.round(position.y)}px
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 