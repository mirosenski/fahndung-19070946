'use client';

import React, { useState, useEffect } from 'react';
import { HardDrive, TrendingUp, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface StorageStats {
  totalImages: number;
  totalSize: number;
  maxSize: number;
  avgSize: number;
  formats: Record<string, number>;
  directories: Record<string, number>;
}

export function StorageAnalytics() {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Statistiken:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HardDrive className="w-5 h-5 mr-2" />
            Speicher-Analyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HardDrive className="w-5 h-5 mr-2" />
            Speicher-Analyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Statistiken nicht verfügbar
          </p>
        </CardContent>
      </Card>
    );
  }

  const usagePercent = (stats.totalSize / stats.maxSize) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <HardDrive className="w-5 h-5 mr-2" />
          Speicher-Analyse
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Speicher-Nutzung */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Speicherplatz</span>
              <span className="font-medium">
                {formatBytes(stats.totalSize)} / {formatBytes(stats.maxSize)}
              </span>
            </div>
            <Progress value={usagePercent} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{usagePercent.toFixed(1)}% genutzt</span>
              <span>{formatBytes(stats.maxSize - stats.totalSize)} verfügbar</span>
            </div>
          </div>
          
          {/* Übersicht */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center mb-1">
                <Database className="w-4 h-4 mr-2 text-blue-600" />
                <span className="text-muted-foreground">Bilder gesamt</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{stats.totalImages}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center mb-1">
                <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                <span className="text-muted-foreground">Ø Größe</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{formatBytes(stats.avgSize)}</p>
            </div>
          </div>
          
          {/* Format-Verteilung */}
          {Object.keys(stats.formats).length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Format-Verteilung</p>
              <div className="space-y-1">
                {Object.entries(stats.formats)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([format, count]) => (
                    <div key={format} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{format.toUpperCase()}</span>
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
          
          {/* Verzeichnis-Verteilung */}
          {Object.keys(stats.directories).length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Verzeichnisse</p>
              <div className="space-y-1">
                {Object.entries(stats.directories)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([directory, count]) => (
                    <div key={directory} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{directory}</span>
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 