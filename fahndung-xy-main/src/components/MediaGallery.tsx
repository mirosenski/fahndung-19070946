'use client';

import React, { useState } from 'react';
import { Play, Image, Video, File, Edit, Trash2, Eye, Search, Filter, CheckSquare, Square, Grid3X3, List, ChevronDown } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Input } from '~/components/ui/input';
import { ImageMetadata } from '~/types';
import NextImage from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

interface MediaGalleryProps {
  media: ImageMetadata[];
  onMediaDelete?: (id: string) => void;
  onMediaEdit?: (id: string) => void;
  onMediaPreview?: (media: ImageMetadata) => void;
  onBatchDelete?: (ids: string[]) => void;
  onBatchMove?: (ids: string[], targetDirectory: string) => void;
  directories?: string[];
  selectedDirectory?: string;
  onDirectoryChange?: (directory: string) => void;
}

export function MediaGallery({ 
  media, 
  onMediaDelete, 
  onMediaEdit,
  onMediaPreview,
  onBatchDelete,
  onBatchMove,
  directories = [],
  selectedDirectory = 'allgemein',
  onDirectoryChange
}: MediaGalleryProps) {
  const [hoveredMedia, setHoveredMedia] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Verfügbare Tags und Formate extrahieren
  const availableTags = Array.from(new Set(media.flatMap(item => item.tags || [])));
  const availableFormats = Array.from(new Set(media.map(item => item.originalFormat)));

  // Filtere Medien basierend auf Such- und Filter-Kriterien
  const filteredMedia = media.filter(item => {
    // Verzeichnis-Filter
    if (selectedDirectory && selectedDirectory !== 'allgemein') {
      if (item.directory?.toLowerCase() !== selectedDirectory.toLowerCase()) {
        return false;
      }
    }

    // Suchfilter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        item.originalName.toLowerCase().includes(searchLower) ||
        item.altText?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }

    // Tag-Filter
    if (selectedTags.length > 0) {
      const matchesTags = selectedTags.some(tag => item.tags.includes(tag));
      if (!matchesTags) return false;
    }

    // Format-Filter
    if (selectedFormats.length > 0) {
      const matchesFormat = selectedFormats.includes(item.originalFormat);
      if (!matchesFormat) return false;
    }

    return true;
  });

  const getMediaTypeIcon = (item: ImageMetadata) => {
    if (item.mimeType.startsWith('image/')) {
      return <Image className="w-4 h-4" aria-label="Bild" />;
    } else if (item.mimeType.startsWith('video/')) {
      return <Video className="w-4 h-4" aria-label="Video" />;
    } else {
      return <File className="w-4 h-4" aria-label="Datei" />;
    }
  };

  const getMediaTypeBadge = (item: ImageMetadata) => {
    if (item.mimeType.startsWith('image/')) {
      return <Badge variant="secondary">Bild</Badge>;
    } else if (item.mimeType.startsWith('video/')) {
      return <Badge variant="secondary">Video</Badge>;
    } else {
      return <Badge variant="outline">Datei</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isVideo = (item: ImageMetadata) => {
    return item.mimeType.startsWith('video/');
  };

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleBatchDelete = () => {
    if (onBatchDelete && selectedItems.size > 0) {
      onBatchDelete(Array.from(selectedItems));
      setSelectedItems(new Set());
    }
  };

  const handleBatchMove = (targetDirectory: string) => {
    if (onBatchMove && selectedItems.size > 0) {
      onBatchMove(Array.from(selectedItems), targetDirectory);
      setSelectedItems(new Set());
    }
  };

  // Hilfsfunktion für Select-All
  const allSelected = filteredMedia.length > 0 && filteredMedia.every(item => selectedItems.has(item.id));
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredMedia.map(item => item.id)));
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Such- und Filter-Bereich */}
      <div className="space-y-3 sm:space-y-4">
        {/* Suchleiste und Ansicht-Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
            <Input
              placeholder="Medien suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 sm:pl-10 text-xs sm:text-sm"
            />
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Verzeichnis-Auswahl Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <span className="hidden xs:inline">{selectedDirectory}</span>
                  <span className="xs:hidden">Dir</span>
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onDirectoryChange?.('allgemein')}>
                  allgemein
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDirectoryChange?.('edited')}>
                  edited
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDirectoryChange?.('test')}>
                  test
                </DropdownMenuItem>
                {directories.filter(dir => !['allgemein', 'edited', 'test'].includes(dir)).map(dir => (
                  <DropdownMenuItem key={dir} onClick={() => onDirectoryChange?.(dir)}>
                    {dir}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Filter</span>
            </Button>
            <Button
              variant={batchMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setBatchMode(!batchMode);
                if (!batchMode) setSelectedItems(new Set());
              }}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <CheckSquare className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Batch</span>
            </Button>
            {/* Select-All-Button nur im Batch-Modus */}
            {batchMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <span className="hidden xs:inline">{allSelected ? "Alle abwählen" : "Alle auswählen"}</span>
                <span className="xs:hidden">{allSelected ? "Abwählen" : "Auswählen"}</span>
              </Button>
            )}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none p-1 sm:p-2"
              >
                <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none p-1 sm:p-2"
              >
                <List className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filter-Bereich */}
        {showFilters && (
          <Card>
            <CardContent className="pt-3 sm:pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {/* Tag-Filter */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium">Tags</label>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {availableTags.map(tag => (
                      <Button
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (selectedTags.includes(tag)) {
                            setSelectedTags(selectedTags.filter(t => t !== tag));
                          } else {
                            setSelectedTags([...selectedTags, tag]);
                          }
                        }}
                        className="text-xs"
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Format-Filter */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium">Formate</label>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {availableFormats.map(format => (
                      <Button
                        key={format}
                        variant={selectedFormats.includes(format) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (selectedFormats.includes(format)) {
                            setSelectedFormats(selectedFormats.filter(f => f !== format));
                          } else {
                            setSelectedFormats([...selectedFormats, format]);
                          }
                        }}
                        className="text-xs"
                      >
                        {format.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Batch-Aktionen */}
        {batchMode && selectedItems.size > 0 && (
          <Card className="bg-muted/50">
            <CardContent className="pt-3 sm:pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                <span className="text-xs sm:text-sm">
                  {selectedItems.size} Medien ausgewählt
                </span>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {directories.length > 0 && (
                    <select
                      onChange={(e) => handleBatchMove(e.target.value)}
                      className="px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded"
                    >
                      <option value="">Verschieben nach...</option>
                      {directories.map(dir => (
                        <option key={dir} value={dir}>{dir}</option>
                      ))}
                    </select>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBatchDelete}
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Löschen</span>
                    <span className="xs:hidden">Lösch</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Medien-Ansicht */}
      {viewMode === 'grid' ? (
        // Grid-Ansicht
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
          {filteredMedia.map((item) => (
            <Card
              key={item.id}
              className={`group relative overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer ${
                selectedItems.has(item.id) ? 'ring-2 ring-primary' : ''
              }`}
              onMouseEnter={() => setHoveredMedia(item.id)}
              onMouseLeave={() => setHoveredMedia(null)}
            >
              <CardContent className="p-0">
                {/* Checkbox für Batch-Modus */}
                {batchMode && (
                  <div className="absolute top-1 sm:top-2 left-1 sm:left-2 z-10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectItem(item.id);
                      }}
                      className="h-5 w-5 sm:h-6 sm:w-6 p-0 bg-white/90 hover:bg-white"
                    >
                      {selectedItems.has(item.id) ? (
                        <CheckSquare className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      ) : (
                        <Square className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </Button>
                  </div>
                )}

                {/* Medien-Vorschau */}
                <div className="relative aspect-square bg-muted">
                  {isVideo(item) ? (
                    <div className="relative w-full h-full">
                      <video
                        src={item.path}
                        className="w-full h-full object-cover"
                        muted
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/50 rounded-full p-2">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <NextImage
                      src={item.path}
                      alt={item.altText || item.originalName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  )}

                  {/* Overlay mit Aktionen */}
                  {hoveredMedia === item.id && !batchMode && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-1">
                      {onMediaPreview && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMediaPreview(item);
                          }}
                          className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      )}
                      {onMediaEdit && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMediaEdit(item.id);
                          }}
                          className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      )}
                      {onMediaDelete && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMediaDelete(item.id);
                          }}
                          className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Kompakte Medien-Info */}
                <div className="p-1 sm:p-2 space-y-1">
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" title={item.originalName}>
                        {item.originalName}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {getMediaTypeIcon(item)}
                        {getMediaTypeBadge(item)}
                        {/* Verzeichnis-Badge */}
                        {item.directory && (
                          <Badge variant="outline" className="text-xxs bg-muted/60 text-muted-foreground ml-1">
                            {item.directory}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Kompakte Metadaten */}
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-xs">Größe:</span>
                      <span className="text-xs">{formatFileSize(item.size)}</span>
                    </div>
                    {item.width && item.height && (
                      <div className="flex justify-between">
                        <span className="text-xs">Auflösung:</span>
                        <span className="text-xs">{item.width}×{item.height}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags (nur erste 2 anzeigen) */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 1).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 1 && (
                        <Badge variant="outline" className="text-xs">
                          +{item.tags.length - 1}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Listen-Ansicht
        <div className="space-y-2">
          {filteredMedia.map((item) => (
            <Card
              key={item.id}
              className={`group hover:shadow-md transition-all duration-200 cursor-pointer ${
                selectedItems.has(item.id) ? 'ring-2 ring-primary' : ''
              }`}
              onMouseEnter={() => setHoveredMedia(item.id)}
              onMouseLeave={() => setHoveredMedia(null)}
            >
              <CardContent className="p-2 sm:p-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Checkbox für Batch-Modus */}
                  {batchMode && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectItem(item.id);
                      }}
                      className="h-5 w-5 sm:h-6 sm:w-6 p-0"
                    >
                      {selectedItems.has(item.id) ? (
                        <CheckSquare className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      ) : (
                        <Square className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </Button>
                  )}

                  {/* Thumbnail */}
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                    {isVideo(item) ? (
                      <div className="relative w-full h-full">
                        <video
                          src={item.path}
                          className="w-full h-full object-cover"
                          muted
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black/50 rounded-full p-1">
                            <Play className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <NextImage
                        src={item.path}
                        alt={item.altText || item.originalName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    )}
                  </div>

                  {/* Medien-Informationen */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 sm:gap-2 mb-1">
                          {getMediaTypeIcon(item)}
                          <h3 className="text-xs sm:text-sm font-medium truncate" title={item.originalName}>
                            {item.originalName}
                          </h3>
                          {getMediaTypeBadge(item)}
                        </div>
                        
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                            <span>{formatFileSize(item.size)}</span>
                            {item.width && item.height && (
                              <span>{item.width}×{item.height}</span>
                            )}
                            <span>{item.originalFormat.toUpperCase()}</span>
                            {/* Verzeichnis-Badge */}
                            {item.directory && (
                              <Badge variant="outline" className="text-xxs bg-muted/60 text-muted-foreground ml-1">
                                {item.directory}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Tags */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {item.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{item.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Aktionen */}
                      {hoveredMedia === item.id && !batchMode && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {onMediaPreview && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                onMediaPreview(item);
                              }}
                              className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                            >
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          )}
                          {onMediaEdit && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                onMediaEdit(item.id);
                              }}
                              className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                            >
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          )}
                          {onMediaDelete && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                onMediaDelete(item.id);
                              }}
                              className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Ergebnisse-Anzeige */}
      <div className="text-center text-xs sm:text-sm text-muted-foreground">
        {filteredMedia.length} von {media.length} Medien angezeigt
      </div>
    </div>
  );
} 