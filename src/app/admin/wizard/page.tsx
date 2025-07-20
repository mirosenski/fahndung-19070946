'use client';

import { useState, useContext, createContext } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, X, MapPin, Save, AlertCircle, Home, User, Upload, ImageIcon, Video, File, Trash2, Map } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';

type FahndungTyp = 'straftaeter' | 'vermisste' | 'unbekannte_tote' | 'sachen';
type FahndungStatus = 'entwurf' | 'pruefung' | 'veroeffentlicht' | 'archiviert';
type FahndungPrioritaet = 'niedrig' | 'normal' | 'hoch' | 'dringend';
type MedienKategorie = 'person' | 'ort' | 'beweis' | 'dokument' | 'video' | 'sonstiges';

interface MedienItem {
  id: string;
  datei: File;
  kategorie: MedienKategorie;
  beschreibung: string;
  standort?: string;
  datum?: string;
  tags: string[];
  url?: string;
}

interface WizardData {
  typ: FahndungTyp | null;
  titel: string;
  kurzbeschreibung: string;
  beschreibung: string;
  ort_name: string;
  hauptfrage: string;
  prioritaet: FahndungPrioritaet;
  status: FahndungStatus;
  medien: MedienItem[];
  standort_details: {
    latitude?: number;
    longitude?: number;
    adresse: string;
    beschreibung: string;
    hinweise: string;
  };
  besondere_momente: string[];
  hinweise: string;
}

interface WizardContextType {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  isValid: (step: number) => boolean;
}

const WizardContext = createContext<WizardContextType | null>(null);

const initialData: WizardData = {
  typ: null,
  titel: '',
  kurzbeschreibung: '',
  beschreibung: '',
  ort_name: '',
  hauptfrage: '',
  prioritaet: 'normal',
  status: 'entwurf',
  medien: [],
  standort_details: {
    adresse: '',
    beschreibung: '',
    hinweise: '',
  },
  besondere_momente: [],
  hinweise: '',
};

const steps = [
  { id: 1, title: 'Typ', required: ['typ'] },
  { id: 2, title: 'Daten', required: ['titel', 'kurzbeschreibung', 'beschreibung'] },
  { id: 3, title: 'Standort', required: ['ort_name', 'standort_details.adresse'] },
  { id: 4, title: 'Medien', required: [] },
  { id: 5, title: 'Frage', required: ['hauptfrage'] },
  { id: 6, title: 'Vorschau', required: [] },
];

