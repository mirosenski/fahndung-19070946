import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Willkommen beim Fahndungssystem
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Professionelle Fahndung für Straftäter, Vermisste, unbekannte Tote und Sachen
        </p>
        <div className="flex justify-center space-x-4">
          <Link 
            href="/admin/wizard" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Neue Fahndung erstellen
          </Link>
          <Link 
            href="/test" 
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            System testen
          </Link>
        </div>
      </div>

      {/* Featured Fahndungen */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Herausragende Fälle
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mock Featured Cards */}
          <div className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                Straftäter
              </span>
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                Dringend
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Gesuchter Straftäter in Berlin
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Ein gesuchter Straftäter wurde zuletzt in Berlin gesehen.
            </p>
            <div className="text-xs text-gray-500">
              <div className="flex items-center gap-2 mb-1">
                <span>📍 Berlin, Mitte</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📅 15.01.2024</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                Vermisste
              </span>
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                Dringend
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Vermisste Person in Hamburg
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Eine 25-jährige Frau wird seit gestern vermisst.
            </p>
            <div className="text-xs text-gray-500">
              <div className="flex items-center gap-2 mb-1">
                <span>📍 Hamburg, Hauptbahnhof</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📅 14.01.2024</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">
                Unbekannte Tote
              </span>
              <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                Hoch
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Unbekannte Person gefunden
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Eine unbekannte Person wurde in München gefunden.
            </p>
            <div className="text-xs text-gray-500">
              <div className="flex items-center gap-2 mb-1">
                <span>📍 München, Stadtpark</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📅 13.01.2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fahndungen nach Typ */}
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Straftäter</h2>
          <p className="text-gray-600">Aktuelle Fahndungen nach Straftätern werden hier angezeigt.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Vermisste</h2>
          <p className="text-gray-600">Aktuelle Vermisstenfahndungen werden hier angezeigt.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Unbekannte Tote</h2>
          <p className="text-gray-600">Fahndungen nach unbekannten Toten werden hier angezeigt.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sachen</h2>
          <p className="text-gray-600">Fahndungen nach verlorenen oder gefundenen Sachen werden hier angezeigt.</p>
        </div>
      </div>
    </div>
  )
} 