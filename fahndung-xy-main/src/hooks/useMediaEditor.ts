import { useState, useCallback } from 'react';
import { MediaMetadata, MediaEdits } from '~/types';
import { validateMediaConversion } from '~/utils/imageConversion';

export const useMediaEditor = (initialMedia: MediaMetadata) => {
  const [media, setMedia] = useState<MediaMetadata>(initialMedia);
  const [previewUrl, setPreviewUrl] = useState<string>(initialMedia.path);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);

  // Bearbeitungen anwenden
  const applyEdits = useCallback(async (edits: MediaEdits) => {
    setIsProcessing(true);
    
    try {
      // Validiere Bearbeitungen
      const validation = validateMediaConversion(media, edits);
      setValidationIssues(validation.issues);
      
      if (!validation.isValid) {
        throw new Error(`Validierungsfehler: ${validation.issues.join(', ')}`);
      }

      // Aktualisiere Medien-State
      setMedia(prev => ({
        ...prev,
        edits: { ...prev.edits, ...edits }
      }));

      // Generiere Preview-URL (für Client-Side Vorschau)
      if (media.mediaType === 'image') {
        // Für Bilder können wir CSS-Filter verwenden
        const filterString = generateFilterString(edits);
        setPreviewUrl(`${media.path}#filter=${encodeURIComponent(filterString)}`);
      } else if (media.mediaType === 'video') {
        // Für Videos setzen wir die URL zurück
        setPreviewUrl(media.path);
      }

      return true;
    } catch (error) {
      console.error('Fehler beim Anwenden der Bearbeitungen:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [media]);

  // Einzelne Bearbeitung aktualisieren
  function updateEdit(key: keyof MediaEdits, value: number | string | { x: number; y: number; width: number; height: number }) {
    setMedia(prev => ({
      ...prev,
      edits: {
        ...prev.edits,
        [key]: value
      }
    }));
  }

  // Bearbeitungen zurücksetzen
  const resetEdits = useCallback(() => {
    setMedia(prev => ({
      ...prev,
      edits: {}
    }));
    setPreviewUrl(initialMedia.path);
    setValidationIssues([]);
  }, [initialMedia.path]);

  // Metadaten aktualisieren
  const updateMetadata = useCallback((metadata: Partial<MediaMetadata>) => {
    setMedia(prev => ({
      ...prev,
      ...metadata,
      updatedAt: new Date().toISOString()
    }));
  }, []);

  // Generiere CSS-Filter-String für Bild-Vorschau
  const generateFilterString = (edits: MediaEdits): string => {
    const filters: string[] = [];
    
    if (edits.brightness && edits.brightness !== 100) {
      filters.push(`brightness(${edits.brightness}%)`);
    }
    
    if (edits.contrast && edits.contrast !== 100) {
      filters.push(`contrast(${edits.contrast}%)`);
    }
    
    if (edits.saturation && edits.saturation !== 100) {
      filters.push(`saturate(${edits.saturation}%)`);
    }
    
    if (edits.filter && edits.filter !== 'normal') {
      switch (edits.filter) {
        case 'grayscale':
          filters.push('grayscale(100%)');
          break;
        case 'sepia':
          filters.push('sepia(100%)');
          break;
        case 'vintage':
          filters.push('sepia(50%) hue-rotate(30deg) brightness(110%)');
          break;
        case 'cool':
          filters.push('hue-rotate(-30deg) saturate(120%)');
          break;
        case 'warm':
          filters.push('hue-rotate(30deg) saturate(120%) brightness(110%)');
          break;
      }
    }
    
    return filters.join(' ');
  };

  // Speichern der Bearbeitungen
  const saveEdits = async () => {
    const edits = media.edits;
    if (!edits) return false;
    const changed = (
      edits.rotation !== 0 ||
      edits.brightness !== 100 ||
      edits.contrast !== 100 ||
      edits.saturation !== 100 ||
      edits.filter !== 'normal' ||
      edits.crop ||
      edits.trim ||
      edits.volume !== 1 ||
      edits.playbackSpeed !== 1
    );
    if (!changed) return false;

    setIsProcessing(true);

    try {
      // Hier würde die tRPC-Mutation aufgerufen werden
      // const result = await api.media.processEdits.mutate({
      //   mediaId: media.id,
      //   edits: media.edits || {}
      // });

      // Für jetzt simulieren wir das Speichern
      await new Promise(resolve => setTimeout(resolve, 1000));

      return true;
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    media,
    previewUrl,
    isProcessing,
    validationIssues,
    applyEdits,
    updateEdit,
    resetEdits,
    updateMetadata,
    // hasChanges entfernt
    saveEdits,
    generateFilterString
  };
}; 