export default function AdminWizardPage() {
  const router = useRouter();
  const [data, setData] = useState<WizardData>(initialData);
  const [currentStep, setCurrentStep] = useState(1);
  const [previewMode, setPreviewMode] = useState<'summary' | 'detail' | 'card'>('summary');

  const updateData = (updates: Partial<WizardData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const isValid = (step: number): boolean => {
    const stepData = steps[step - 1];
    if (!stepData) return false;
    
    return stepData.required.every(field => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        const parentValue = data[parent as keyof WizardData];
        if (typeof parentValue === 'object' && parentValue !== null) {
          return parentValue[child as keyof typeof parentValue] !== null && 
                 parentValue[child as keyof typeof parentValue] !== undefined && 
                 parentValue[child as keyof typeof parentValue] !== '';
        }
        return false;
      }
      const value = data[field as keyof WizardData];
      return value !== null && value !== undefined && value !== '';
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length && isValid(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    if (!isValid(currentStep)) return;
    
    try {
      console.log('Saving:', data);
      // TODO: Supabase Integration
      alert('Fahndung erfolgreich gespeichert!');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Fehler beim Speichern');
    }
  };

  const handleCancel = () => {
    if (confirm('Möchten Sie wirklich abbrechen? Alle Daten gehen verloren.')) {
      router.push('/dashboard');
    }
  };

  const contextValue: WizardContextType = {
    data,
    updateData,
    currentStep,
    nextStep,
    prevStep,
    isValid,
  };

  return (
    <WizardContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header */}
        <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
                  <Home className="h-6 w-6 text-blue-400" />
                  <span className="text-white font-medium">Home</span>
                </Link>
                <Link href="/dashboard" className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
                  <User className="h-6 w-6 text-green-400" />
                  <span className="text-white font-medium">Dashboard</span>
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleCancel}
                  className="flex items-center space-x-2 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Abbrechen</span>
                </button>
                <button 
                  onClick={handleSave}
                  disabled={!isValid(currentStep)}
                  className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Speichern</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Wizard Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">
                Fahndungs-Wizard
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Erstellen Sie eine professionelle Fahndung
              </p>
            </div>

            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Schritt {currentStep} von {steps.length}: {steps[currentStep - 1]?.title ?? 'Unbekannt'}
                </h2>
                <span className="text-gray-400 text-sm">
                  {Math.round((currentStep / steps.length) * 100)}% abgeschlossen
                </span>
              </div>
              
              {/* Progress Steps */}
              <div className="flex items-center space-x-2">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <button
                      onClick={() => setCurrentStep(step.id)}
                      disabled={!isValid(step.id - 1) && step.id > 1}
                      className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                        step.id <= currentStep 
                          ? 'text-blue-400 hover:text-blue-300' 
                          : 'text-gray-500 hover:text-gray-400'
                      } ${!isValid(step.id - 1) && step.id > 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isValid(step.id) ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <span className="h-5 w-5 rounded-full border-2 border-current flex items-center justify-center text-xs">
                          {step.id}
                        </span>
                      )}
                      <span className="text-sm font-medium">{step.title}</span>
                    </button>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-0.5 bg-gray-600 mx-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-8">
                      {currentStep === 6 ? (
          <PreviewStep previewMode={previewMode} setPreviewMode={setPreviewMode} />
        ) : (
          <WizardStepContent previewMode={previewMode} setPreviewMode={setPreviewMode} />
        )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center space-x-2 rounded-lg bg-gray-600 px-6 py-3 text-white hover:bg-gray-700 disabled:bg-gray-600/50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Zurück</span>
              </button>

              <div className="flex items-center space-x-4">
                {currentStep < steps.length ? (
                  <button
                    onClick={nextStep}
                    disabled={!isValid(currentStep)}
                    className="flex items-center space-x-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span>Weiter</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    disabled={!isValid(currentStep)}
                    className="flex items-center space-x-2 rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>Fahndung erstellen</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </WizardContext.Provider>
  );
}

function WizardStepContent({ previewMode, setPreviewMode }: { 
  previewMode: 'summary' | 'detail' | 'card'; 
  setPreviewMode: (mode: 'summary' | 'detail' | 'card') => void 
}) {
  const context = useContext(WizardContext);
  if (!context) return null;

  const { currentStep } = context;

  switch (currentStep) {
    case 1: return <TypeStep />;
    case 2: return <BasicDataStep />;
    case 3: return <LocationStep />;
    case 4: return <MedienStep />;
    case 5: return <QuestionStep />;
    case 6: return <PreviewStep previewMode={previewMode} setPreviewMode={setPreviewMode} />;
    default: return null;
  }
}

function TypeStep() {
  const context = useContext(WizardContext);
  if (!context) return null;

  const { data, updateData } = context;

  const types = [
    { id: 'straftaeter', label: 'Straftäter' },
    { id: 'vermisste', label: 'Vermisste Person' },
    { id: 'unbekannte_tote', label: 'Unbekannte Tote' },
    { id: 'sachen', label: 'Sachen' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Art der Fahndung</h3>
        <p className="text-gray-400">Wählen Sie die Art der Fahndung aus</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => updateData({ typ: type.id as FahndungTyp })}
            className={`p-6 rounded-lg border-2 text-left transition-all ${
              data.typ === type.id
                ? 'border-blue-500 bg-blue-500/20 text-white'
                : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40 hover:bg-white/10'
            }`}
          >
            <h4 className="font-semibold mb-2">{type.label}</h4>
            <p className="text-sm text-gray-400">
              {type.id === 'straftaeter' && 'Fahndung nach Straftätern'}
              {type.id === 'vermisste' && 'Suche nach vermissten Personen'}
              {type.id === 'unbekannte_tote' && 'Identifikation unbekannter Toter'}
              {type.id === 'sachen' && 'Fahndung nach Gegenständen oder Fahrzeugen'}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function BasicDataStep() {
  const context = useContext(WizardContext);
  if (!context) return null;

  const { data, updateData } = context;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Grunddaten</h3>
        <p className="text-gray-400">Erstellen Sie Titel und Beschreibung der Fahndung</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Titel * (max. 255 Zeichen)
          </label>
          <input
            type="text"
            value={data.titel}
            onChange={(e) => updateData({ titel: e.target.value })}
            maxLength={255}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            placeholder="Kurzer, prägnanter Titel der Fahndung"
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {data.titel.length}/255
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Kurzbeschreibung * (max. 500 Zeichen)
          </label>
          <textarea
            value={data.kurzbeschreibung}
            onChange={(e) => updateData({ kurzbeschreibung: e.target.value })}
            maxLength={500}
            rows={3}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            placeholder="Kurze Zusammenfassung der wichtigsten Informationen"
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {data.kurzbeschreibung.length}/500
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Detaillierte Beschreibung * (min. 100 Zeichen)
          </label>
          <textarea
            value={data.beschreibung}
            onChange={(e) => updateData({ beschreibung: e.target.value })}
            rows={6}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            placeholder="Detaillierte Beschreibung mit allen relevanten Informationen..."
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {data.beschreibung.length} Zeichen
            {data.beschreibung.length > 0 && data.beschreibung.length < 100 && (
              <span className="text-red-400 ml-2">(Mindestens 100 Zeichen erforderlich)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LocationStep() {
  const context = useContext(WizardContext);
  if (!context) return null;

  const { data, updateData } = context;

  const updateStandortDetails = (updates: Partial<typeof data.standort_details>) => {
    updateData({ 
      standort_details: { ...data.standort_details, ...updates } 
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Standort & Details</h3>
        <p className="text-gray-400">Erfassen Sie detaillierte Standort-Informationen</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Ortsname *
          </label>
          <input
            type="text"
            value={data.ort_name}
            onChange={(e) => updateData({ ort_name: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            placeholder="z.B. Berlin, Hauptbahnhof"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Vollständige Adresse *
          </label>
          <input
            type="text"
            value={data.standort_details.adresse}
            onChange={(e) => updateStandortDetails({ adresse: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            placeholder="Straße, Hausnummer, PLZ, Stadt"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Standort-Beschreibung
          </label>
          <textarea
            value={data.standort_details.beschreibung}
            onChange={(e) => updateStandortDetails({ beschreibung: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            placeholder="Beschreiben Sie den Standort genauer..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Besondere Hinweise
          </label>
          <textarea
            value={data.standort_details.hinweise}
            onChange={(e) => updateStandortDetails({ hinweise: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            placeholder="Wichtige Hinweise zum Standort..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Breitengrad (optional)
            </label>
            <input
              type="number"
              step="any"
              value={data.standort_details.latitude ?? ''}
              onChange={(e) => updateStandortDetails({ latitude: e.target.value ? parseFloat(e.target.value) : undefined })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              placeholder="52.5200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Längengrad (optional)
            </label>
            <input
              type="number"
              step="any"
              value={data.standort_details.longitude ?? ''}
              onChange={(e) => updateStandortDetails({ longitude: e.target.value ? parseFloat(e.target.value) : undefined })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              placeholder="13.4050"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MedienStep() {
  const [selectedKategorie, setSelectedKategorie] = useState<MedienKategorie>('person');
  const [uploading, setUploading] = useState(false);
  
  const context = useContext(WizardContext);
  if (!context) return null;

  const { data, updateData } = context;

  const kategorien = [
    { id: 'person', label: 'Person', icon: User, color: 'text-blue-400' },
    { id: 'ort', label: 'Ort', icon: MapPin, color: 'text-green-400' },
    { id: 'beweis', label: 'Beweis', icon: File, color: 'text-red-400' },
    { id: 'dokument', label: 'Dokument', icon: File, color: 'text-yellow-400' },
    { id: 'video', label: 'Video', icon: Video, color: 'text-purple-400' },
    { id: 'sonstiges', label: 'Sonstiges', icon: File, color: 'text-gray-400' },
  ];

  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    
    for (const file of Array.from(files)) {
      const mediaItem: MedienItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        datei: file,
        kategorie: selectedKategorie,
        beschreibung: '',
        tags: [],
        url: URL.createObjectURL(file),
      };
      
      updateData({ medien: [...data.medien, mediaItem] });
    }
    
    setUploading(false);
  };

  const removeMedia = (id: string) => {
    updateData({ 
      medien: data.medien.filter(item => item.id !== id) 
    });
  };

  const updateMedia = (id: string, updates: Partial<MedienItem>) => {
    updateData({
      medien: data.medien.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    });
  };

  const getKategorieMedien = (kategorie: MedienKategorie) => {
    return data.medien.filter(item => item.kategorie === kategorie);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Medien-Galerie</h3>
        <p className="text-gray-400">Laden Sie Bilder, Videos und Dokumente hoch</p>
      </div>

      {/* Kategorie-Auswahl */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-white">Kategorie auswählen:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {kategorien.map((kat) => {
              const IconComponent = kat.icon;
              return (
                <button
                  key={kat.id}
                  onClick={() => setSelectedKategorie(kat.id as MedienKategorie)}
                  className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-all ${
                    selectedKategorie === kat.id
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40 hover:bg-white/10'
                  }`}
                >
                  <IconComponent className={`h-5 w-5 ${kat.color}`} />
                  <span className="text-sm font-medium">{kat.label}</span>
                </button>
              );
            })}
        </div>
      </div>

      {/* Upload-Bereich */}
      <div className="space-y-4">
        <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/40 transition-colors">
          <input
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
            id="file-upload"
            disabled={uploading}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="space-y-4">
              <Upload className="h-12 w-12 mx-auto text-gray-400" />
              <div>
                <p className="text-white font-medium">Dateien hierher ziehen oder klicken</p>
                <p className="text-gray-400 text-sm">Bilder, Videos, PDFs (max. 10MB pro Datei)</p>
              </div>
              {uploading && (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-blue-400">Wird hochgeladen...</span>
                </div>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Medien-Galerie */}
      <div className="space-y-6">
        {kategorien.map((kat) => {
          const kategorieMedien = getKategorieMedien(kat.id as MedienKategorie);
          if (kategorieMedien.length === 0) return null;
          
          const IconComponent = kat.icon;
          return (
            <div key={kat.id} className="space-y-4">
              <div className="flex items-center space-x-2">
                <IconComponent className={`h-5 w-5 ${kat.color}`} />
                <h4 className="text-md font-medium text-white">{kat.label}</h4>
                <span className="text-gray-400 text-sm">({kategorieMedien.length})</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kategorieMedien.map((media) => (
                  <div key={media.id} className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
                    {/* Vorschau */}
                    <div className="relative aspect-video bg-white/5 rounded overflow-hidden">
                      {media.url && (
                        <NextImage 
                          src={media.url} 
                          alt={media.beschreibung || 'Medien-Vorschau'}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      )}
                      <button
                        onClick={() => removeMedia(media.id)}
                        className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-500 rounded text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {/* Details */}
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={media.beschreibung}
                        onChange={(e) => updateMedia(media.id, { beschreibung: e.target.value })}
                        placeholder="Beschreibung..."
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none text-sm"
                      />
                      
                      <input
                        type="text"
                        value={media.standort ?? ''}
                        onChange={(e) => updateMedia(media.id, { standort: e.target.value })}
                        placeholder="Standort (optional)..."
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none text-sm"
                      />
                      
                      <input
                        type="text"
                        value={media.tags.join(', ')}
                        onChange={(e) => updateMedia(media.id, { tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                        placeholder="Tags (kommagetrennt)..."
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuestionStep() {
  const context = useContext(WizardContext);
  if (!context) return null;

  const { data, updateData } = context;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Hauptfrage</h3>
        <p className="text-gray-400">Was möchten Sie von der Öffentlichkeit wissen?</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Ihre Hauptfrage *
          </label>
          <textarea
            value={data.hauptfrage}
            onChange={(e) => updateData({ hauptfrage: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            placeholder="Formulieren Sie Ihre Hauptfrage..."
          />
        </div>
      </div>
    </div>
  );
}

function PreviewStep({ previewMode, setPreviewMode }: { previewMode: 'summary' | 'detail' | 'card'; setPreviewMode: (mode: 'summary' | 'detail' | 'card') => void }) {
  const context = useContext(WizardContext);
  if (!context) return null;

  const { data } = context;

  const getTypLabel = (typ: FahndungTyp | null) => {
    switch (typ) {
      case 'straftaeter': return 'Straftäter';
      case 'vermisste': return 'Vermisste Person';
      case 'unbekannte_tote': return 'Unbekannte Tote';
      case 'sachen': return 'Sachen';
      default: return 'Nicht ausgewählt';
    }
  };

  const getPrioritaetLabel = (prioritaet: FahndungPrioritaet) => {
    switch (prioritaet) {
      case 'niedrig': return 'Niedrig';
      case 'normal': return 'Normal';
      case 'hoch': return 'Hoch';
      case 'dringend': return 'Dringend';
      default: return 'Normal';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Vorschau & Zusammenfassung</h3>
        <p className="text-gray-400">Überprüfen Sie alle Daten vor der Veröffentlichung</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-white/10 rounded-lg p-1">
        <button
          onClick={() => setPreviewMode('summary')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            previewMode === 'summary'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Zusammenfassung
        </button>
        <button
          onClick={() => setPreviewMode('detail')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            previewMode === 'detail'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Detailseite
        </button>
        <button
          onClick={() => setPreviewMode('card')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            previewMode === 'card'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Fahndungskarte
        </button>
      </div>

      {/* Preview Content */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
        {previewMode === 'summary' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Grunddaten</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Typ:</span>
                    <span className="text-white">{getTypLabel(data.typ)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Titel:</span>
                    <span className="text-white">{data.titel || 'Nicht angegeben'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Priorität:</span>
                    <span className="text-white">{getPrioritaetLabel(data.prioritaet)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-white">Standort</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ort:</span>
                    <span className="text-white">{data.ort_name || 'Nicht angegeben'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-white">Beschreibung</h4>
              <div className="text-sm text-gray-300 bg-white/5 border border-white/10 p-3 rounded-lg">
                {data.kurzbeschreibung || 'Keine Kurzbeschreibung angegeben'}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-white">Hauptfrage</h4>
              <div className="text-sm text-gray-300 bg-white/5 border border-white/10 p-3 rounded-lg">
                {data.hauptfrage || 'Keine Hauptfrage angegeben'}
              </div>
            </div>
          </div>
        )}

        {previewMode === 'detail' && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold text-white mb-2">{data.titel || 'Titel der Fahndung'}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span className="bg-blue-600 px-2 py-1 rounded text-white">{getTypLabel(data.typ)}</span>
                <span className="bg-yellow-600 px-2 py-1 rounded text-white">{getPrioritaetLabel(data.prioritaet)}</span>
                {data.ort_name && (
                  <span className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{data.ort_name}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Kurzbeschreibung</h3>
                <p className="text-gray-300">{data.kurzbeschreibung || 'Keine Kurzbeschreibung verfügbar'}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Detaillierte Beschreibung</h3>
                <p className="text-gray-300 whitespace-pre-wrap">{data.beschreibung || 'Keine detaillierte Beschreibung verfügbar'}</p>
              </div>

              {/* Standort-Details */}
              {data.standort_details.adresse && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                    <Map className="h-5 w-5 text-blue-400" />
                    <span>Standort-Details</span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-400 text-sm">Adresse:</span>
                      <p className="text-white">{data.standort_details.adresse}</p>
                    </div>
                    {data.standort_details.beschreibung && (
                      <div>
                        <span className="text-gray-400 text-sm">Beschreibung:</span>
                        <p className="text-gray-300">{data.standort_details.beschreibung}</p>
                      </div>
                    )}
                    {data.standort_details.hinweise && (
                      <div>
                        <span className="text-gray-400 text-sm">Hinweise:</span>
                        <p className="text-gray-300">{data.standort_details.hinweise}</p>
                      </div>
                    )}
                                            {(data.standort_details.latitude ?? data.standort_details.longitude) && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Breitengrad:</span>
                          <p className="text-white">{data.standort_details.latitude}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Längengrad:</span>
                          <p className="text-white">{data.standort_details.longitude}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Medien-Galerie */}
              {data.medien.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <ImageIcon className="h-5 w-5 text-green-400" />
                    <span>Medien-Galerie</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.medien.map((media) => (
                      <div key={media.id} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                        <div className="aspect-video bg-white/5 relative">
                          {media.url && (
                            <NextImage 
                              src={media.url} 
                              alt={media.beschreibung || 'Medien-Vorschau'}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          )}
                          <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
                            {media.kategorie}
                          </div>
                        </div>
                        <div className="p-3 space-y-2">
                          {media.beschreibung && (
                            <p className="text-white text-sm">{media.beschreibung}</p>
                          )}
                          {media.standort && (
                            <div className="flex items-center space-x-1 text-gray-400 text-xs">
                              <MapPin className="h-3 w-3" />
                              <span>{media.standort}</span>
                            </div>
                          )}
                          {media.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {media.tags.map((tag, index) => (
                                <span key={index} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Hauptfrage</h3>
                <p className="text-gray-300">{data.hauptfrage || 'Keine Hauptfrage verfügbar'}</p>
              </div>
            </div>
          </div>
        )}

        {previewMode === 'card' && (
          <div className="max-w-sm mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-blue-600 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">{getTypLabel(data.typ)}</span>
                  <span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                    {getPrioritaetLabel(data.prioritaet)}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-2">{data.titel || 'Titel der Fahndung'}</h3>
                <p className="text-gray-600 text-sm mb-3">{data.kurzbeschreibung || 'Keine Beschreibung verfügbar'}</p>
                
                {data.ort_name && (
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{data.ort_name}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Fahndungskarte</span>
                  <span>Vorschau</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Validation Status */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
        <h4 className="font-semibold text-white mb-3">Validierung</h4>
        <div className="space-y-2">
          {[
            { label: 'Typ ausgewählt', valid: data.typ !== null },
            { label: 'Titel angegeben', valid: data.titel.trim() !== '' },
            { label: 'Kurzbeschreibung angegeben', valid: data.kurzbeschreibung.trim() !== '' },
            { label: 'Beschreibung angegeben', valid: data.beschreibung.trim() !== '' },
            { label: 'Ort angegeben', valid: data.ort_name.trim() !== '' },
            { label: 'Hauptfrage angegeben', valid: data.hauptfrage.trim() !== '' },
          ].map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              {item.valid ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm ${item.valid ? 'text-green-400' : 'text-red-400'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 