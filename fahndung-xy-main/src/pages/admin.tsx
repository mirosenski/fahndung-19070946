import Head from "next/head";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { FileText, Globe, Database, Image as ImageIcon, Menu, X, LogOut } from "lucide-react";
import { Logo } from "~/components/ui/Logo";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { UserManagement } from "~/components/admin/UserManagement";
import { Footer } from "~/components/layout/Footer";

import { getDemoSession } from "~/utils/session";
import { useRouter } from "next/router";
import { toast } from "sonner";

// Import der Medienverwaltung-Komponenten
import { CompactImageEditor } from "~/components/CompactImageEditor";
import { CompactVideoEditor } from "~/components/CompactVideoEditor";
import { ImageMetadata } from "~/types";
import { MediaUploader } from "~/components/MediaUploader";
import { MediaGallery } from "~/components/MediaGallery";
import { MediaPreview } from "~/components/MediaPreview";
import { DeleteConfirmation } from "~/components/ui/DeleteConfirmation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { InvestigationEditForm } from "~/components/InvestigationEditForm";
import { api } from "~/utils/api";
import { 
  Folder, 
  File, 
  Upload, 
  Trash2, 
  Move, 
  Edit, 
  Eye,
  FolderPlus,
  Search,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Grid3X3,
  FolderOpen,
  Plus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import Image from "next/image";



function getCategoryLabel(category: string): string {
  switch (category) {
    case "WANTED_PERSON": return "Straftäter";
    case "MISSING_PERSON": return "Vermisste Person";
    case "UNKNOWN_DEAD": return "Unbekannte Tote";
    case "STOLEN_GOODS": return "Gesuchte Sachen";
    default: return category;
  }
}

function getPriorityBadge(priority: string) {
  const isUrgent = priority === "URGENT";
  return (
    <Badge variant={isUrgent ? "destructive" : "secondary"}>
      {isUrgent ? "EILFAHNDUNG" : "Normal"}
    </Badge>
  );
}

function getStatusBadge(status: string) {
  const isPublished = status === "PUBLISHED";
  return (
    <Badge variant={isPublished ? "default" : "outline"}>
      {isPublished ? "Veröffentlicht" : "Entwurf"}
    </Badge>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState("investigations");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Medienverwaltung States
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageMetadata[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageMetadata | null>(null);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [showMediaPreview, setShowMediaPreview] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<ImageMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDirectory, setSelectedDirectory] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedDirectory') || 'allgemein';
    }
    return 'allgemein';
  });
  const [directories, setDirectories] = useState<string[]>([]);
  const [expandedDirectories, setExpandedDirectories] = useState<Set<string>>(new Set());
  const [newDirectoryName, setNewDirectoryName] = useState('');
  const [showCreateDirectory, setShowCreateDirectory] = useState(false);
  const [selectedDirectoryForAction] = useState<string>('');

  // Delete Confirmation State
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  // tRPC Queries für Verzeichnisverwaltung
  const { data: directoriesData, refetch: refetchDirectories } = api.media.listDirectories.useQuery();
  const { data: mediaData, refetch: refetchMedia } = api.media.getAll.useQuery({
    search: '',
    directory: undefined
  });

  // NEU: tRPC Queries für Fahndungen
  const { data: investigationsData, isLoading: isLoadingInvestigations } = api.investigation.getAll.useQuery({
    search: '',
    limit: 100,
    offset: 0
  });

  // tRPC Mutations für Fahndungen
  const publishInvestigationMutation = api.investigation.publish.useMutation();
  const deleteInvestigationMutation = api.investigation.delete.useMutation();

  // Extract investigations array from the response
  const investigations = Array.isArray(investigationsData) ? investigationsData : (investigationsData?.investigations || []);

  // Filtered investigations - verwende echte Daten aus der Datenbank
  const filteredInvestigations = investigations.filter((investigation: {
    title: string;
    caseNumber: string;
    location: string;
    category: string;
    status: string;
    priority: string;
  }) => {
    const matchesSearch = investigation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investigation.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investigation.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "all" || investigation.category === selectedCategory;
    const matchesStatus = !selectedStatus || selectedStatus === "all" || investigation.status === selectedStatus;
    const matchesPriority = !selectedPriority || selectedPriority === "all" || investigation.priority === selectedPriority;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  const createDirectoryMutation = api.media.createDirectory.useMutation({
    onSuccess: () => {
      toast.success('Verzeichnis erstellt');
      refetchDirectories();
      setShowCreateDirectory(false);
      setNewDirectoryName('');
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    }
  });

  const moveFileMutation = api.media.moveFile.useMutation({
    onSuccess: () => {
      toast.success('Datei verschoben');
      refetchMedia();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    }
  });

  const deleteMediaMutation = api.media.delete.useMutation({
    onSuccess: () => {
      toast.success('Medium gelöscht');
      refetchMedia();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    }
  });

  const updateMetadataMutation = api.media.updateMetadata.useMutation({
    onSuccess: () => {
      toast.success('Metadaten aktualisiert');
      refetchMedia();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    }
  });

  // NEU: Bild-Optimierung Tab






  useEffect(() => {
    setIsClient(true);
    const demoSession = getDemoSession();
    if (!demoSession) {
      router.push("/login");
      return;
    }
    setSession(demoSession.user);
  }, [router]);

  // Verwende tRPC Queries für Medienverwaltung
  useEffect(() => {
    if (activeTab === "gallery" && mediaData?.media) {
      console.log(`📥 ${mediaData.media.length} Bilder aus uploads geladen`);
      
      // Konvertiere MediaMetadata zu ImageMetadata für Kompatibilität
      const convertedImages: ImageMetadata[] = mediaData.media.map(media => ({
        id: media.id,
        filename: media.originalName,
        originalName: media.originalName,
        path: media.path,
        thumbnailPath: media.thumbnailPath || media.path,
        width: media.width || 0,
        height: media.height || 0,
        size: media.size,
        mimeType: media.mediaType === 'image' ? 'image/jpeg' : 'video/mp4',
        originalFormat: media.originalFormat,
        directory: media.directory || '',
        tags: media.tags || [],
        uploadedAt: media.uploadedAt,
        updatedAt: media.updatedAt
      }));
      
      setImages(convertedImages);
      setFilteredImages(convertedImages);
      setLoading(false);
    }
  }, [activeTab, mediaData]);

  // Lade Verzeichnisse wenn verfügbar
  useEffect(() => {
    if (directoriesData?.directories) {
      console.log(`📁 ${directoriesData.directories.length} Verzeichnisse geladen`);
      setDirectories(directoriesData.directories.map(dir => dir.name));
    }
  }, [directoriesData]);

  // Persistiere selectedDirectory in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedDirectory', selectedDirectory);
    }
  }, [selectedDirectory]);

  // Reset Filter when directory changes
  useEffect(() => {
    setSearchTerm('');
  }, [selectedDirectory]);

  const handleUploadComplete = (newImage: ImageMetadata) => {
    setImages(prev => [newImage, ...prev]);
    setFilteredImages(prev => [newImage, ...prev]);
  };

  const handleImageDelete = (id: string) => {
    const image = images.find(img => img.id === id);
    if (image) {
      setItemToDelete({ id, name: image.originalName });
      setShowDeleteConfirmation(true);
    }
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteMediaMutation.mutate({ mediaId: itemToDelete.id });
      setShowDeleteConfirmation(false);
      setItemToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setItemToDelete(null);
  };



  const handleImageUpdate = (updates: Partial<ImageMetadata>) => {
    if (!selectedImage) return;
    
    // Wenn es sich um ein bearbeitetes Bild handelt, lade die Galerie neu
    if (updates.editedFrom || updates.id?.includes('edited_')) {
      refetchMedia();
      return;
    }
    // Wenn das Bild optimiert wurde oder Metadaten geändert wurden, lade die Galerie neu
    if (updates.optimized === true || updates.originalName || updates.altText || updates.description || updates.tags) {
      refetchMedia();
      return;
    }
    
    // Verwende tRPC API für Metadaten-Updates
    const metadataToUpdate = {
      tags: updates.tags,
      altText: updates.altText,
      description: updates.description,
      originalName: updates.originalName
    };
    
    // Entferne undefined Werte
    const cleanMetadata = Object.fromEntries(
      Object.entries(metadataToUpdate).filter(([, value]) => value !== undefined)
    );
    
    if (Object.keys(cleanMetadata).length > 0) {
      // Verwende die updateMetadata Mutation
      updateMetadataMutation.mutate({
        mediaId: selectedImage.id,
        metadata: cleanMetadata
      });
    }
    
    // Normale Aktualisierung für lokalen State
    setImages(prev => prev.map(img => 
      img.id === selectedImage.id ? { ...img, ...updates } : img
    ));
    setFilteredImages(prev => prev.map(img => 
      img.id === selectedImage.id ? { ...img, ...updates } : img
    ));
  };

  const handleImageClick = (image: ImageMetadata) => {
    setPreviewMedia(image);
    setShowMediaPreview(true);
  };



  const handleMediaEdit = (mediaId: string) => {
    const media = images.find(img => img.id === mediaId);
    if (media) {
      setSelectedImage(media);
      setShowImageEditor(true);
    }
  };

  // Einfache Filter-Funktion
  const applyFilters = useCallback(() => {
    let filtered = [...images];

    // Suchfilter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(image => 
        image.originalName.toLowerCase().includes(searchLower) ||
        image.altText?.toLowerCase().includes(searchLower) ||
        image.description?.toLowerCase().includes(searchLower) ||
        (image.tags && image.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }

    console.log(`🔍 Filter angewendet: ${images.length} → ${filtered.length} Bilder`);
    setFilteredImages(filtered);
  }, [images, searchTerm]);

  // Aktualisiere gefilterte Bilder wenn sich Filter ändern
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);



  const [showEditForm, setShowEditForm] = useState(false);
  const [editingInvestigationId, setEditingInvestigationId] = useState<string | null>(null);

  const handleEditInvestigation = (id: string) => {
    setEditingInvestigationId(id);
    setShowEditForm(true);
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setEditingInvestigationId(null);
  };

  const handleSaveEdit = () => {
    setShowEditForm(false);
    setEditingInvestigationId(null);
    // Refetch investigations to update the list
    window.location.reload();
  };

  const handlePublishInvestigation = async (id: string) => {
    try {
      await publishInvestigationMutation.mutateAsync({ id });
      // Refetch investigations to update the list
      window.location.reload();
    } catch (error) {
      console.error('Fehler beim Veröffentlichen der Fahndung:', error);
    }
  };

  const handleDeleteInvestigation = async (id: string) => {
    if (confirm("Sind Sie sicher, dass Sie diese Fahndung löschen möchten?")) {
      try {
        await deleteInvestigationMutation.mutateAsync({ id });
        // Refetch investigations to update the list
        window.location.reload();
      } catch (error) {
        console.error('Fehler beim Löschen der Fahndung:', error);
      }
    }
  };

  useEffect(() => {
    if (!isClient) return;
    if (images.length === 0) {
      // Zeige einen Hinweis im UI (z.B. Toast, Alert oder Console)
      // alert('Achtung: Es wurden keine Bilder geladen! Bitte prüfe die Server-Logs.');
      console.warn('Achtung: Es wurden keine Bilder geladen! Bitte prüfe die Server-Logs.');
    }
  }, [images, isClient]);



  async function handleOptimizeSingle(imageId: string) {
    try {
      const res = await fetch(`/api/admin/optimize-images/${imageId}`, { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Bild erfolgreich optimiert');
        refetchMedia();
      } else {
        toast.error(data.error || 'Fehler bei der Optimierung');
      }
    } catch {
      toast.error('Fehler bei der Optimierung');
    }
  }

  async function handleConvertToWebP(imageId: string) {
    try {
      const res = await fetch(`/api/admin/convert-to-webp/${imageId}`, { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Bild erfolgreich zu WebP konvertiert');
        refetchMedia();
      } else {
        toast.error(data.error || 'Fehler bei der Konvertierung');
      }
    } catch {
      toast.error('Fehler bei der Konvertierung');
    }
  }

  const handleCreateDirectory = () => {
    if (!newDirectoryName.trim()) {
      toast.error('Bitte geben Sie einen Verzeichnisnamen ein');
      return;
    }
    createDirectoryMutation.mutate({ name: newDirectoryName.trim() });
  };

  const handleMoveFile = (mediaId: string, targetDirectory: string) => {
    moveFileMutation.mutate({ mediaId, targetDirectory });
  };

  const handleDeleteMedia = (mediaId: string) => {
    if (confirm('Sind Sie sicher, dass Sie diese Datei löschen möchten?')) {
      deleteMediaMutation.mutate({ mediaId });
    }
  };

  const toggleDirectoryExpansion = (directoryPath: string) => {
    const newExpanded = new Set(expandedDirectories);
    if (newExpanded.has(directoryPath)) {
      newExpanded.delete(directoryPath);
    } else {
      newExpanded.add(directoryPath);
    }
    setExpandedDirectories(newExpanded);
  };

  const buildDirectoryTree = (directories: Array<{ fullPath: string; name: string }>) => {
    const tree: { [key: string]: Array<{ fullPath: string; name: string }> } = {};
    
    directories.forEach(dir => {
      const parts = dir.fullPath.split('/');
      const parent = parts.slice(0, -1).join('/');
      if (!tree[parent]) {
        tree[parent] = [];
      }
      tree[parent].push(dir);
    });
    
    return tree;
  };

  const renderDirectoryTree = (directories: Array<{ fullPath: string; name: string }>, parentPath = '') => {
    const tree = buildDirectoryTree(directories);
    const currentLevel = tree[parentPath] || [];
    
    return currentLevel.map(dir => {
      const hasChildren = !!tree[dir.fullPath]?.length;
      const isExpanded = expandedDirectories.has(dir.fullPath);
      const fileCount = mediaData?.media?.filter(m => m.directory === dir.fullPath).length || 0;
      
      return (
        <div key={dir.fullPath} className="ml-4">
          <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md group">
            <div className="flex items-center gap-2 flex-1">
              {hasChildren ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => toggleDirectoryExpansion(dir.fullPath)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </Button>
              ) : (
                <div className="w-4" />
              )}
              <Folder className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">{dir.name}</span>
              <Badge variant="secondary" className="text-xs">
                {fileCount}
              </Badge>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Edit className="w-3 h-3 mr-2" />
                    Umbenennen
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Move className="w-3 h-3 mr-2" />
                    Verschieben
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="w-3 h-3 mr-2" />
                    Löschen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {hasChildren && isExpanded && (
            <div className="ml-4">
              {renderDirectoryTree(directories, dir.fullPath)}
            </div>
          )}
        </div>
      );
    });
  };

  if (!isClient || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - Fahndung</title>
        <meta name="description" content="Dashboard für Fahndungsverwaltung" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Logo />
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href={session ? "/admin" : "/login"} className="text-sm font-medium text-primary">
                Dashboard
              </Link>
              <Link href={session ? "/wizard" : "/login"} className="text-sm font-medium hover:text-primary">
                Fahndung erstellen
              </Link>
              {session && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    // Session komplett löschen
                    localStorage.removeItem("demo-session");
                    sessionStorage.clear();
                    // Cookies löschen
                    document.cookie.split(";").forEach(function(c) { 
                      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
                    });
                    // Zur Login-Seite weiterleiten mit Cache-Busting
                    window.location.replace("/login?logout=" + Date.now());
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Abmelden
                </Button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 space-y-2 border-t pt-4">
              <Link 
                href={session ? "/admin" : "/login"} 
                className="block text-sm font-medium text-primary py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href={session ? "/wizard" : "/login"} 
                className="block text-sm font-medium hover:text-primary py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Fahndung erstellen
              </Link>
              {session && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    // Session komplett löschen
                    localStorage.removeItem("demo-session");
                    sessionStorage.clear();
                    // Cookies löschen
                    document.cookie.split(";").forEach(function(c) { 
                      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
                    });
                    // Zur Login-Seite weiterleiten mit Cache-Busting
                    window.location.replace("/login?logout=" + Date.now());
                  }}
                  className="w-full justify-start text-muted-foreground hover:text-foreground py-2"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Abmelden
                </Button>
              )}
            </nav>
          )}
        </div>
      </header>

      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-6 lg:py-8">
          {/* Header mit Aktionen */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 lg:mb-8 gap-3 sm:gap-4">


          </div>

          {/* Tabs */}
          <div className="border-b mb-4 sm:mb-6">
            <nav className="flex overflow-x-auto space-x-2 sm:space-x-4 lg:space-x-8 pb-1">
              <button
                onClick={() => setActiveTab("investigations")}
                className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm lg:text-base whitespace-nowrap transition-colors ${
                  activeTab === "investigations"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                <span className="hidden xs:inline">Fahndungen</span>
                <span className="xs:hidden">Fahnd.</span>
              </button>
              <button
                onClick={() => setActiveTab("gallery")}
                className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm lg:text-base whitespace-nowrap transition-colors ${
                  activeTab === "gallery"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                <span>Galerie</span>
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm lg:text-base whitespace-nowrap transition-colors ${
                  activeTab === "users"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <Database className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                <span>System</span>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "investigations" && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <CardTitle className="text-sm sm:text-base lg:text-lg">Fahndungen ({filteredInvestigations.length})</CardTitle>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Input
                      placeholder="Suchen..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:w-64 text-xs sm:text-sm"
                    />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-2 sm:px-3 py-1 sm:py-2 border border-border rounded-md bg-background text-foreground text-xs sm:text-sm"
                    >
                      <option value="all">Alle Kategorien</option>
                      <option value="WANTED_PERSON">Straftäter</option>
                      <option value="MISSING_PERSON">Vermisste Person</option>
                      <option value="UNKNOWN_DEAD">Unbekannte Tote</option>
                      <option value="STOLEN_GOODS">Gesuchte Sachen</option>
                    </select>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="px-2 sm:px-3 py-1 sm:py-2 border border-border rounded-md bg-background text-foreground text-xs sm:text-sm"
                    >
                      <option value="all">Alle Status</option>
                      <option value="PUBLISHED">Veröffentlicht</option>
                      <option value="DRAFT">Entwurf</option>
                      <option value="ARCHIVED">Archiviert</option>
                    </select>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value)}
                      className="px-2 sm:px-3 py-1 sm:py-2 border border-border rounded-md bg-background text-foreground text-xs sm:text-sm"
                    >
                      <option value="all">Alle Prioritäten</option>
                      <option value="NORMAL">Normal</option>
                      <option value="URGENT">Eilig</option>
                      <option value="NEW">Neu</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                {isLoadingInvestigations ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Lade Fahndungen...</p>
                  </div>
                ) : filteredInvestigations.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Keine Fahndungen gefunden</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || selectedCategory !== "all" || selectedStatus !== "all" || selectedPriority !== "all" 
                        ? "Versuchen Sie andere Suchkriterien" 
                        : "Erstellen Sie Ihre erste Fahndung über den Wizard"}
                    </p>
                    {!searchTerm && selectedCategory === "all" && selectedStatus === "all" && selectedPriority === "all" && (
                      <Link href="/wizard">
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Erste Fahndung erstellen
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1 sm:py-2 px-1 sm:px-2">Fallnummer</th>
                        <th className="text-left py-1 sm:py-2 px-1 sm:px-2">Titel</th>
                        <th className="text-left py-1 sm:py-2 px-1 sm:px-2">Kategorie</th>
                        <th className="text-left py-1 sm:py-2 px-1 sm:px-2">Priorität</th>
                        <th className="text-left py-1 sm:py-2 px-1 sm:px-2">Status</th>
                        <th className="text-left py-1 sm:py-2 px-1 sm:px-2">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvestigations.map((investigation) => (
                        <tr key={investigation.id} className="border-b hover:bg-muted/50">
                          <td className="py-1 sm:py-2 px-1 sm:px-2 font-mono text-xs">{investigation.caseNumber}</td>
                          <td className="py-1 sm:py-2 px-1 sm:px-2">{investigation.title}</td>
                          <td className="py-1 sm:py-2 px-1 sm:px-2">{getCategoryLabel(investigation.category)}</td>
                          <td className="py-1 sm:py-2 px-1 sm:px-2">{getPriorityBadge(investigation.priority)}</td>
                          <td className="py-1 sm:py-2 px-1 sm:px-2">{getStatusBadge(investigation.status)}</td>
                          <td className="py-1 sm:py-2 px-1 sm:px-2">
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditInvestigation(investigation.id)}
                                className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                              >
                                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              {investigation.status === "DRAFT" && (
                                <Button
                                  size="sm"
                                  onClick={() => handlePublishInvestigation(investigation.id)}
                                  className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                                  disabled={publishInvestigationMutation.isPending}
                                >
                                  <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteInvestigation(investigation.id)}
                                className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                                disabled={deleteInvestigationMutation.isPending}
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              </CardContent>
            </Card>
          )}

          {activeTab === "users" && (
            <UserManagement />
          )}

          {activeTab === "gallery" && (
            <div className="space-y-4 sm:space-y-6">
              {/* Tabs für Galerie-Bereich */}
              <Tabs defaultValue="gallery" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
                  <TabsTrigger value="gallery" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Medien-Galerie</span>
                    <span className="xs:hidden">Galerie</span>
                  </TabsTrigger>
                  <TabsTrigger value="directories" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <FolderOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Verzeichnisse</span>
                    <span className="xs:hidden">Ordner</span>
                  </TabsTrigger>
                </TabsList>

                {/* Galerie Tab */}
                <TabsContent value="gallery">
                  <div className="space-y-3 sm:space-y-4">
                    {/* Kompakter Upload-Bereich */}
                    <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <Upload className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                        <span className="text-xs sm:text-sm font-medium">Dateien hochladen</span>
                      </div>
                      <MediaUploader
                        onUploadComplete={(media) => handleUploadComplete(media as ImageMetadata)}
                      />
                    </div>

                    {/* Medien-Galerie */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm sm:text-base lg:text-lg">Medien-Galerie</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 sm:p-6">
                        {loading ? (
                          <div className="text-center py-6 sm:py-8 lg:py-12">
                            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto mb-3 sm:mb-4"></div>
                            <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">Lade Medien...</p>
                          </div>
                        ) : filteredImages.length === 0 ? (
                          <div className="text-center py-6 sm:py-8 lg:py-12">
                            <div className="text-muted-foreground mb-3 sm:mb-4">
                              <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mx-auto" />
                            </div>
                            <p className="text-muted-foreground text-xs sm:text-sm lg:text-base px-2">
                              {images.length === 0 
                                ? 'Noch keine Medien hochgeladen. Laden Sie oben neue Medien hoch.'
                                : 'Keine Medien entsprechen den aktuellen Filtern.'
                              }
                            </p>
                          </div>
                        ) : (
                          <MediaGallery
                            media={filteredImages}
                            onMediaDelete={handleImageDelete}
                            onMediaEdit={handleMediaEdit}
                            onMediaPreview={handleImageClick}
                            onBatchDelete={(ids) => {
                              ids.forEach(id => handleImageDelete(id));
                            }}
                            onBatchMove={(ids, targetDirectory) => {
                              ids.forEach(id => {
                                // Hier würde die Verschiebe-Logik implementiert
                                console.log(`Verschiebe ${id} nach ${targetDirectory}`);
                              });
                            }}
                            directories={directories}
                            selectedDirectory={selectedDirectory}
                            onDirectoryChange={setSelectedDirectory}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Verzeichnisse Tab */}
                <TabsContent value="directories">
                  <div className="space-y-4 sm:space-y-6">
                    {/* Verzeichnisverwaltung Header */}
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                          <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                            <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden xs:inline">Verzeichnisstruktur</span>
                            <span className="xs:hidden">Ordner</span>
                          </CardTitle>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setShowCreateDirectory(true)}
                              className="text-xs sm:text-sm"
                            >
                              <FolderPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              <span className="hidden xs:inline">Neues Verzeichnis</span>
                              <span className="xs:hidden">Neu</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                // Scan-Verzeichnisse ausführen
                                toast.success('Verzeichnisse werden gescannt...');
                              }}
                              className="text-xs sm:text-sm"
                            >
                              <Search className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              <span className="hidden xs:inline">Scannen</span>
                              <span className="xs:hidden">Scan</span>
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 sm:p-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 p-2 sm:p-3 rounded-md cursor-pointer transition-colors hover:bg-muted/50">
                            <Folder className="w-4 h-4" />
                            <span className="text-xs sm:text-sm font-medium">Alle Dateien</span>
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {mediaData?.media?.length || 0}
                            </Badge>
                          </div>
                          {(() => {
                            const dirs = directoriesData?.directories ?? [];
                            return dirs.length > 0 ? renderDirectoryTree(dirs) : (
                              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                                <Folder className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
                                <p className="text-xs sm:text-sm">Keine Verzeichnisse gefunden</p>
                              </div>
                            );
                          })()}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Dateien im ausgewählten Verzeichnis */}
                    {selectedDirectoryForAction && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <File className="w-5 h-5" />
                            Dateien in &quot;{selectedDirectoryForAction}&quot;
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {mediaData?.media
                              ?.filter(media => media.directory === selectedDirectoryForAction)
                              .map((media) => (
                                <Card key={media.id} className="overflow-hidden group">
                                  <div className="aspect-square bg-muted relative">
                                    {media.mediaType === 'image' ? (
                                      <Image
                                        src={media.path}
                                        alt={media.originalName}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-4xl">🎥</span>
                                      </div>
                                    )}
                                    
                                    {/* Overlay mit Aktionen */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                      <Button 
                                        size="sm" 
                                        variant="secondary"
                                        onClick={() => {
                                          // Konvertiere MediaMetadata zu ImageMetadata für die Vorschau
                                          const imageData: ImageMetadata = {
                                            id: media.id,
                                            filename: media.originalName,
                                            originalName: media.originalName,
                                            path: media.path,
                                            thumbnailPath: media.path,
                                            width: media.width || 0,
                                            height: media.height || 0,
                                            size: media.size,
                                            mimeType: media.mediaType === 'image' ? 'image/jpeg' : 'video/mp4',
                                            originalFormat: media.mediaType === 'image' ? 'jpeg' : 'mp4',
                                            directory: media.directory || '',
                                            tags: [],
                                            uploadedAt: media.uploadedAt,
                                            updatedAt: media.uploadedAt
                                          };
                                          handleImageClick(imageData);
                                        }}
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="destructive"
                                        onClick={() => handleDeleteMedia(media.id)}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate text-sm">{media.originalName}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {media.size} Bytes
                                        </p>
                                      </div>
                                      <span className="text-lg">
                                        {media.mediaType === 'image' ? '🖼️' : '🎥'}
                                      </span>
                                    </div>
                                    
                                    <div className="flex gap-1">
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handleMoveFile(media.id, 'archiv')}
                                        className="flex-1"
                                      >
                                        <Move className="w-3 h-3 mr-1" />
                                        Verschieben
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}


        </div>
      </main>

      <Footer />

      {/* Medien-Editoren */}
      {selectedImage && showImageEditor && (
        <>
          {/* Bild-Editor für Bilder */}
          {selectedImage.mimeType.startsWith('image/') && (
            <CompactImageEditor
              image={selectedImage}
              onClose={() => {
                setShowImageEditor(false);
                setSelectedImage(null);
              }}
              onSave={handleImageUpdate}
              onOptimize={handleOptimizeSingle}
              onConvertToWebP={handleConvertToWebP}
            />
          )}
          
          {/* Video-Editor für Videos */}
          {selectedImage.mimeType.startsWith('video/') && (
            <CompactVideoEditor
              media={selectedImage}
              onClose={() => {
                setShowImageEditor(false);
                setSelectedImage(null);
              }}
              onSave={handleImageUpdate}
            />
          )}
        </>
      )}

      {/* Modal für neues Verzeichnis */}
      {showCreateDirectory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Neues Verzeichnis erstellen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Verzeichnisname"
                value={newDirectoryName}
                onChange={(e) => setNewDirectoryName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateDirectory()}
              />
              <div className="flex gap-2">
                <Button onClick={handleCreateDirectory} className="flex-1">
                  Erstellen
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateDirectory(false);
                    setNewDirectoryName('');
                  }}
                  className="flex-1"
                >
                  Abbrechen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Medien-Vorschau */}
      {previewMedia && showMediaPreview && (
        <MediaPreview
          media={previewMedia}
          onClose={() => {
            setShowMediaPreview(false);
            setPreviewMedia(null);
          }}
          onEdit={(id) => {
            const media = images.find(img => img.id === id);
            if (media) {
              setSelectedImage(media);
              setShowImageEditor(true);
              setShowMediaPreview(false);
              setPreviewMedia(null);
            }
          }}
          onDelete={handleImageDelete}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        isOpen={showDeleteConfirmation}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Datei löschen"
        description="Sind Sie sicher, dass Sie diese Datei löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
        itemName={itemToDelete?.name}
        isLoading={deleteMediaMutation.isPending}
      />

      {/* Bearbeitungsformular für Fahndungen */}
      {showEditForm && editingInvestigationId && (
        <InvestigationEditForm
          investigationId={editingInvestigationId}
          onClose={handleCloseEditForm}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
} 