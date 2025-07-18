"use client";

import React, { useState } from 'react';
import { User, MapPin } from 'lucide-react';
import { WizardBase, CategorySelection, BasicInfoStep, MediaUploadStep, ContactStep } from './WizardBase';

interface FormData {
  [key: string]: string | number | boolean | null | undefined;
}

interface Category {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

export function MissingPersonWizard() {
  const [category, setCategory] = useState<string>('MISSING_PERSON');
  const [formData, setFormData] = useState<FormData>({});

  const categories: Category[] = [
    { 
      id: 'MISSING_PERSON', 
      label: 'Vermisste Person', 
      icon: User,
      color: 'bg-blue-500',
      description: 'Suche nach vermissten Personen'
    }
  ];

  const steps = ['category', 'basic', 'lastSeen', 'appearance', 'medical', 'media', 'contact'];

  const updateFormData = (field: string, value: string | number | boolean | null | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const LastSeenStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Letzter Aufenthaltsort</h2>
        <p className="text-gray-600">Wann und wo wurde die Person zuletzt gesehen?</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Letzter Aufenthaltsort <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ort eingeben"
              onChange={(e) => updateFormData('lastSeenLocation', e.target.value)}
            />
            <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <MapPin className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Datum und Uhrzeit <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => updateFormData('lastSeenDate', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Umstände des Verschwindens
          </label>
          <textarea
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Beschreiben Sie die Umstände..."
            onChange={(e) => updateFormData('disappearanceCircumstances', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Bekannte Aufenthaltsorte
          </label>
          <textarea
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Häufige Aufenthaltsorte, Freunde, Familie..."
            onChange={(e) => updateFormData('knownLocations', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const AppearanceStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Personenbeschreibung</h2>
        <p className="text-gray-600">Detaillierte Beschreibung der vermissten Person.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Geschlecht</label>
          <select 
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => updateFormData('gender', e.target.value)}
          >
            <option value="">Bitte wählen</option>
            <option value="male">Männlich</option>
            <option value="female">Weiblich</option>
            <option value="diverse">Divers</option>
            <option value="unknown">Unbekannt</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Alter</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="z.B. 25 Jahre"
            onChange={(e) => updateFormData('age', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Größe</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="z.B. 180 cm"
            onChange={(e) => updateFormData('height', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Statur</label>
          <select 
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => updateFormData('build', e.target.value)}
          >
            <option value="">Bitte wählen</option>
            <option value="slim">Schlank</option>
            <option value="normal">Normal</option>
            <option value="athletic">Sportlich</option>
            <option value="strong">Kräftig</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Besondere Merkmale</label>
        <textarea
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          placeholder="Tattoos, Narben, Auffälligkeiten..."
          onChange={(e) => updateFormData('distinguishingFeatures', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Kleidung beim Verschwinden</label>
        <textarea
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          placeholder="Beschreibung der Kleidung..."
          onChange={(e) => updateFormData('clothing', e.target.value)}
        />
      </div>
    </div>
  );

  const MedicalStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Medizinische Informationen</h2>
        <p className="text-gray-600">Wichtige medizinische Details für die Suche.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Medikamente <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Benötigte Medikamente..."
            onChange={(e) => updateFormData('medications', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Erkrankungen
          </label>
          <textarea
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Bekannte Erkrankungen..."
            onChange={(e) => updateFormData('medicalConditions', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Psychische Verfassung
          </label>
          <textarea
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Psychische Verfassung beim Verschwinden..."
            onChange={(e) => updateFormData('mentalState', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Suizidgefahr
          </label>
          <select 
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => updateFormData('suicideRisk', e.target.value)}
          >
            <option value="">Bitte wählen</option>
            <option value="none">Keine Anzeichen</option>
            <option value="low">Gering</option>
            <option value="medium">Mittel</option>
            <option value="high">Hoch</option>
            <option value="unknown">Unbekannt</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStepContent = (stepName: string) => {
    switch (stepName) {
      case 'category':
        return (
          <CategorySelection 
            categories={categories}
            selectedCategory={category}
            onCategorySelect={setCategory}
          />
        );
      case 'basic':
        return <BasicInfoStep formData={formData} updateFormData={updateFormData} />;
      case 'lastSeen':
        return <LastSeenStep />;
      case 'appearance':
        return <AppearanceStep />;
      case 'medical':
        return <MedicalStep />;
      case 'media':
        return <MediaUploadStep />;
      case 'contact':
        return <ContactStep />;
      default:
        return <div>Schritt nicht gefunden: {stepName}</div>;
    }
  };

  return (
    <WizardBase
      category={category}
      steps={steps}
      renderStepContent={renderStepContent}
    />
  );
} 