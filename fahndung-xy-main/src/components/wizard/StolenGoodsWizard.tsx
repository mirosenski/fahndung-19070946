"use client";

import React, { useState } from 'react';
import { FileText, MapPin } from 'lucide-react';
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

export function StolenGoodsWizard() {
  const [category, setCategory] = useState<string>('STOLEN_GOODS');
  const [formData, setFormData] = useState<FormData>({});

  const categories: Category[] = [
    { 
      id: 'STOLEN_GOODS', 
      label: 'Gesuchte Sachen', 
      icon: FileText,
      color: 'bg-green-500',
      description: 'Fahndung nach gestohlenem Eigentum'
    }
  ];

  const steps = ['category', 'basic', 'item', 'theft', 'media', 'contact'];

  const updateFormData = (field: string, value: string | number | boolean | null | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const ItemDetailsStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Gegenstandsbeschreibung</h2>
        <p className="text-gray-600">Detaillierte Beschreibung des gestohlenen Gegenstands.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Gegenstandsart <span className="text-red-500">*</span>
          </label>
          <select 
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => updateFormData('itemType', e.target.value)}
          >
            <option value="">Bitte wählen</option>
            <option value="vehicle">Fahrzeug</option>
            <option value="electronics">Elektronik</option>
            <option value="jewelry">Schmuck</option>
            <option value="art">Kunst</option>
            <option value="antiques">Antiquitäten</option>
            <option value="documents">Dokumente</option>
            <option value="other">Sonstiges</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Marke/Hersteller
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="z.B. BMW, Apple, etc."
            onChange={(e) => updateFormData('brand', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Modell/Bezeichnung
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="z.B. X5, iPhone 15, etc."
            onChange={(e) => updateFormData('model', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Seriennummer/Identifikationsnummer
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Seriennummer oder andere ID"
            onChange={(e) => updateFormData('serialNumber', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Farbe
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Farbe des Gegenstands"
            onChange={(e) => updateFormData('color', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Besondere Merkmale
          </label>
          <textarea
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Kratzer, Dellen, Modifikationen, etc..."
            onChange={(e) => updateFormData('distinguishingFeatures', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Geschätzter Wert
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="z.B. 50.000 €"
            onChange={(e) => updateFormData('estimatedValue', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const TheftDetailsStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Diebstahldetails</h2>
        <p className="text-gray-600">Wann und wo wurde der Gegenstand gestohlen?</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Diebstahlort <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ort des Diebstahls"
              onChange={(e) => updateFormData('theftLocation', e.target.value)}
            />
            <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <MapPin className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Diebstahldatum <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => updateFormData('theftDate', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Ungefähre Uhrzeit
          </label>
          <input
            type="time"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => updateFormData('theftTime', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Diebstahlmethode
          </label>
          <select 
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => updateFormData('theftMethod', e.target.value)}
          >
            <option value="">Bitte wählen</option>
            <option value="break-in">Einbruch</option>
            <option value="pickpocket">Taschendiebstahl</option>
            <option value="vehicle-theft">Fahrzeugdiebstahl</option>
            <option value="fraud">Betrug</option>
            <option value="robbery">Raub</option>
            <option value="other">Sonstiges</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Umstände des Diebstahls
          </label>
          <textarea
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Beschreiben Sie die Umstände..."
            onChange={(e) => updateFormData('theftCircumstances', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Verdächtige Personen
          </label>
          <textarea
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Beschreibung verdächtiger Personen..."
            onChange={(e) => updateFormData('suspects', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Zeugen
          </label>
          <textarea
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Angaben zu Zeugen..."
            onChange={(e) => updateFormData('witnesses', e.target.value)}
          />
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
      case 'item':
        return <ItemDetailsStep />;
      case 'theft':
        return <TheftDetailsStep />;
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