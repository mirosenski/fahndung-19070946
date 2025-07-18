import React, { useState } from 'react';
import ImageEditor from '@/components/ImageEditor';
import { ImageMetadata, ImageEdits } from '@/types';

export default function ImageEditorDemo() {
  const [selectedImage, setSelectedImage] = useState<ImageMetadata | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  // Beispiel-Bild für Demo
  const demoImage: ImageMetadata = {
    id: 'demo-image-123',
    filename: 'demo-image.jpg',
    originalName: 'demo-image.jpg',
    path: '/uploads/demo-image.jpg',
    thumbnailPath: '/uploads/demo-image.jpg',
    size: 1024000,
    width: 1920,
    height: 1080,
    mimeType: 'image/jpeg',
    originalFormat: 'jpeg',
    directory: 'demo',
    tags: ['demo', 'test'],
    uploadedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const handleEditComplete = (editedImage: { id: string; url: string; edits: ImageEdits }) => {
    console.log('Bearbeitung abgeschlossen:', editedImage);
    setShowEditor(false);
    // Hier könnte man zur Galerie zurückkehren oder das bearbeitete Bild anzeigen
    alert(`Bild erfolgreich bearbeitet! Neue ID: ${editedImage.id}`);
  };

  const handleCancel = () => {
    setShowEditor(false);
    console.log('Bearbeitung abgebrochen');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bildbearbeitung Demo
          </h1>
          <p className="text-lg text-gray-600">
            Moderne Bildbearbeitung mit TypeScript, Zod-Validierung und Tailwind CSS
          </p>
        </div>

        {!showEditor ? (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Demo-Bild auswählen
              </h2>
              <div className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="text-6xl mb-4">🖼️</div>
                  <p className="text-gray-500">Demo-Bild</p>
                  <p className="text-sm text-gray-400">1920x1080 • 1.0 MB</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>ID:</strong> {demoImage.id}</p>
                <p><strong>Format:</strong> {demoImage.originalFormat}</p>
                <p><strong>Größe:</strong> {(demoImage.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => {
                  setSelectedImage(demoImage);
                  setShowEditor(true);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Bildbearbeitung starten
              </button>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Verfügbare Features:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Rotation (-360° bis +360°)</li>
                <li>• Helligkeit, Kontrast, Sättigung (0-200%)</li>
                <li>• Filter: Normal, Schwarz-Weiß, Sepia, Vintage, Cool, Warm</li>
                <li>• Zuschneiden mit Prozentangaben</li>
                <li>• Automatische WebP-Konvertierung</li>
                <li>• Type-Safe Validierung mit Zod</li>
              </ul>
            </div>
          </div>
        ) : (
          <ImageEditor
            imageId={selectedImage?.id || ''}
            onEditComplete={handleEditComplete}
            onCancel={handleCancel}
          />
        )}

        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
            <span>🔄</span>
            <span>App Router • TypeScript • Zod • Tailwind CSS</span>
            <span>🚀</span>
          </div>
        </div>
      </div>
    </div>
  );
} 