'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Badge } from '~/components/ui/badge';
import { Separator } from '~/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { 
  ArrowLeft, 
  Save, 
  X, 
  AlertTriangle, 
  Shield,
  User,
  FileText,
  MapPin,
  Phone,
  Mail,
  Building,
  Image as ImageIcon,
  Grid
} from 'lucide-react';
import { api } from '~/utils/api';
import { toast } from 'sonner';
import { getDemoSession } from '~/utils/session';
import { CardImageEditor } from '~/components/CardImageEditor';

interface InvestigationEditFormProps {
  investigationId: string;
  onClose: () => void;
  onSave: () => void;
}

interface CardImage {
  id: string;
  url: string;
  altText?: string;
  order: number;
  isMain: boolean;
  position: 'top' | 'center' | 'bottom';
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export function InvestigationEditForm({ investigationId, onClose, onSave }: InvestigationEditFormProps) {
  const [session, setSession] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // Formular-Daten
  const [formData, setFormData] = useState({
    caseNumber: '',
    title: '',
    category: '',
    priority: '',
    shortDescription: '',
    description: '',
    location: '',
    station: '',
    context: '',
    features: '',
    question: '',
    mainImage: '',
    phone: '',
    email: '',
    address: ''
  });

  // Karten-Bilder
  const [cardImages, setCardImages] = useState<CardImage[]>([]);

  // tRPC Queries und Mutations
  const { data: investigation, isLoading: isLoadingInvestigation } = api.investigation.getById.useQuery(
    { id: investigationId },
    { enabled: !!investigationId }
  );

  const updateInvestigationMutation = api.investigation.update.useMutation();

  // Session und Autorisierung prüfen
  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const sessionData = await getDemoSession();
        if (sessionData && sessionData.user) {
          setSession({
            id: sessionData.user.id,
            name: sessionData.user.name,
            email: sessionData.user.email,
            role: sessionData.user.role
          });
          
          if (sessionData.user.role === 'ADMIN') {
            setIsAuthorized(true);
          } else {
            toast.error('Keine Berechtigung zum Bearbeiten von Fahndungen');
            onClose();
          }
        } else {
          toast.error('Keine Berechtigung zum Bearbeiten von Fahndungen');
          onClose();
        }
      } catch (error) {
        console.error('Fehler bei der Autorisierung:', error);
        toast.error('Fehler bei der Autorisierung');
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthorization();
  }, [onClose]);

  // Formular mit Daten füllen
  useEffect(() => {
    if (investigation) {
      setFormData({
        caseNumber: investigation.caseNumber || '',
        title: investigation.title || '',
        category: investigation.category || '',
        priority: investigation.priority || '',
        shortDescription: investigation.shortDescription || '',
        description: investigation.description || '',
        location: investigation.location || '',
        station: investigation.station || '',
        context: investigation.context || '',
        features: investigation.features || '',
        question: investigation.question || '',
        mainImage: investigation.mainImage || '',
        phone: investigation.contact?.phone || '',
        email: investigation.contact?.email || '',
        address: investigation.contact?.address || ''
      });

      // Bilder für Karten vorbereiten
      const images: CardImage[] = [];
      if (investigation.mainImage) {
        images.push({
          id: 'main',
          url: investigation.mainImage,
          altText: investigation.title,
          order: 0,
          isMain: true,
          position: 'center'
        });
      }
      
      if (investigation.images) {
        investigation.images.forEach((img, index) => {
          images.push({
            id: img.id,
            url: img.url,
            altText: img.altText || `Bild ${index + 1}`,
            order: img.order || index + 1,
            isMain: false,
            position: 'center'
          });
        });
      }
      
      setCardImages(images);
    }
  }, [investigation]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!isAuthorized) {
      toast.error('Keine Berechtigung zum Bearbeiten');
      return;
    }

    setIsSaving(true);
    try {
      await updateInvestigationMutation.mutateAsync({
        id: investigationId,
        caseNumber: formData.caseNumber,
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
        address: formData.address
      });

      toast.success('Fahndung erfolgreich aktualisiert');
      onSave();
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      toast.error('Fehler beim Speichern der Fahndung');
    } finally {
      setIsSaving(false);
    }
  };





  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Prüfe Berechtigung...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  if (isLoadingInvestigation) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Fahndung...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg font-semibold">Fahndung bearbeiten</CardTitle>
            <Badge variant="outline" className="ml-2">
              {session?.role === 'ADMIN' ? 'Administrator' : 'Benutzer'}
            </Badge>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Speichern...' : 'Speichern'}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Autorisierungshinweis */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Autorisierter Bearbeitungsmodus
              </span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Sie bearbeiten diese Fahndung als {session?.role === 'ADMIN' ? 'Administrator' : 'Benutzer'}.
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Details</span>
              </TabsTrigger>
              <TabsTrigger value="cards" className="flex items-center space-x-2">
                <Grid className="w-4 h-4" />
                <span>Karten-Bilder</span>
              </TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6 mt-6">
              {/* Grundinformationen */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Grundinformationen</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="caseNumber">Aktenzeichen *</Label>
                    <Input
                      id="caseNumber"
                      value={formData.caseNumber}
                      onChange={(e) => handleInputChange('caseNumber', e.target.value)}
                      placeholder="z.B. F-2024-001"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Titel *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Kurzer, prägnanter Titel"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Kategorie *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Kategorie auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WANTED_PERSON">Straftäter</SelectItem>
                        <SelectItem value="MISSING_PERSON">Vermisste Person</SelectItem>
                        <SelectItem value="UNKNOWN_DEAD">Unbekannte Tote</SelectItem>
                        <SelectItem value="STOLEN_GOODS">Gesuchte Sachen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priorität *</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Priorität auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NORMAL">Normal</SelectItem>
                        <SelectItem value="URGENT">Eilfahndung</SelectItem>
                        <SelectItem value="NEW">Neu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Kurzbeschreibung *</Label>
                  <Textarea
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                    placeholder="Kurze Zusammenfassung der Fahndung"
                    rows={3}
                  />
                </div>
              </div>

              <Separator />

              {/* Detailinformationen */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Detailinformationen</span>
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Beschreibung *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Detaillierte Beschreibung der Fahndung"
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="context">Tathergang/Umstände</Label>
                  <Textarea
                    id="context"
                    value={formData.context}
                    onChange={(e) => handleInputChange('context', e.target.value)}
                    placeholder="Beschreibung des Tathergangs oder der Umstände"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="features">Besondere Merkmale</Label>
                  <Textarea
                    id="features"
                    value={formData.features}
                    onChange={(e) => handleInputChange('features', e.target.value)}
                    placeholder="Besondere Merkmale, Kennzeichen, etc."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="question">Hauptfrage</Label>
                  <Textarea
                    id="question"
                    value={formData.question}
                    onChange={(e) => handleInputChange('question', e.target.value)}
                    placeholder="z.B. 'Wer erkennt diese Person?'"
                    rows={2}
                  />
                </div>
              </div>

              <Separator />

              {/* Ort & Kontakt */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Ort & Kontakt</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Ort *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="z.B. Berlin, Deutschland"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="station">Dienststelle *</Label>
                    <Input
                      id="station"
                      value={formData.station}
                      onChange={(e) => handleInputChange('station', e.target.value)}
                      placeholder="z.B. Polizei Berlin"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+49 30 123456"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="kontakt@polizei.de"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Musterstraße 123"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Karten-Bilder Tab */}
            <TabsContent value="cards" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <Grid className="w-5 h-5" />
                    <span>Karten-Bildbearbeitung</span>
                  </h3>
                </div>

                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Hier können Sie das Hauptbild für die Karten-Darstellung bearbeiten. 
                    Das Bild kann verschoben, gezoomt und positioniert werden.
                  </p>
                </div>

                {/* Karten-Bildeditor */}
                {cardImages.length > 0 && cardImages[0] ? (
                  <CardImageEditor
                    imageUrl={cardImages[0].url}
                    title={formData.title}
                    location={formData.location}
                    status={investigation?.status || 'DRAFT'}
                    priority={formData.priority}
                    onImageChange={() => {
                      // Hier würde die Bild-Upload-Logik implementiert
                      toast.info('Bild-Upload wird implementiert...');
                    }}
                    onPositionChange={(position) => {
                      console.log('Neue Position:', position);
                    }}
                    onZoomChange={(zoom) => {
                      console.log('Neuer Zoom:', zoom);
                    }}
                    onReset={() => {
                      toast.success('Position zurückgesetzt');
                    }}
                  />
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Kein Bild für Karten vorhanden</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Laden Sie zuerst ein Hauptbild in den Details hoch.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Aktionsbereich */}
          <div className="flex justify-end space-x-2 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Speichern...' : 'Änderungen speichern'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 