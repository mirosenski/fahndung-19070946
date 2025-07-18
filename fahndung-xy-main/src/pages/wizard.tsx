import React, { useState } from 'react';
import Head from "next/head";
import { useRouter } from 'next/router';
import { 
  User, 
  AlertCircle, 
  FileText, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Image as ImageIcon,
  MapPin,
  Eye,
  Globe,
  Upload,
  Folder,
  Grid3X3,
  Search,
  X,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api } from "~/utils/api";
import Image from "next/image";

// Wizard-Schritte
const WIZARD_STEPS = [
  {
    id: 'basic-info',
    title: 'Grundinformationen',
    description: 'Kategorie, Status, Titel und Kurzbeschreibung',
    icon: FileText
  },
  {
    id: 'media',
    title: 'Medien',
    description: 'Hauptbild und weitere Bilder',
    icon: ImageIcon
  },
  {
    id: 'details',
    title: 'Detailinformationen',
    description: 'Ausführliche Beschreibung und Merkmale',
    icon: User
  },
  {
    id: 'location',
    title: 'Ort & Kontakt',
    description: 'Tatort, Dienststelle und Kontaktdaten',
    icon: MapPin
  },
  {
    id: 'preview',
    title: 'Vorschau & Veröffentlichung',
    description: 'Vorschau und Veröffentlichung',
    icon: Eye
  }
];

// Kategorien
const CATEGORIES = [
  { value: 'WANTED_PERSON', label: 'Straftäter', icon: User },
  { value: 'MISSING_PERSON', label: 'Vermisste Person', icon: AlertCircle },
  { value: 'UNKNOWN_DEAD', label: 'Unbekannte Tote', icon: FileText },
  { value: 'STOLEN_GOODS', label: 'Gesuchte Sachen', icon: FileText }
];

// Prioritäten
const PRIORITIES = [
  { value: 'NORMAL', label: 'Normal', color: 'bg-gray-500' },
  { value: 'URGENT', label: 'Eilig', color: 'bg-red-500' },
  { value: 'NEW', label: 'Neu', color: 'bg-blue-500' }
];

