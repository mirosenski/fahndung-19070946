"use client";

import React, { useState } from 'react';
import { AlertCircle, MapPin } from 'lucide-react';
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

export function UnknownDeadWizard() {
  const [category, setCategory] = useState<string>('UNKNOWN_DEAD');
  const [formData, setFormData] = useState<FormData>({});

  const categories: Category[] = [
    { 
      id: 'UNKNOWN_DEAD', 
      label: 'Unbekannte Tote', 
      icon: AlertCircle,
      color: 'bg-gray-500',
      description: 'Identifizierung unbekannter Verstorbener'
    }
  ];

  const steps = ['category', 'basic', 'discovery', 'appearance', 'belongings', 'media', 'contact'];

  const updateFormData = (field: string, value: string | number | boolean | null | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const DiscoveryStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Fundort und Umstände</h2>
        <p className="text-gray-600">Wo und wann wurde die Person gefunden?</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Fundort <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Genauer Fundort"
              onChange={(e) => updateFormData('discoveryLocation', e.target.value)}
            />
            <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <MapPin className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Funddatum <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => updateFormData('discoveryDate', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Fundumstände
          </label>
          <textarea
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Beschreibung der Fundumstände..."
            onChange={(e) => updateFormData('discoveryCircumstances', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Geschätzter Todeszeitpunkt
          </label>
          <input
            type="datetime-local"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => updateFormData('estimatedDeathTime', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Todesursache (vorläufig)
          </label>
          <select 
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => updateFormData('causeOfDeath', e.target.value)}
          >
            <option value="">Bitte wählen</option>
            <option value="natural">Natürlicher Tod</option>
            <option value="accident">Unfall</option>
            <option value="suicide">Suizid</option>
            <option value="homicide">Tötungsdelikt</option>
            <option value="unknown">Unbekannt</option>
          </select>
        </div>
      </div>
    </div>
  );

  const AppearanceStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Personenbeschreibung</h2>
        <p className="text-gray-600">Detaillierte Beschreibung der verstorbenen Person.</p>
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
          <label className="block text-sm font-medium mb-2">Geschätztes Alter</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="z.B. 25-30 Jahre"
            onChange={(e) => updateFormData('estimatedAge', e.target.value)}
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
        <label className="block text-sm font-medium mb-2">Kleidung</label>
        <textarea
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          placeholder="Beschreibung der Kleidung..."
          onChange={(e) => updateFormData('clothing', e.target.value)}
        />
      </div>
    </div>
  );

  const BelongingsStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Gefundene Gegenstände</h2>
        <p className="text-gray-600">Beschreibung der bei der Person gefundenen Gegenstände.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Dokumente</label>
          <textarea
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Ausweise, Papiere, Dokumente..."
            onChange={(e) => updateFormData('documents', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Elektronische Geräte</label>
          <textarea
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Handy, Laptop, etc..."
            onChange={(e) => updateFormData('electronics', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Schmuck und Wertgegenstände</label>
          <textarea
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Ringe, Uhren, etc..."
            onChange={(e) => updateFormData('jewelry', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Sonstige Gegenstände</label>
          <textarea
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Weitere gefundene Gegenstände..."
            onChange={(e) => updateFormData('otherItems', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderStepContent = (stepName: string) => {
    switch (stepName) {
      case 'category':
        return <CategorySelection categories={categories} selectedCategory={category} onCategorySelect={setCategory} />;
      case 'basic':
        return <BasicInfoStep formData={formData} updateFormData={updateFormData} />;
      case 'discovery':
        return <DiscoveryStep />;
      case 'appearance':
        return <AppearanceStep />;
      case 'belongings':
        return <BelongingsStep />;
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
      category={category}
    />
  );
} 