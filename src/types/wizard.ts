import type { FahndungTyp, HauptfrageTyp } from './fahndung'

export interface WizardStep {
  id: string
  title: string
  description?: string
  isRequired?: boolean
  validation?: (data: WizardData) => boolean | string
}

export interface WizardData {
  // Grunddaten
  typ: FahndungTyp
  titel: string
  kurzbeschreibung?: string
  beschreibung?: string
  
  // Ortsdaten
  ort_name?: string
  ort_lat?: number
  ort_lng?: number
  ort_radius?: number
  
  // Zeitsteuerung
  veroeffentlicht_von?: string
  veroeffentlicht_bis?: string
  
  // Hauptfrage
  hauptfrage: HauptfrageTyp
  spezielleFrage?: string
  
  // Medien
  bilder: string[]
  
  // Metadaten
  prioritaet: 'niedrig' | 'normal' | 'hoch' | 'dringend'
  status: 'entwurf' | 'pruefung' | 'veroeffentlicht' | 'archiviert'
}

export interface WizardContextType {
  data: WizardData
  currentStep: number
  steps: WizardStep[]
  isLoading: boolean
  error: string | null
  
  // Actions
  updateData: (updates: Partial<WizardData>) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  reset: () => void
  save: () => Promise<void>
}

// Wizard-Schritte basierend auf Fahndungstyp
export const WIZARD_STEPS: Record<FahndungTyp, WizardStep[]> = {
  straftaeter: [
    { id: 'typ', title: 'Fahndungstyp', description: 'Wählen Sie den Typ der Fahndung' },
    { id: 'grunddaten', title: 'Grunddaten', description: 'Titel und Beschreibung' },
    { id: 'tatort', title: 'Tatort', description: 'Wo hat sich der Vorfall ereignet?' },
    { id: 'hauptfrage', title: 'Hauptfrage', description: 'Was möchten Sie wissen?' },
    { id: 'medien', title: 'Medien', description: 'Fotos und Dokumente hinzufügen' },
    { id: 'einstellungen', title: 'Einstellungen', description: 'Priorität und Veröffentlichung' }
  ],
  vermisste: [
    { id: 'typ', title: 'Fahndungstyp', description: 'Wählen Sie den Typ der Fahndung' },
    { id: 'grunddaten', title: 'Grunddaten', description: 'Titel und Beschreibung' },
    { id: 'letzter_aufenthaltsort', title: 'Letzter Aufenthaltsort', description: 'Wo wurde die Person zuletzt gesehen?' },
    { id: 'hauptfrage', title: 'Hauptfrage', description: 'Was möchten Sie wissen?' },
    { id: 'medien', title: 'Medien', description: 'Fotos und Dokumente hinzufügen' },
    { id: 'einstellungen', title: 'Einstellungen', description: 'Priorität und Veröffentlichung' }
  ],
  unbekannte_tote: [
    { id: 'typ', title: 'Fahndungstyp', description: 'Wählen Sie den Typ der Fahndung' },
    { id: 'grunddaten', title: 'Grunddaten', description: 'Titel und Beschreibung' },
    { id: 'fundort', title: 'Fundort', description: 'Wo wurde die Person gefunden?' },
    { id: 'hauptfrage', title: 'Hauptfrage', description: 'Was möchten Sie wissen?' },
    { id: 'medien', title: 'Medien', description: 'Fotos und Dokumente hinzufügen' },
    { id: 'einstellungen', title: 'Einstellungen', description: 'Priorität und Veröffentlichung' }
  ],
  sachen: [
    { id: 'typ', title: 'Fahndungstyp', description: 'Wählen Sie den Typ der Fahndung' },
    { id: 'grunddaten', title: 'Grunddaten', description: 'Titel und Beschreibung' },
    { id: 'fundort', title: 'Fundort', description: 'Wo wurde der Gegenstand gefunden?' },
    { id: 'hauptfrage', title: 'Hauptfrage', description: 'Was möchten Sie wissen?' },
    { id: 'medien', title: 'Medien', description: 'Fotos und Dokumente hinzufügen' },
    { id: 'einstellungen', title: 'Einstellungen', description: 'Priorität und Veröffentlichung' }
  ]
}

// Standard-Wizard-Daten
export const DEFAULT_WIZARD_DATA: WizardData = {
  typ: 'straftaeter',
  titel: '',
  kurzbeschreibung: '',
  beschreibung: '',
  ort_name: '',
  ort_lat: undefined,
  ort_lng: undefined,
  ort_radius: 0,
  veroeffentlicht_von: undefined,
  veroeffentlicht_bis: undefined,
  hauptfrage: 'person_erkannt',
  spezielleFrage: '',
  bilder: [],
  prioritaet: 'normal',
  status: 'entwurf'
} 