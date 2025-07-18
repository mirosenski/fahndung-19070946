"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { WizardBase } from './WizardBase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormData {
  [key: string]: string | number | boolean | null | undefined;
}

export default function WantedPersonWizard() {
  const [formData, setFormData] = useState<FormData>({
    category: 'WANTED_PERSON',
    priority: 'NORMAL',
    mainQuestion: 'Wer erkennt die abgebildete Person oder kann weitere Hinweise geben?'
  });

  // Hauptfragen gemäß Kundenanforderung
  const mainQuestions = [
    "Wer hat die vermisste Person gesehen oder kann Hinweise zu ihrem Aufenthaltsort geben?",
    "Können Sie konkrete Hinweise zum aktuellen Aufenthaltsort des Gesuchten geben?", 
    "Wer erkennt die abgebildete Person oder kann weitere Hinweise geben?",
    "Wer sind die rechtmäßigen Eigentümer der abgebildeten Gegenstände?",
    "Wer kann Hinweise zur Identität der unbekannten Toten geben?",
    "Eigene Fragestellung"
  ];

  const steps = ['basic', 'crime', 'appearance', 'media', 'contact'];

  const updateFormData = (field: string, value: string | number | boolean | null | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Schritt 1: Grunddaten
  const BasicInfoStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Grunddaten</h2>
        <p className="text-muted-foreground">Erfassen Sie die grundlegenden Informationen für die Straftäter-Fahndung.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="priority">
            Priorität <span className="text-red-500">*</span>
          </Label>
          <select 
            id="priority"
            className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring"
            value={typeof formData.priority === 'string' || typeof formData.priority === 'number' ? formData.priority : ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFormData('priority', e.target.value)}
          >
            <option value="NORMAL">Normal</option>
            <option value="URGENT">Dringend</option>
            <option value="CRITICAL">EILFAHNDUNG</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="caseNumber">
            Aktenzeichen <span className="text-red-500">*</span>
          </Label>
          <Input
            id="caseNumber"
            type="text"
            placeholder="z.B. BW-2024/123"
            value={typeof formData.caseNumber === 'string' || typeof formData.caseNumber === 'number' ? formData.caseNumber : ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('caseNumber', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">
            Titel (Tatort - Delikt) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            type="text"
            placeholder="z.B. Stuttgart - Raub"
            value={typeof formData.title === 'string' || typeof formData.title === 'number' ? formData.title : ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('title', e.target.value)}
          />
          <p className="text-sm text-muted-foreground">Format: Tatort - Delikt (wie vom Kunden gewünscht)</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="internalTitle">
            Interner Titel
          </Label>
          <Input
            id="internalTitle"
            type="text"
            placeholder="Kurzer interner Titel"
            value={typeof formData.internalTitle === 'string' || typeof formData.internalTitle === 'number' ? formData.internalTitle : ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('internalTitle', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  // Schritt 2: Tatdetails
  const CrimeDetailsStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Tatdetails</h2>
        <p className="text-muted-foreground">Beschreiben Sie die Straftat und Umstände.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="crimeType">
            Tatvorwurf <span className="text-red-500">*</span>
          </Label>
          <select 
            id="crimeType"
            className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring"
            value={typeof formData.crimeType === 'string' || typeof formData.crimeType === 'number' ? formData.crimeType : ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFormData('crimeType', e.target.value)}
          >
            <option value="">Bitte wählen</option>
            <option value="murder">Mord/Totschlag</option>
            <option value="robbery">Raub/Überfall</option>
            <option value="fraud">Betrug</option>
            <option value="assault">Körperverletzung</option>
            <option value="theft">Diebstahl</option>
            <option value="other">Sonstiges</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="crimeLocation">
            Tatort <span className="text-red-500">*</span>
          </Label>
          <div className="flex space-x-2">
            <Input
              id="crimeLocation"
              type="text"
              placeholder="Ort eingeben"
              className="flex-1"
              value={typeof formData.crimeLocation === 'string' || typeof formData.crimeLocation === 'number' ? formData.crimeLocation : ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('crimeLocation', e.target.value)}
            />
            <Button variant="outline" size="icon">
              <MapPin className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="crimeDate">
            Tatzeit
          </Label>
          <Input
            id="crimeDate"
            type="datetime-local"
            value={typeof formData.crimeDate === 'string' || typeof formData.crimeDate === 'number' ? formData.crimeDate : ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('crimeDate', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="crimeDescription">
            Tathergang
          </Label>
          <textarea
            id="crimeDescription"
            className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring"
            rows={4}
            placeholder="Beschreiben Sie den Tathergang..."
            value={typeof formData.crimeDescription === 'string' || typeof formData.crimeDescription === 'number' ? formData.crimeDescription : ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateFormData('crimeDescription', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  // Schritt 3: Personenbeschreibung
  const AppearanceStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Personenbeschreibung</h2>
        <p className="text-muted-foreground">Detaillierte Beschreibung der gesuchten Person.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Geschlecht</Label>
          <select 
            className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring"
            value={typeof formData.gender === 'string' || typeof formData.gender === 'number' ? formData.gender : ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFormData('gender', e.target.value)}
          >
            <option value="">Bitte wählen</option>
            <option value="male">Männlich</option>
            <option value="female">Weiblich</option>
            <option value="diverse">Divers</option>
            <option value="unknown">Unbekannt</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label>Geschätztes Alter</Label>
          <Input
            type="text"
            placeholder="z.B. 25-30 Jahre"
            value={typeof formData.age === 'string' || typeof formData.age === 'number' ? formData.age : ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('age', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Größe</Label>
          <Input
            type="text"
            placeholder="z.B. 180 cm"
            value={typeof formData.height === 'string' || typeof formData.height === 'number' ? formData.height : ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('height', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Statur</Label>
          <select 
            className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring"
            value={typeof formData.build === 'string' || typeof formData.build === 'number' ? formData.build : ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFormData('build', e.target.value)}
          >
            <option value="">Bitte wählen</option>
            <option value="slim">Schlank</option>
            <option value="normal">Normal</option>
            <option value="athletic">Sportlich</option>
            <option value="strong">Kräftig</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Besondere Merkmale</Label>
        <textarea
          className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring"
          rows={3}
          placeholder="Tattoos, Narben, Auffälligkeiten..."
          value={typeof formData.distinguishingFeatures === 'string' || typeof formData.distinguishingFeatures === 'number' ? formData.distinguishingFeatures : ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateFormData('distinguishingFeatures', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Kleidung</Label>
        <textarea
          className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring"
          rows={3}
          placeholder="Beschreibung der Kleidung..."
          value={typeof formData.clothing === 'string' || typeof formData.clothing === 'number' ? formData.clothing : ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateFormData('clothing', e.target.value)}
        />
      </div>
    </div>
  );

  // Schritt 4: Medien
  const MediaUploadStep = () => {
    const getDemoImage = () => {
      // Das image-Property existiert nicht, daher Fallback verwenden
      return '/placeholder-image.jpg';
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Medien</h2>
          <p className="text-muted-foreground">Fügen Sie Fotos und Videos der gesuchten Person hinzu.</p>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Ziehen Sie Dateien hierher oder klicken Sie zum Auswählen
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, MP4 bis 10MB
                </p>
              </div>
              <Button variant="outline" size="sm">
                Dateien auswählen
              </Button>
            </div>
          </div>

          {/* Demo Image */}
          <div className="space-y-2">
            <Label>Demo-Bild</Label>
            <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
              <Image
                src={getDemoImage()}
                alt="Demo"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Schritt 5: Kontakt
  const ContactStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Kontakt</h2>
        <p className="text-muted-foreground">Kontaktdaten für Hinweise und Rückfragen.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="contactStation">
            Kontaktstelle <span className="text-red-500">*</span>
          </Label>
          <Input
            id="contactStation"
            type="text"
            placeholder="z.B. Polizeipräsidium Stuttgart"
            value={typeof formData.contactStation === 'string' || typeof formData.contactStation === 'number' ? formData.contactStation : ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('contactStation', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">
            Telefonnummer
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+49 711 1234-5678"
            value={typeof formData.phone === 'string' || typeof formData.phone === 'number' ? formData.phone : ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('phone', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            E-Mail
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="fahndung@polizei.bwl.de"
            value={typeof formData.email === 'string' || typeof formData.email === 'number' ? formData.email : ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('email', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mainQuestion">
            Hauptfrage <span className="text-red-500">*</span>
          </Label>
          <select 
            id="mainQuestion"
            className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring"
            value={typeof formData.mainQuestion === 'string' || typeof formData.mainQuestion === 'number' ? formData.mainQuestion : ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFormData('mainQuestion', e.target.value)}
          >
            <option value="">Bitte wählen</option>
            {mainQuestions.map((question, index) => (
              <option key={index} value={question}>{question}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Veröffentlichung</Label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={typeof formData.publishImmediately === 'boolean' ? formData.publishImmediately : false}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('publishImmediately', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Sofort veröffentlichen</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={typeof formData.shareOnSocialMedia === 'boolean' ? formData.shareOnSocialMedia : false}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('shareOnSocialMedia', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">In sozialen Medien teilen</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = (stepName: string) => {
    switch (stepName) {
      case 'basic':
        return <BasicInfoStep />;
      case 'crime':
        return <CrimeDetailsStep />;
      case 'appearance':
        return <AppearanceStep />;
      case 'media':
        return <MediaUploadStep />;
      case 'contact':
        return <ContactStep />;
      default:
        return null;
    }
  };

  return (
    <WizardBase
      steps={steps}
      renderStepContent={renderStepContent}
      category="WANTED_PERSON"
    />
  );
}