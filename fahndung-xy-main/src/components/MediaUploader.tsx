'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Video, Image, File, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';


import { ImageMetadata } from '~/types';

interface MediaUploaderProps {
  onUploadComplete: (media: ImageMetadata) => void;
}

export function MediaUploader({ 
  onUploadComplete
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadDirectory] = useState('allgemein');
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    setUploadStatus('idle');
    setUploadProgress({});

    for (const file of acceptedFiles) {
      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('directory', uploadDirectory.toLowerCase());

        // Simuliere Upload-Fortschritt
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const current = prev[file.name] || 0;
            if (current < 90) {
              return { ...prev, [file.name]: current + 10 };
            }
            return prev;
          });
        }, 100);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);

        const result = await response.json();

        if (result.success && result.image) {
          setUploadStatus('success');
          setStatusMessage(`${file.name} erfolgreich hochgeladen`);
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
          onUploadComplete(result.image);
        } else {
          setUploadStatus('error');
          setStatusMessage(result.error || 'Upload fehlgeschlagen');
          setUploadProgress(prev => ({ ...prev, [file.name]: -1 }));
        }
              } catch {
        setUploadStatus('error');
        setStatusMessage('Upload fehlgeschlagen');
        setUploadProgress(prev => ({ ...prev, [file.name]: -1 }));
      }
    }

    setUploading(false);
  }, [onUploadComplete, uploadDirectory]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      // Bilder
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg'],
      // Videos
      'video/*': ['.mp4', '.webm', '.avi', '.mov', '.mkv', '.flv', '.wmv'],
      // Weitere Formate
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/json': ['.json']
    },
    multiple: true,
    maxSize: 100 * 1024 * 1024, // 100MB
  });



  // Dateityp-Erkennung
  const getFileTypeIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-4 h-4" aria-label="Bild" />;
    } else if (file.type.startsWith('video/')) {
      return <Video className="w-4 h-4" aria-label="Video" />;
    } else {
      return <File className="w-4 h-4" aria-label="Datei" />;
    }
  };



  return (
    <div className="space-y-3">
      {/* Kompakter Upload-Bereich */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
          }
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex items-center justify-center gap-3">
          <Upload className="w-5 h-5 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium">
              {isDragActive ? 'Dateien hier ablegen' : 'Dateien hochladen'}
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, MP4, PDF
            </p>
          </div>
        </div>

        {/* Upload-Status (kompakt) */}
        {uploading && (
          <div className="mt-3 space-y-1">
            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <div key={fileName} className="flex items-center gap-2 text-xs">
                {getFileTypeIcon({ name: fileName, type: '' } as File)}
                <span className="flex-1 truncate">{fileName}</span>
                {progress === 100 ? (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                ) : progress === -1 ? (
                  <XCircle className="w-3 h-3 text-red-500" />
                ) : (
                  <Loader2 className="w-3 h-3 animate-spin" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Status-Nachricht (kompakt) */}
        {statusMessage && (
          <div className={`flex items-center gap-1 text-xs mt-2 ${
            uploadStatus === 'success' ? 'text-green-600' : 
            uploadStatus === 'error' ? 'text-red-600' : 
            'text-muted-foreground'
          }`}>
            {uploadStatus === 'success' && <CheckCircle className="w-3 h-3" />}
            {uploadStatus === 'error' && <AlertCircle className="w-3 h-3" />}
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
} 