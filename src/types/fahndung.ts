import type { Database } from './supabase'

export type Fahndung = Database['public']['Tables']['fahndungen']['Row']
export type FahndungInsert = Database['public']['Tables']['fahndungen']['Insert']
export type FahndungUpdate = Database['public']['Tables']['fahndungen']['Update']

export type FahndungTyp = 'straftaeter' | 'vermisste' | 'unbekannte_tote' | 'sachen'
export type FahndungStatus = 'entwurf' | 'pruefung' | 'veroeffentlicht' | 'archiviert'
export type FahndungPrioritaet = 'niedrig' | 'normal' | 'hoch' | 'dringend'

// UI-spezifische Typen
export interface FahndungCardProps {
  fahndung: Fahndung
  isNew?: boolean
  isFeatured?: boolean
}

export interface FahndungFilters {
  typ?: FahndungTyp
  status?: FahndungStatus
  prioritaet?: FahndungPrioritaet
  ort?: string
}

// Hauptfrage-Typen basierend auf Kundenanforderungen
export type HauptfrageTyp = 
  | 'vermisste_person_gesehen'
  | 'aufenthaltsort_gesuchter'
  | 'person_erkannt'
  | 'eigentuemer_gegenstaende'
  | 'identitaet_unbekannte_tote'
  | 'spezielle_frage'

export interface Hauptfrage {
  typ: HauptfrageTyp
  text: string
  spezielleFrage?: string
}

// Mapping für UI-Anzeige
export const FAHNDUNG_TYP_LABELS: Record<FahndungTyp, string> = {
  straftaeter: 'Straftäter',
  vermisste: 'Vermisste',
  unbekannte_tote: 'Unbekannte Tote',
  sachen: 'Sachen'
}

export const FAHNDUNG_STATUS_LABELS: Record<FahndungStatus, string> = {
  entwurf: 'Entwurf',
  pruefung: 'Prüfung',
  veroeffentlicht: 'Veröffentlicht',
  archiviert: 'Archiviert'
}

export const FAHNDUNG_PRIORITAET_LABELS: Record<FahndungPrioritaet, string> = {
  niedrig: 'Niedrig',
  normal: 'Normal',
  hoch: 'Hoch',
  dringend: 'Dringend'
}

export const HAUPTFRAGE_TEXTE: Record<HauptfrageTyp, string> = {
  vermisste_person_gesehen: 'Wer hat die vermisste Person gesehen oder kann Hinweise zu ihrem Aufenthaltsort geben?',
  aufenthaltsort_gesuchter: 'Können Sie konkrete Hinweise zum aktuellen Aufenthaltsort des Gesuchten geben?',
  person_erkannt: 'Wer erkennt die abgebildete Person oder kann weitere Hinweise geben?',
  eigentuemer_gegenstaende: 'Wer sind die rechtmäßigen Eigentümer der abgebildeten Gegenstände?',
  identitaet_unbekannte_tote: 'Wer kann Hinweise zur Identität der unbekannten Toten geben?',
  spezielle_frage: ''
} 