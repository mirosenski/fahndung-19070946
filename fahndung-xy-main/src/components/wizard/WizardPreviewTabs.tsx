import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Map, 
  CreditCard, 
  RotateCw, 
  MapPin, 
  Calendar, 
  Phone, 
  Mail, 
  Share2, 
  Printer, 
  Info, 
  CheckCircle,
  Eye,
  ChevronRight
} from 'lucide-react';
import Image from 'next/image';

interface WizardPreviewTabsProps {
  formData: Record<string, string | number | boolean | null | undefined>;
  onBackToWizard?: () => void;
}

const WizardPreviewTabs: React.FC<WizardPreviewTabsProps> = ({ formData, onBackToWizard }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const tabs = [
    { id: 'summary', label: 'Zusammenfassung', icon: FileText },
    { id: 'detail', label: 'Detailseite', icon: Eye },
    { id: 'card', label: 'Fahndungskarte', icon: CreditCard }
  ];

  // Zusammenfassung Tab
  const SummaryTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Info className="w-5 h-5 text-blue-600" />
          <p className="text-sm text-blue-800">
            Überprüfen Sie alle Angaben vor der Veröffentlichung
          </p>
        </div>
      </div>

      {/* Grunddaten */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Grunddaten
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Kategorie:</span>
            <span className="ml-2 font-medium">{formData.category || 'Straftäter'}</span>
          </div>
          <div>
            <span className="text-gray-500">Priorität:</span>
            <span className="ml-2 font-medium text-red-600">{formData.priority || 'EILFAHNDUNG'}</span>
          </div>
          <div>
            <span className="text-gray-500">Aktenzeichen:</span>
            <span className="ml-2 font-medium">{formData.caseNumber || 'BW-2024/123'}</span>
          </div>
          <div>
            <span className="text-gray-500">Status:</span>
            <span className="ml-2 font-medium">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                NEU
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Personenbeschreibung */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold text-lg mb-4">Personenbeschreibung</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Name:</span>
            <span className="ml-2 font-medium">{formData.name || 'Max Mustermann'}</span>
          </div>
          <div>
            <span className="text-gray-500">Alter:</span>
            <span className="ml-2 font-medium">{formData.age || '35 Jahre'}</span>
          </div>
          <div>
            <span className="text-gray-500">Größe:</span>
            <span className="ml-2 font-medium">{formData.height || '180 cm'}</span>
          </div>
          <div>
            <span className="text-gray-500">Statur:</span>
            <span className="ml-2 font-medium">{formData.build || 'Normal'}</span>
          </div>
        </div>
      </div>

      {/* Kontaktdaten */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold text-lg mb-4">Kontaktinformationen</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <Phone className="w-4 h-4 mr-2 text-gray-500" />
            <span>{formData.phone || '0711/110'}</span>
          </div>
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2 text-gray-500" />
            <span>{formData.email || 'hinweise@polizei-bw.de'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Detailseite Tab mit Karte
  const DetailTab = () => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b">
        <div className="flex items-center text-sm text-gray-600">
          <span>Startseite</span>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span>Fahndungen</span>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900">Fallübersicht</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Fahndung nach {formData.name || 'Max Mustermann'}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
              <Image 
                src="https://via.placeholder.com/800x600/cccccc/666666?text=Fahndungsfoto" 
                alt="Fahndungsfoto"
                width={800}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Description */}
            <div className="prose max-w-none">
              <h2 className="text-xl font-semibold mb-3">Sachverhalt</h2>
              <p className="text-gray-700 leading-relaxed">
                {formData.description || 'Die Kriminalpolizei Stuttgart fahndet nach Max Mustermann im Zusammenhang mit einem schweren Raub. Der Tatverdächtige wurde zuletzt am 15.03.2024 in der Stuttgarter Innenstadt gesehen.'}
              </p>
              
              <h3 className="text-lg font-semibold mt-6 mb-3">Täterbeschreibung</h3>
              <ul className="space-y-1 text-gray-700">
                <li>• Geschlecht: {formData.gender || 'männlich'}</li>
                <li>• Alter: {formData.age || '35 Jahre'}</li>
                <li>• Größe: {formData.height || '180 cm'}</li>
                <li>• Statur: {formData.build || 'normal'}</li>
                <li>• Haarfarbe: {formData.hairColor || 'dunkelbraun'}</li>
                <li>• Besondere Merkmale: {formData.features || 'Narbe an der linken Wange'}</li>
              </ul>
            </div>

            {/* Map Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Letzter bekannter Aufenthaltsort
              </h3>
              <div className="aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden relative">
                {/* Placeholder für echte Karte */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                  <div className="text-center">
                    <Map className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-700 font-medium">Interaktive Karte</p>
                    <p className="text-sm text-gray-600 mt-2">Stuttgart, Königstraße</p>
                  </div>
                </div>
                {/* Map Controls */}
                <div className="absolute top-4 right-4 space-y-2">
                  <button className="bg-white p-2 rounded shadow hover:shadow-md transition-shadow">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                  <button className="bg-white p-2 rounded shadow hover:shadow-md transition-shadow">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Box */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4 text-red-900">Hinweise erbeten an:</h3>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-red-900">Kriminalpolizei Stuttgart</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex items-center text-red-800">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>0711/110</span>
                    </div>
                    <div className="flex items-center text-red-800">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>hinweise@polizei-bw.de</span>
                    </div>
                  </div>
                </div>
                <button className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors font-medium">
                  Online-Hinweis abgeben
                </button>
              </div>
            </div>

            {/* Share Box */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Teilen Sie diese Fahndung</h3>
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center p-2 bg-white border rounded hover:bg-gray-50 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="flex items-center justify-center p-2 bg-white border rounded hover:bg-gray-50 transition-colors">
                  <Printer className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Wichtiger Hinweis</p>
                  <p>Bei unmittelbarer Gefahr wählen Sie bitte sofort den Notruf 110.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Fahndungskarte Tab mit Flip-Animation
  const CardTab = () => (
    <div className="flex flex-col items-center justify-center min-h-[600px] bg-gray-50 rounded-lg p-8">
      <p className="text-sm text-gray-600 mb-6 flex items-center">
        <RotateCw className="w-4 h-4 mr-2" />
        Klicken Sie auf die Karte zum Umdrehen
      </p>
      
      <div className="relative w-80 h-96 perspective-1000">
        <div
          className="absolute inset-0 w-full h-full cursor-pointer preserve-3d"
          style={{
            transform: `rotateY(${isCardFlipped ? 180 : 0}deg)`,
            transition: 'transform 0.6s ease-in-out',
            transformStyle: 'preserve-3d'
          }}
          onClick={() => setIsCardFlipped(!isCardFlipped)}
        >
          {/* Vorderseite */}
          <div className="absolute inset-0 w-full h-full backface-hidden">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden h-full">
              {/* Status Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                  EILFAHNDUNG
                </span>
              </div>
              
              {/* Image */}
              <div className="h-56 bg-gray-200 relative overflow-hidden">
                <Image 
                  src="https://via.placeholder.com/320x224/cccccc/666666?text=Fahndungsfoto" 
                  alt="Fahndungsfoto"
                  width={320}
                  height={224}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Content */}
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2">{formData.name || 'Max Mustermann'}</h3>
                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>Stuttgart</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Vermisst seit 15.03.2024</span>
                  </div>
                </div>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors font-medium">
                  Mehr erfahren
                </button>
              </div>
            </div>
          </div>

          {/* Rückseite */}
          <div 
            className="absolute inset-0 w-full h-full backface-hidden"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <div className="bg-white rounded-xl shadow-xl overflow-hidden h-full p-6">
              <h3 className="font-bold text-lg mb-4">Falldetails</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Sachverhalt:</p>
                  <p className="text-gray-600 mt-1">
                    {formData.shortDescription || 'Tatverdächtiger im Zusammenhang mit schwerem Raub. Möglicherweise bewaffnet und gefährlich.'}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Besondere Merkmale:</p>
                  <p className="text-gray-600 mt-1">
                    {formData.features || 'Narbe an der linken Wange, Tattoo am rechten Unterarm'}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Zuletzt gesehen:</p>
                  <p className="text-gray-600 mt-1">
                    {formData.lastSeen || 'Königstraße, Stuttgart - 15.03.2024, 14:30 Uhr'}
                  </p>
                </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-xs text-red-800 font-medium">Bei Antreffen sofort 110 wählen!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Controls */}
      <div className="mt-8 flex items-center space-x-4">
        <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors text-sm">
          Als Bild speichern
        </button>
        <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors text-sm">
          Druckvorschau
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1"
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'summary' && <SummaryTab />}
        {activeTab === 'detail' && <DetailTab />}
        {activeTab === 'card' && <CardTab />}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button 
          variant="ghost"
          onClick={onBackToWizard}
        >
          Zurück zum Wizard
        </Button>
        <div className="flex items-center space-x-4">
          <Button variant="outline">
            Als Entwurf speichern
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-4 h-4 mr-2" />
            Veröffentlichen
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WizardPreviewTabs; 