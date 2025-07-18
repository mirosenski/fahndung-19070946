"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { WizardData, WizardStep, DEMO_CASES } from "~/types/wizard";

interface WizardContextType {
  currentStep: WizardStep;
  data: WizardData;
  isClient: boolean;
  setCurrentStep: (step: WizardStep) => void;
  updateData: (step: keyof WizardData, data: Record<string, unknown>) => void;
  resetData: () => void;
  loadDemoData: (demoKey: string) => void;
  getProgress: () => number;
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

const initialData: WizardData = {
  step1: {
    category: "",
    priority: "Normal",
    caseNumber: "",
    internalTitle: "",
  },
  step2: {
    displayName: "",
    shortInfo: "",
    location: "",
    date: "",
    status: "NEU",
  },
  step3: {
    age: "",
    height: "",
    build: "",
    hairColor: "",
    hairStyle: "",
    eyes: "",
    features: "",
    clothing: "",
  },
  step4: {
    question: "",
    description: "",
    context: "",
  },
  step5: {
    tel: "",
    email: "",
    formUrl: "",
    station: "",
    location: "",
    areaInsteadOfPoint: false,
    preview: true,
    publish: false,
  },
};

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [data, setData] = useState<WizardData>(initialData);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load data from localStorage if available
    const savedData = localStorage.getItem("wizard-data");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setData(parsedData);
      } catch (error) {
        console.error("Error loading wizard data:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("wizard-data", JSON.stringify(data));
    }
  }, [data, isClient]);

  const updateData = (step: keyof WizardData, stepData: Record<string, unknown>) => {
    setData(prev => ({
      ...prev,
      [step]: { ...prev[step], ...stepData }
    }));
  };

  const resetData = () => {
    setData(initialData);
    setCurrentStep(1);
    if (isClient) {
      localStorage.removeItem("wizard-data");
    }
  };

  const loadDemoData = (demoKey: string) => {
    const demoData = DEMO_CASES[demoKey as keyof typeof DEMO_CASES];
    if (demoData) {
      setData(demoData);
    }
  };

  const getProgress = () => {
    return (currentStep / 5) * 100;
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return !!(data.step1.category && data.step1.caseNumber);
      case 2:
        return !!(data.step2.displayName && data.step2.location);
      case 3:
        return !!(data.step3.age || data.step3.height || data.step3.build);
      case 4:
        return !!(data.step4.question && data.step4.description);
      case 5:
        return !!(data.step5.tel && data.step5.station);
      default:
        return false;
    }
  };

  const canGoPrevious = () => {
    return currentStep > 1;
  };

  const value: WizardContextType = {
    currentStep,
    data,
    isClient,
    setCurrentStep,
    updateData,
    resetData,
    loadDemoData,
    getProgress,
    canGoNext,
    canGoPrevious,
  };

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
} 