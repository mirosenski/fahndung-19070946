'use client';

import React from 'react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle, AlertCircle, Folder } from 'lucide-react';
import { ImageMetadata } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ImageUploaderProps {
  onUploadComplete: (image: ImageMetadata) => void;
  directories?: string[];
  selectedDirectory?: string;
  onDirectoryChange?: (directory: string) => void;
}

export default function ImageUploader({ 
  onUploadComplete, 
  directories = [], 
  selectedDirectory = 'allgemein',
  onDirectoryChange 
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadDirectory, setUploadDirectory] = useState(selectedDirectory);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    setUploadStatus('idle');

    for (const file of acceptedFiles) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('directory', uploadDirectory.toLowerCase());

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result.success && result.image) {
          setUploadStatus('success');
          setStatusMessage(`${file.name} erfolgreich hochgeladen`);
          onUploadComplete(result.image);
        } else {
          setUploadStatus('error');
          setStatusMessage(result.error || 'Upload fehlgeschlagen');
        }
              } catch {
          setUploadStatus('error');
          setStatusMessage('Upload fehlgeschlagen');
        }
    }

    setUploading(false);
  }, [onUploadComplete, uploadDirectory]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.bmp', '.tiff']
    },
    multiple: true
  });

  // Verzeichnis-Auswahl
  const handleDirectoryChange = (dir: string) => {
    const lowerDir = dir.toLowerCase();
    setUploadDirectory(lowerDir);
    if (onDirectoryChange) onDirectoryChange(lowerDir);
  };

  return (
    <div className="w-full space-y-4">
      {/* Verzeichnis-Auswahl */}
      {directories.length > 0 && (
        <div className="flex items-center space-x-2">
          <Folder className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Verzeichnis:</span>
          <Select value={uploadDirectory} onValueChange={handleDirectoryChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Verzeichnis auswählen" />
            </SelectTrigger>
            <SelectContent>
              {[...new Set(directories.map((d) => d.toLowerCase()))].sort().map((directory) => (
                <SelectItem key={directory} value={directory}>
                  {directory}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          <Upload className="w-12 h-12 text-gray-400" />
          
          <div className="text-lg font-medium text-gray-700">
            {isDragActive 
              ? 'Bilder hier ablegen...' 
              : 'Bilder hierher ziehen oder klicken zum Auswählen'
            }
          </div>
          
          <div className="text-sm text-gray-500">
            Unterstützte Formate: JPEG, PNG, GIF, WebP, BMP, TIFF
          </div>
        </div>
      </div>

      {uploadStatus !== 'idle' && (
        <div className={`mt-4 p-4 rounded-lg flex items-center space-x-2 ${
          uploadStatus === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {uploadStatus === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{statusMessage}</span>
          <button
            onClick={() => setUploadStatus('idle')}
            className="ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
} 