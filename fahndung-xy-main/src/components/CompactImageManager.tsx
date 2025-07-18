'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { 
  Upload, 
  Folder, 
  HardDrive, 
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { DirectoryManager } from './DirectoryManager';
import { StorageAnalytics } from './StorageAnalytics';
import ImageUploader from './ImageUploader';
import { ImageMetadata } from '~/types';

interface CompactImageManagerProps {
  directories: string[];
  selectedDirectory: string;
  onDirectoryChange: (directory: string) => void;
  onUploadComplete: (image: ImageMetadata) => void;
  onRefresh: () => void;
  onImageMove?: (imageId: string, targetDirectory: string) => void;
}

export function CompactImageManager({
  directories,
  selectedDirectory,
  onDirectoryChange,
  onUploadComplete,
  onRefresh,
  onImageMove
}: CompactImageManagerProps) {
  const [activeTab, setActiveTab] = useState('upload');
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-sm sm:text-base">
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Bilder hochladen
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {isExpanded ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload</span>
              </TabsTrigger>
              <TabsTrigger value="directories" className="flex items-center gap-2">
                <Folder className="w-4 h-4" />
                <span className="hidden sm:inline">Verzeichnisse</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                <span className="hidden sm:inline">Analyse</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-4">
              <ImageUploader 
                onUploadComplete={onUploadComplete}
                directories={directories}
                selectedDirectory={selectedDirectory}
                onDirectoryChange={onDirectoryChange}
              />
              <div className="mt-4 text-xs sm:text-sm text-muted-foreground">
                <p>• Automatische WebP-Konvertierung</p>
                <p>• Thumbnail-Generierung</p>
                <p>• EXIF-Daten Extraktion</p>
                <p>• Verzeichnis-Organisation</p>
              </div>
            </TabsContent>

            <TabsContent value="directories" className="mt-4">
              <DirectoryManager
                selectedDirectory={selectedDirectory}
                onDirectoryChange={onDirectoryChange}
                onRefresh={onRefresh}
                onImageMove={onImageMove}
              />
            </TabsContent>

            <TabsContent value="analytics" className="mt-4">
              <StorageAnalytics />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-4">
            <Button
              onClick={() => setIsExpanded(true)}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Bilder hochladen
            </Button>
            <div className="mt-2 text-xs text-muted-foreground">
              Klicken Sie hier, um Bilder hochzuladen oder erweiterte Optionen zu öffnen
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 