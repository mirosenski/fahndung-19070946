"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronRight, ChevronLeft, Upload, Camera, RefreshCw } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useWizard } from "./WizardContext";
import WizardPreviewTabs from "./WizardPreviewTabs";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { DEMO_CASES } from "~/types/wizard";

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

interface WizardBaseProps {
  category: string;
  steps: string[];
  renderStepContent: (stepName: string) => React.ReactNode;
}

export function WizardBase({ category, steps, renderStepContent }: WizardBaseProps) {
  const router = useRouter();
  const { 
    currentStep, 
    setCurrentStep, 
    resetData, 
    loadDemoData
  } = useWizard();

  const [formData, setFormData] = useState<FormData>({});
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [selectedDemo, setSelectedDemo] = useState<string>("Manuell");
  const [showDemoSelection, setShowDemoSelection] = useState<boolean>(true);
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const progress = steps.length > 0 ? (currentStep / steps.length) * 100 : 0;

  const nextStep = () => {
    if (validateStep()) {
      if (currentStep >= steps.length) {
        setShowPreview(true);
      } else {
        setCurrentStep((currentStep + 1) as 1 | 2 | 3 | 4 | 5);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as 1 | 2 | 3 | 4 | 5);
    }
  };

  const validateStep = (): boolean => {
    // Simple validation
    return true;
  };

  const handleBackToWizard = () => {
    setShowPreview(false);
  };

  const handleDemoSelect = (demoKey: string) => {
    setSelectedDemo(demoKey);
    if (demoKey === "Manuell") {
      resetData();
      setFormData({});
    } else {
      loadDemoData(demoKey);
      // Convert demo data to formData format
      const demoData = DEMO_CASES[demoKey as keyof typeof DEMO_CASES];
      if (demoData) {
        const convertedData = {
          category: demoData.step1.category,
          priority: demoData.step1.priority,
          caseNumber: demoData.step1.caseNumber,
          internalTitle: demoData.step1.internalTitle,
          title: demoData.step2.displayName,
          crimeType: getCrimeTypeFromDemo(demoKey),
          crimeLocation: demoData.step2.location,
          crimeDate: demoData.step2.date,
          crimeDescription: demoData.step4.description,
          gender: getGenderFromAge(demoData.step3.age),
          age: demoData.step3.age,
          height: demoData.step3.height,
          build: demoData.step3.build,
          distinguishingFeatures: demoData.step3.features,
          mainQuestion: demoData.step4.question,
          contactStation: demoData.step5.station,
          phone: demoData.step5.tel,
          email: demoData.step5.email,
          publishImmediately: demoData.step5.publish,
          shareOnSocialMedia: false
        };
        setFormData(convertedData);
      }
    }
    setShowDemoSelection(false);
  };

  const getCrimeTypeFromDemo = (demoKey: string): string => {
    switch (demoKey) {
      case "Raub in Stuttgart": return "robbery";
      case "Einbruch in Heidelberg": return "theft";
      case "Betrug in Karlsruhe": return "fraud";
      case "Körperverletzung in Mannheim": return "assault";
      default: return "";
    }
  };

  const getGenderFromAge = (age: string): string => {
    // Simple logic based on age description
    if (age.includes("25-30") || age.includes("28")) return "male";
    if (age.includes("35-40")) return "male";
    if (age.includes("20-25")) return "male";
    return "unknown";
  };

  const handleResetWizard = () => {
    resetData();
    setFormData({});
    setSelectedDemo("Manuell");
    setShowDemoSelection(true);
    setCurrentStep(1);
  };

  // handleFinish wird in der aktuellen Implementierung nicht verwendet
  // const handleFinish = () => {
  //   alert("Fahndung wurde erfolgreich erstellt!");
  //   router.replace("/admin");
  // };

  // Early return for loading state
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  // Show Demo Selection
  if (showDemoSelection) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Image
                  src="/logo.svg"
                  alt="Fahndung Logo"
                  width={24}
                  height={24}
                  className="w-6 h-6 mr-2"
                />
                Demo-Daten auswählen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Wählen Sie ein Szenario</h2>
                  <p className="text-muted-foreground">Wählen Sie ein Demo-Szenario oder starten Sie manuell.</p>
                </div>

                <div className="space-y-4">
                  {Object.keys(DEMO_CASES).map((demoKey) => (
                    <label key={demoKey} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="demoSelection"
                        value={demoKey}
                        checked={selectedDemo === demoKey}
                        onChange={(e) => setSelectedDemo(e.target.value)}
                        className="w-4 h-4 text-primary rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{demoKey}</div>
                        <div className="text-sm text-muted-foreground">
                          {demoKey === "Manuell" 
                            ? "Starten Sie mit leeren Feldern"
                            : `${DEMO_CASES[demoKey as keyof typeof DEMO_CASES].step2.shortInfo}`
                          }
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button variant="outline" onClick={() => router.back()}>
                    Zurück
                  </Button>
                  <Button onClick={() => handleDemoSelect(selectedDemo)}>
                    Weiter
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Footer />
      </div>
    );
  }

  // Show Preview Tabs if in preview mode
  if (showPreview) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <Header />

        {/* Preview Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <WizardPreviewTabs 
            formData={formData} 
            onBackToWizard={handleBackToWizard}
          />
        </div>

        {/* Footer */}
        <Footer />
      </div>
    );
  }

  const currentStepName = steps[currentStep - 1] || '';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Progress Bar */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Schritt {currentStep} von {steps.length || 1}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% abgeschlossen
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-card rounded-lg shadow-sm p-8">
          {renderStepContent(currentStepName)}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
            
            <Button
              variant="outline"
              onClick={handleResetWizard}
              className="text-red-600 hover:text-red-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          <Button
            onClick={nextStep}
            disabled={!category && currentStep === 1}
          >
            {currentStep >= (steps.length || 1) ? 'Vorschau anzeigen' : 'Weiter'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// Gemeinsame Komponenten für alle Wizards
export const CategorySelection = ({ categories, selectedCategory, onCategorySelect }: {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold mb-2">Wählen Sie die Fahndungskategorie</h2>
      <p className="text-muted-foreground">Bitte wählen Sie die passende Kategorie für Ihre Fahndung aus.</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {categories.map((cat) => {
        const Icon = cat.icon;
        return (
          <Card 
            key={cat.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedCategory === cat.id 
                ? 'ring-2 ring-primary bg-accent' 
                : 'hover:border-border'
            }`}
            onClick={() => onCategorySelect(cat.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${cat.color} text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{cat.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{cat.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  </div>
);

export const BasicInfoStep = ({ formData, updateFormData }: {
  formData: FormData;
  updateFormData: (field: string, value: string | number | boolean | null | undefined) => void;
}) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold mb-2">Grundlegende Informationen</h2>
      <p className="text-muted-foreground">Erfassen Sie die wichtigsten Basisdaten.</p>
    </div>

    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="priority">
          Priorität <span className="text-red-500">*</span>
        </Label>
        <select 
          id="priority"
          className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground"
          onChange={(e) => updateFormData('priority', e.target.value)}
          defaultValue={String(formData.priority || '')}
        >
          <option value="">Bitte wählen</option>
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
          onChange={(e) => updateFormData('caseNumber', e.target.value)}
          defaultValue={String(formData.caseNumber || '')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="internalTitle">
          Interner Titel
        </Label>
        <Input
          id="internalTitle"
          type="text"
          placeholder="Kurzer interner Titel"
          onChange={(e) => updateFormData('internalTitle', e.target.value)}
          defaultValue={String(formData.internalTitle || '')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="publicTitle">
          Öffentlicher Titel <span className="text-red-500">*</span>
        </Label>
        <Input
          id="publicTitle"
          type="text"
          placeholder="Titel für die Öffentlichkeit"
          onChange={(e) => updateFormData('publicTitle', e.target.value)}
          defaultValue={String(formData.publicTitle || '')}
        />
      </div>
    </div>
  </div>
);

export const MediaUploadStep = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold mb-2">Bilder und Medien</h2>
      <p className="text-muted-foreground">Laden Sie relevante Bilder und Dokumente hoch.</p>
    </div>

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Hauptbild</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Klicken oder Datei hierher ziehen</p>
          <p className="text-sm text-gray-500 mt-2">JPG, PNG bis 10MB</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Weitere Bilder</label>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer">
              <Camera className="w-8 h-8 text-gray-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const ContactStep = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold mb-2">Kontakt & Veröffentlichung</h2>
      <p className="text-gray-600">Kontaktinformationen für Hinweise.</p>
    </div>

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Hinweise an <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="z.B. Kripo Stuttgart"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Telefon</label>
          <input
            type="tel"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0711/110"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">E-Mail</label>
          <input
            type="email"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="hinweise@polizei.de"
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <label className="flex items-center space-x-3">
          <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
          <span>Sofort veröffentlichen</span>
        </label>
        <label className="flex items-center space-x-3 mt-2">
          <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
          <span>In sozialen Medien teilen</span>
        </label>
      </div>
    </div>
  </div>
); 