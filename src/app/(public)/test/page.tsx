import Link from 'next/link'
import { FahndungCard } from '@/components/fahndung/FahndungCard'

export default function TestPage() {
  // Mock Fahndungen für die Test-Seite
  const mockFahndungen = [
    {
      id: '1',
      typ: 'straftaeter' as const,
      status: 'veroeffentlicht' as const,
      prioritaet: 'hoch' as const,
      titel: 'Gesuchter Straftäter in Berlin',
      kurzbeschreibung: 'Ein gesuchter Straftäter wurde zuletzt in Berlin gesehen. Bitte melden Sie sich bei der Polizei.',
      beschreibung: 'Der Verdächtige wurde zuletzt in der Nähe des Alexanderplatzes gesehen. Er trägt eine schwarze Jacke und eine Baseballkappe.',
      ort_name: 'Berlin, Mitte',
      ort_lat: 52.5200,
      ort_lng: 13.4050,
      ort_radius: 5000,
      erstellt_am: '2024-01-15T10:00:00Z',
      aktualisiert_am: '2024-01-15T10:00:00Z',
      veroeffentlicht_von: '2024-01-15T10:00:00Z',
      erstellt_von: null,
      veroeffentlicht_bis: null,
      wizard_data: {}
    },
    {
      id: '2',
      typ: 'vermisste' as const,
      status: 'veroeffentlicht' as const,
      prioritaet: 'dringend' as const,
      titel: 'Vermisste Person in Hamburg',
      kurzbeschreibung: 'Eine 25-jährige Frau wird seit gestern vermisst. Sie war zuletzt am Hauptbahnhof gesehen.',
      beschreibung: 'Die vermisste Person trägt eine rote Jacke und hat blonde Haare. Sie war zuletzt am Hauptbahnhof Hamburg gesehen worden.',
      ort_name: 'Hamburg, Hauptbahnhof',
      ort_lat: 53.5511,
      ort_lng: 9.9937,
      ort_radius: 3000,
      erstellt_am: '2024-01-14T08:00:00Z',
      aktualisiert_am: '2024-01-14T08:00:00Z',
      veroeffentlicht_von: '2024-01-14T08:00:00Z',
      erstellt_von: null,
      veroeffentlicht_bis: null,
      wizard_data: {}
    },
    {
      id: '3',
      typ: 'sachen' as const,
      status: 'veroeffentlicht' as const,
      prioritaet: 'normal' as const,
      titel: 'Verlorener Schmuck gefunden',
      kurzbeschreibung: 'Ein wertvoller Ring wurde im Stadtpark gefunden. Der Besitzer kann sich melden.',
      beschreibung: 'Ein goldener Ring mit einem Diamanten wurde im Stadtpark München gefunden. Der Ring hat eine Inschrift.',
      ort_name: 'München, Stadtpark',
      ort_lat: 48.1351,
      ort_lng: 11.5820,
      ort_radius: 1000,
      erstellt_am: '2024-01-13T15:00:00Z',
      aktualisiert_am: '2024-01-13T15:00:00Z',
      veroeffentlicht_von: '2024-01-13T15:00:00Z',
      erstellt_von: null,
      veroeffentlicht_bis: null,
      wizard_data: {}
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header mit Wizard-Link */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Test-Seite für Fahndungssystem
                </h1>
                <p className="text-gray-600">
                  Diese Seite zeigt den Status des Fahndungssystems und die 3D-Flip-Karten.
                </p>
              </div>
              <Link 
                href="/admin/wizard" 
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                + Neue Fahndung erstellen (Wizard)
              </Link>
            </div>
          </div>

          {/* 3D Flip Cards */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Professionelle 3D-Flip-Karten
            </h2>
            <p className="text-gray-600 mb-6">
              Klicken Sie auf die Karten, um den 3D-Flip-Effekt zu sehen.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockFahndungen.map((fahndung, index) => (
                <FahndungCard 
                  key={fahndung.id}
                  fahndung={fahndung}
                  isNew={index === 0}
                  isFeatured={index === 1}
                />
              ))}
            </div>
          </div>
          
          {/* System-Status */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              System-Status
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Supabase-Verbindung: Aktiv</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Datenbank-Schema: Erstellt</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Storage-Buckets: Konfiguriert</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>TypeScript-Typen: Generiert</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>UI-Komponenten: Erstellt</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>3D-Flip-Effekte: Implementiert</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>NEU-Badges: Aktiv</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Wizard-Link: Verfügbar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 