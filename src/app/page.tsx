'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, TestTube, User, LogIn, MapPin, Plus } from 'lucide-react'
import { FahndungCard } from '@/components/fahndung/FahndungCard'
import type { Fahndung } from '@/types/fahndung'

export default function Home() {
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();



  const handleDashboard = () => {
    router.push('/dashboard');
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleTestPage = () => {
    router.push('/test');
  };

  // Mock Fahndungen für die Demo
  const mockFahndungen: Fahndung[] = [
    {
      id: '1',
      typ: 'straftaeter',
      status: 'veroeffentlicht',
      prioritaet: 'hoch',
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
      typ: 'vermisste',
      status: 'veroeffentlicht',
      prioritaet: 'dringend',
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
      typ: 'sachen',
      status: 'veroeffentlicht',
      prioritaet: 'normal',
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
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-white">Fahndung</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleTestPage}
                className="flex items-center space-x-2 rounded-lg bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700 transition-colors"
              >
                <TestTube className="h-4 w-4" />
                <span>Test-Seite</span>
              </button>
              <button 
                onClick={() => setShowTestPanel(!showTestPanel)}
                className="flex items-center space-x-2 rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 transition-colors"
              >
                <TestTube className="h-4 w-4" />
                <span>Test-Panel</span>
              </button>
              <button 
                onClick={handleDashboard}
                className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
              >
                <User className="h-4 w-4" />
                <span>Dashboard</span>
              </button>
              <button 
                onClick={handleLogin}
                className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>Anmelden</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Test Panel */}
      {showTestPanel && (
        <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <div className="space-y-2">
                 <h3 className="text-sm font-medium text-white">Test Fahndung erstellen</h3>
                 <button
                   onClick={() => {
                     setTestResult('✅ Demo: Fahndung würde erstellt werden');
                   }}
                   className="w-full rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 transition-colors"
                 >
                   Erstellen (Demo)
                 </button>
               </div>

               <div className="space-y-2">
                 <h3 className="text-sm font-medium text-white">Test Fahndung aktualisieren</h3>
                 <button
                   onClick={() => {
                     setTestResult('✅ Demo: Fahndung würde aktualisiert werden');
                   }}
                   className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 transition-colors"
                 >
                   Aktualisieren (Demo)
                 </button>
               </div>

               <div className="space-y-2">
                 <h3 className="text-sm font-medium text-white">Test Fahndung löschen</h3>
                 <button
                   onClick={() => {
                     setTestResult('✅ Demo: Fahndung würde gelöscht werden');
                   }}
                   className="w-full rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 transition-colors"
                 >
                   Löschen (Demo)
                 </button>
               </div>

               <div className="space-y-2">
                 <h3 className="text-sm font-medium text-white">Daten neu laden</h3>
                 <button
                   onClick={() => {
                     setIsLoading(true);
                     setTimeout(() => {
                       setIsLoading(false);
                       setTestResult('✅ Demo: Daten würden neu geladen werden');
                     }, 1000);
                   }}
                   disabled={isLoading}
                   className="w-full rounded-lg bg-purple-600 px-3 py-2 text-sm text-white hover:bg-purple-700 transition-colors disabled:opacity-50"
                 >
                   {isLoading ? 'Lade...' : 'Neu laden (Demo)'}
                 </button>
               </div>
             </div>

            {testResult && (
              <div className="mt-4 p-3 rounded-lg bg-white/10">
                <p className="text-sm text-white">{testResult}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Willkommen beim Fahndungssystem
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Professionelle 3D-Flip-Karten für effiziente Fahndungen
            </p>
            <div className="flex items-center justify-center space-x-4">
              <button 
                onClick={handleDashboard}
                className="flex items-center space-x-2 rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Neue Fahndung erstellen</span>
              </button>
              <button 
                onClick={handleTestPage}
                className="flex items-center space-x-2 rounded-lg bg-gray-600 px-6 py-3 text-white font-medium hover:bg-gray-700 transition-colors"
              >
                <TestTube className="h-5 w-5" />
                <span>Test-Seite anzeigen</span>
              </button>
            </div>
          </div>

          {/* Fahndungen Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                Aktuelle Fahndungen
              </h2>
                             <div className="flex items-center space-x-2 text-gray-400">
                 <MapPin className="h-4 w-4" />
                 <span className="text-sm">
                   3 Demo-Fahndungen verfügbar
                 </span>
               </div>
            </div>
            
            {/* Professionelle 3D-Flip-Karten */}
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

                         {/* Demo-Hinweis */}
             <div className="mt-8 text-center">
               <p className="text-gray-400 text-sm">
                 Diese Seite zeigt professionelle 3D-Flip-Karten mit NEU-Badges und Wizard-Integration
               </p>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}
