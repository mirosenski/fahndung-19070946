import React, { useState, useEffect, useCallback } from 'react';
import { Folder, Plus, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface DirectoryManagerProps {
  selectedDirectory: string;
  onDirectoryChange: (directory: string) => void;
  onRefresh: () => void;
  onImageMove?: (imageId: string, targetDirectory: string) => void;
}

export function DirectoryManager({ 
  selectedDirectory, 
  onDirectoryChange, 
  onRefresh,
  onImageMove 
}: DirectoryManagerProps) {
  const [directories, setDirectories] = useState<string[]>([]);
  const [newDirectoryName, setNewDirectoryName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dragOverDirectory, setDragOverDirectory] = useState<string | null>(null);

  const loadDirectories = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/directories');
      const data = await response.json();
      
      if (data.success) {
        setDirectories(data.directories);
      }
    } catch {
      toast.error('Fehler beim Laden der Verzeichnisse');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDirectories();
  }, [loadDirectories]);

  const createDirectory = async () => {
    if (!newDirectoryName.trim()) {
      toast.error('Verzeichnisname ist erforderlich');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/directories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDirectoryName.trim() })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Verzeichnis "${newDirectoryName}" erstellt`);
        setNewDirectoryName('');
        await loadDirectories();
        onRefresh();
      } else {
        toast.error(data.error || 'Fehler beim Erstellen des Verzeichnisses');
      }
    } catch {
      toast.error('Fehler beim Erstellen des Verzeichnisses');
    } finally {
      setIsCreating(false);
    }
  };

  const deleteDirectory = async (directoryName: string) => {
    if (!confirm(`Möchtest du das Verzeichnis "${directoryName}" wirklich löschen? Alle Bilder darin werden ebenfalls gelöscht!`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/directories?name=${encodeURIComponent(directoryName)}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Verzeichnis "${directoryName}" gelöscht`);
        if (selectedDirectory === directoryName) {
          onDirectoryChange('allgemein');
        }
        await loadDirectories();
        onRefresh();
      } else {
        toast.error(data.error || 'Fehler beim Löschen des Verzeichnisses');
      }
    } catch {
      toast.error('Fehler beim Löschen des Verzeichnisses');
    } finally {
      setIsDeleting(false);
    }
  };

  // Drag & Drop Handlers
  const handleDragOver = useCallback((e: React.DragEvent, directory: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDirectory(directory);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOverDirectory(null);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, targetDirectory: string) => {
    e.preventDefault();
    setDragOverDirectory(null);
    
    const imageId = e.dataTransfer.getData('text/plain');
    if (imageId && onImageMove) {
      try {
        const response = await fetch('/api/images/move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageId, targetDirectory })
        });

        const data = await response.json();
        
        if (data.success) {
          toast.success(`Bild nach "${targetDirectory}" verschoben`);
          onImageMove(imageId, targetDirectory);
        } else {
          toast.error(data.error || 'Fehler beim Verschieben');
        }
      } catch {
        toast.error('Fehler beim Verschieben des Bildes');
      }
    }
  }, [onImageMove]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Verzeichnisse</h3>
        </div>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Lade Verzeichnisse...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Verzeichnisse</h3>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" disabled={isCreating}>
              <Plus className="h-4 w-4 mr-2" />
              Neues Verzeichnis
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neues Verzeichnis erstellen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Verzeichnisname eingeben..."
                value={newDirectoryName}
                onChange={(e) => setNewDirectoryName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createDirectory()}
                disabled={isCreating}
              />
              <div className="flex justify-end space-x-2">
                <Button 
                  onClick={createDirectory} 
                  disabled={isCreating || !newDirectoryName.trim()}
                >
                  {isCreating ? 'Erstelle...' : 'Erstellen'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => onDirectoryChange('allgemein')}
          className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
            selectedDirectory === 'allgemein' 
              ? 'bg-primary text-primary-foreground' 
              : 'hover:bg-muted'
          }`}
        >
          <Folder className="h-4 w-4 inline mr-2" />
          Alle Verzeichnisse
        </button>

        {directories.map((directory) => (
          <div 
            key={directory} 
            className={`flex items-center justify-between group rounded-md transition-all ${
              dragOverDirectory === directory ? 'bg-primary/20 border-2 border-primary' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, directory)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, directory)}
          >
            <button
              onClick={() => onDirectoryChange(directory)}
              className={`flex-1 text-left px-3 py-2 rounded-md transition-colors ${
                selectedDirectory === directory 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
              }`}
            >
              <Folder className="h-4 w-4 inline mr-2" />
              {directory}
              {dragOverDirectory === directory && (
                <Upload className="h-4 w-4 inline ml-2 text-primary" />
              )}
            </button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => deleteDirectory(directory)}
              disabled={isDeleting}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {directories.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Keine Verzeichnisse vorhanden
          </div>
        )}
      </div>
    </div>
  );
} 