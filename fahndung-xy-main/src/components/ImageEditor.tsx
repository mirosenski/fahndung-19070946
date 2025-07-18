'use client';

import React, { useState, useCallback } from 'react';
import { ImageEdits } from '@/types';

interface ImageEditorProps {
  imageId: string;
  onEditComplete?: (editedImage: { id: string; url: string; edits: ImageEdits }) => void;
  onCancel?: () => void;
}

export default function ImageEditor({ imageId, onEditComplete, onCancel }: ImageEditorProps) {
  const [edits, setEdits] = useState<ImageEdits>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Bearbeitungsparameter aktualisieren
  const updateEdit = useCallback((key: keyof ImageEdits, value: number | string | { x: number; y: number; width: number; height: number }) => {
    setEdits(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Bildbearbeitung anwenden
  const applyEdits = async () => {
    setIsProcessing(true);
    
    try {
      const response = await fetch(`/api/images/${imageId}/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ edits }),
      });

      if (!response.ok) {
        throw new Error('Fehler bei der Bildbearbeitung');
      }

      const result = await response.json();
      
      if (result.success) {
        onEditComplete?.(result.editedImage);
      } else {
        throw new Error(result.error || 'Unbekannter Fehler');
      }
    } catch (error) {
      console.error('Bildbearbeitung fehlgeschlagen:', error);
      alert('Fehler bei der Bildbearbeitung: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Vorschau generieren (vereinfacht)
  const generatePreview = useCallback(() => {
    // Hier könnte eine echte Vorschau-Logik implementiert werden
    console.log('Vorschau würde generiert werden mit:', edits);
  }, [edits]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Bildbearbeitung</h2>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={applyEdits}
            disabled={isProcessing}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'Verarbeite...' : 'Anwenden'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vorschau-Bereich */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Vorschau</h3>
          <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-gray-500 text-center">
              <p>Vorschau wird generiert...</p>
              <button
                onClick={generatePreview}
                className="mt-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Vorschau aktualisieren
              </button>
            </div>
          </div>
        </div>

        {/* Bearbeitungsoptionen */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Bearbeitungsoptionen</h3>
          
          {/* Rotation */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Rotation</label>
            <input
              type="range"
              min="-360"
              max="360"
              value={edits.rotation || 0}
              onChange={(e) => updateEdit('rotation', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-xs text-gray-500">{edits.rotation || 0}°</div>
          </div>

          {/* Helligkeit */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Helligkeit</label>
            <input
              type="range"
              min="0"
              max="200"
              value={edits.brightness || 100}
              onChange={(e) => updateEdit('brightness', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-xs text-gray-500">{edits.brightness || 100}%</div>
          </div>

          {/* Kontrast */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Kontrast</label>
            <input
              type="range"
              min="0"
              max="200"
              value={edits.contrast || 100}
              onChange={(e) => updateEdit('contrast', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-xs text-gray-500">{edits.contrast || 100}%</div>
          </div>

          {/* Sättigung */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Sättigung</label>
            <input
              type="range"
              min="0"
              max="200"
              value={edits.saturation || 100}
              onChange={(e) => updateEdit('saturation', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-xs text-gray-500">{edits.saturation || 100}%</div>
          </div>

          {/* Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Filter</label>
            <select
              value={edits.filter || 'normal'}
              onChange={(e) => updateEdit('filter', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="normal">Normal</option>
              <option value="grayscale">Schwarz-Weiß</option>
              <option value="sepia">Sepia</option>
              <option value="vintage">Vintage</option>
              <option value="cool">Cool</option>
              <option value="warm">Warm</option>
            </select>
          </div>

          {/* Zuschneiden */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Zuschneiden</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500">X-Position (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={edits.crop?.x || 0}
                  onChange={(e) => updateEdit('crop', {
                    x: Number(e.target.value),
                    y: edits.crop?.y ?? 0,
                    width: edits.crop?.width ?? 100,
                    height: edits.crop?.height ?? 100,
                  })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Y-Position (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={edits.crop?.y || 0}
                  onChange={(e) => updateEdit('crop', {
                    x: edits.crop?.x ?? 0,
                    y: Number(e.target.value),
                    width: edits.crop?.width ?? 100,
                    height: edits.crop?.height ?? 100,
                  })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Breite (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={edits.crop?.width || 100}
                  onChange={(e) => updateEdit('crop', {
                    x: edits.crop?.x ?? 0,
                    y: edits.crop?.y ?? 0,
                    width: Number(e.target.value),
                    height: edits.crop?.height ?? 100,
                  })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Höhe (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={edits.crop?.height || 100}
                  onChange={(e) => updateEdit('crop', {
                    x: edits.crop?.x ?? 0,
                    y: edits.crop?.y ?? 0,
                    width: edits.crop?.width ?? 100,
                    height: Number(e.target.value),
                  })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: none;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
} 