// Medien-Komponente
function MediaSelector({ 
  selectedMedia, 
  onMediaSelect, 
  onMediaRemove 
}: { 
  selectedMedia: Array<{ id: string; url: string; name: string; type: 'image' | 'video' }>;
  onMediaSelect: (media: { id: string; url: string; name: string; type: 'image' | 'video' }) => void;
  onMediaRemove: (id: string) => void;
}) {
  const [activeTab, setActiveTab] = useState("gallery");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDirectory, setSelectedDirectory] = useState("allgemein");

  // API-Queries
  const { data: mediaData } = api.media.getAll.useQuery({
    search: searchTerm,
    directory: selectedDirectory === "allgemein" ? undefined : selectedDirectory
  });
  const { data: directoriesData } = api.media.listDirectories.useQuery();

  const media = mediaData?.media || [];
  const directories = directoriesData?.directories || [];

  return (
    <div className="space-y-6">
      {/* Ausgewählte Medien */}
      {selectedMedia.length > 0 && (
        <div>
          <Label>Ausgewählte Medien ({selectedMedia.length})</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
            {selectedMedia.map((media) => (
              <div key={media.id} className="relative group">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  {media.type === 'image' ? (
                    <Image
                      src={media.url}
                      alt={media.name}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl">🎥</span>
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onMediaRemove(media.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medien-Auswahl Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <Grid3X3 className="w-4 h-4" />
            Galerie
          </TabsTrigger>
          <TabsTrigger value="server" className="flex items-center gap-2">
            <Folder className="w-4 h-4" />
            Server
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload
          </TabsTrigger>
        </TabsList>

        {/* Galerie Tab */}
        <TabsContent value="gallery" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Medien durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {media.map((item) => (
              <div
                key={item.id}
                className="relative group cursor-pointer"
                onClick={() => onMediaSelect({
                  id: item.id,
                  url: item.path,
                  name: item.originalName,
                  type: (item.mediaType || 'image') as 'image' | 'video'
                })}
              >
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  {(item.mediaType || 'image') === 'image' ? (
                    <Image
                      src={item.path}
                      alt={item.originalName}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl">🎥</span>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Server Tab */}
        <TabsContent value="server" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Select value={selectedDirectory} onValueChange={setSelectedDirectory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Verzeichnis auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="allgemein">Alle Verzeichnisse</SelectItem>
                {directories.map((dir) => (
                  <SelectItem key={dir.fullPath} value={dir.fullPath}>
                    {dir.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Dateien durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {media.map((item) => (
              <div
                key={item.id}
                className="relative group cursor-pointer"
                onClick={() => onMediaSelect({
                  id: item.id,
                  url: item.path,
                  name: item.originalName,
                  type: (item.mediaType || 'image') as 'image' | 'video'
                })}
              >
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  {(item.mediaType || 'image') === 'image' ? (
                    <Image
                      src={item.path}
                      alt={item.originalName}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl">🎥</span>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                                 <div className="absolute bottom-1 left-1 bg-black/75 text-white text-xs px-1 rounded">
                   {item.directory || 'Unbekannt'}
                 </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Ziehen Sie Dateien hierher oder klicken Sie zum Auswählen
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Unterstützte Formate: JPG, PNG, GIF, MP4, MOV (max. 10MB)
            </p>
            <Button variant="outline" size="sm">
              Dateien auswählen
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Oder verwenden Sie die Galerie/Server-Optionen oben
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function WizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Schritt 1: Grundinformationen
    category: '',
    priority: 'NORMAL',
    title: '',
    shortDescription: '',
    
    // Schritt 2: Medien
    mainImage: '',
    images: [] as Array<{ id: string; url: string; name: string; type: 'image' | 'video' }>,
    
    // Schritt 3: Detailinformationen
    description: '',
    context: '',
    features: '',
    question: '',
    
    // Schritt 4: Ort & Kontakt
    location: '',
    station: '',
    phone: '',
    email: '',
    address: '',
    
    // Schritt 5: Vorschau & Veröffentlichung
    caseNumber: ''
  });

  // tRPC Mutation für das Erstellen von Fahndungen
  const createInvestigationMutation = api.investigation.create.useMutation();

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMediaSelect = (media: { id: string; url: string; name: string; type: 'image' | 'video' }) => {
    // Füge das erste ausgewählte Medium als Hauptbild hinzu
    if (formData.images.length === 0) {
      setFormData(prev => ({ 
        ...prev, 
        mainImage: media.url,
        images: [...prev.images, media]
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        images: [...prev.images, media]
      }));
    }
  };

  const handleMediaRemove = (id: string) => {
    setFormData(prev => {
      const newImages = prev.images.filter(img => img.id !== id);
      return {
        ...prev,
        mainImage: newImages.length > 0 ? newImages[0]?.url || '' : '',
        images: newImages
      };
    });
  };

  const nextStep = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0: // Grundinformationen
        return formData.category && formData.title && formData.shortDescription;
      case 1: // Medien
        return formData.mainImage;
      case 2: // Detailinformationen
        return formData.description;
      case 3: // Ort & Kontakt
        return formData.location && formData.station;
      case 4: // Vorschau
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    try {
      // Generiere eine Fallnummer falls nicht vorhanden
      const caseNumber = formData.caseNumber || `F-${Date.now()}`;
      
      // Erstelle die Fahndung über die API
      const result = await createInvestigationMutation.mutateAsync({
        caseNumber,
        title: formData.title,
        category: formData.category as "WANTED_PERSON" | "MISSING_PERSON" | "UNKNOWN_DEAD" | "STOLEN_GOODS",
        priority: formData.priority as "NORMAL" | "URGENT" | "NEW",
        shortDescription: formData.shortDescription,
        description: formData.description,
        location: formData.location,
        station: formData.station,
        context: formData.context,
        features: formData.features,
        question: formData.question,
        mainImage: formData.mainImage,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        images: formData.images.map((img, index) => ({
          url: img.url,
          altText: img.name,
          order: index,
        })),
      });

      console.log('Fahndung erfolgreich erstellt:', result);
      
      // Erfolgsmeldung anzeigen
      alert('Fahndung erfolgreich erstellt! Sie werden zur Detailseite weitergeleitet.');
      
      // Weiterleitung zur Detailseite der neuen Fahndung
      router.push(`/fahndung/${result.id}`);
    } catch (error) {
      console.error('Fehler beim Erstellen der Fahndung:', error);
      alert('Fehler beim Erstellen der Fahndung. Bitte versuchen Sie es erneut.');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="category">Kategorie *</Label>
              <Select value={formData.category} onValueChange={(value) => updateFormData('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    return (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4" />
                          <span>{category.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priorität</Label>
              <Select value={formData.priority} onValueChange={(value) => updateFormData('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${priority.color}`}></div>
                        <span>{priority.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Titel/Name *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                placeholder="z.B. Max Mustermann"
              />
            </div>

            <div>
              <Label htmlFor="shortDescription">Kurzbeschreibung *</Label>
              <Textarea
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => updateFormData('shortDescription', e.target.value)}
                placeholder="Kurze Beschreibung für die Kartenvorderseite"
                rows={3}
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label>Medien auswählen *</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Wählen Sie Medien aus der Galerie, dem Server-Verzeichnis oder laden Sie neue Dateien hoch.
              </p>
              <MediaSelector
                selectedMedia={formData.images}
                onMediaSelect={handleMediaSelect}
                onMediaRemove={handleMediaRemove}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="description">Ausführliche Beschreibung *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Detaillierte Beschreibung der Fahndung"
                rows={5}
              />
            </div>

            <div>
              <Label htmlFor="context">Tathergang/Umstände</Label>
              <Textarea
                id="context"
                value={formData.context}
                onChange={(e) => updateFormData('context', e.target.value)}
                placeholder="Beschreibung des Tathergangs oder der Umstände"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="features">Besondere Merkmale</Label>
              <Textarea
                id="features"
                value={formData.features}
                onChange={(e) => updateFormData('features', e.target.value)}
                placeholder="Besondere Merkmale, Tattoos, Narben, etc."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="question">Frage an die Öffentlichkeit</Label>
              <Input
                id="question"
                value={formData.question}
                onChange={(e) => updateFormData('question', e.target.value)}
                placeholder="z.B. Wer erkennt die Person?"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="location">Tatort/Fundort *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => updateFormData('location', e.target.value)}
                placeholder="z.B. Stuttgart, Heidelberg"
              />
            </div>

            <div>
              <Label htmlFor="station">Zuständige Dienststelle *</Label>
              <Input
                id="station"
                value={formData.station}
                onChange={(e) => updateFormData('station', e.target.value)}
                placeholder="z.B. PP Heidelberg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  placeholder="z.B. 06221/110"
                />
              </div>
              <div>
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="z.B. kripo.heidelberg@polizei.bwl.de"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Adresse</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => updateFormData('address', e.target.value)}
                placeholder="Vollständige Adresse der Dienststelle"
                rows={2}
              />
            </div>
          </div>
        );

      case 4:
        const categoryLabel = CATEGORIES.find(c => c.value === formData.category)?.label;
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-blue-800">
                  Überprüfen Sie alle Angaben vor der Veröffentlichung
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="caseNumber">Fallnummer</Label>
              <Input
                id="caseNumber"
                value={formData.caseNumber}
                onChange={(e) => updateFormData('caseNumber', e.target.value)}
                placeholder="z.B. F-2024-001 (wird automatisch generiert falls leer)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Falls leer gelassen, wird automatisch eine Fallnummer generiert.
              </p>
            </div>

            {/* Vorschau der Fahndung */}
            <div className="border rounded-lg p-4 bg-muted/30">
              <h3 className="font-semibold mb-3">Vorschau</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kategorie:</span>
                  <span>{categoryLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Titel:</span>
                  <span>{formData.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ort:</span>
                  <span>{formData.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dienststelle:</span>
                  <span>{formData.station}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bilder:</span>
                  <span>{formData.images.length} ausgewählt</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>Neue Fahndung erstellen - Fahndungssystem</title>
        <meta name="description" content="Erstellen Sie eine neue Fahndung mit unserem strukturierten Wizard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-background">
        <Header />

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Neue Fahndung erstellen</h1>
              <div className="text-sm text-muted-foreground">
                Schritt {currentStep + 1} von {WIZARD_STEPS.length}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {WIZARD_STEPS.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index <= currentStep 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                    </div>
                    <div className="ml-2 hidden sm:block">
                      <div className="text-sm font-medium">{step.title}</div>
                      <div className="text-xs text-muted-foreground">{step.description}</div>
                    </div>
                  </div>
                  {index < WIZARD_STEPS.length - 1 && (
                    <div className={`flex-1 h-1 rounded ${
                      index < currentStep ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {(() => {
                  const step = WIZARD_STEPS[currentStep];
                  if (!step) return null;
                  const Icon = step.icon;
                  return <Icon className="w-5 h-5" />;
                })()}
                <span>{WIZARD_STEPS[currentStep]?.title || 'Unbekannter Schritt'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>

            <div className="flex space-x-2">
              {currentStep === WIZARD_STEPS.length - 1 ? (
                <Button onClick={handleSubmit} disabled={!isStepValid(currentStep)}>
                  <Globe className="w-4 h-4 mr-2" />
                  Fahndung veröffentlichen
                </Button>
              ) : (
                <Button 
                  onClick={nextStep} 
                  disabled={!isStepValid(currentStep)}
                >
                  Weiter
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
} 