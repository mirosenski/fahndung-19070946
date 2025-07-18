import { supabase } from '~/lib/supabase';

// Typen für bessere Typsicherheit
interface Investigation {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

interface InvestigationImage {
  id: string;
  investigation_id: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  description?: string;
  uploaded_at: string;
}

export default async function Dashboard() {
  // Lade Fahndungen aus Supabase
  const { data: investigations, error: investigationsError } = await supabase
    ?.from('investigations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10) ?? { data: null, error: null };

  // Lade Bilder aus Supabase
  const { data: images, error: imagesError } = await supabase
    ?.from('investigation_images')
    .select('*')
    .order('uploaded_at', { ascending: false })
    .limit(10) ?? { data: null, error: null };

  // Typisierte Daten
  const typedInvestigations = (investigations as Investigation[]) ?? [];
  const typedImages = (images as InvestigationImage[]) ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Fahndungen */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Fahndungen</h2>
            
            {investigationsError ? (
              <div className="text-red-400">
                Fehler beim Laden der Fahndungen: {investigationsError.message}
              </div>
            ) : typedInvestigations.length > 0 ? (
              <div className="space-y-4">
                {typedInvestigations.map((investigation) => (
                  <div
                    key={investigation.id}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <h3 className="font-medium text-white mb-2">
                      {investigation.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-2">
                      {investigation.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Status: {investigation.status}</span>
                      <span>Priorität: {investigation.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">Keine Fahndungen gefunden</p>
            )}
          </div>

          {/* Bilder */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Bilder</h2>
            
            {imagesError ? (
              <div className="text-red-400">
                Fehler beim Laden der Bilder: {imagesError.message}
              </div>
            ) : typedImages.length > 0 ? (
              <div className="space-y-4">
                {typedImages.map((image) => (
                  <div
                    key={image.id}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <h3 className="font-medium text-white mb-2">
                      {image.file_name}
                    </h3>
                    <p className="text-sm text-gray-400 mb-2">
                      {image.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Größe: {image.file_size ? `${Math.round(image.file_size / 1024)} KB` : 'Unbekannt'}</span>
                      <span>Typ: {image.mime_type}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">Keine Bilder gefunden</p>
            )}
          </div>
        </div>

        {/* Raw Data */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Rohdaten</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Fahndungen (JSON)</h3>
              <pre className="bg-black/50 rounded-lg p-4 text-xs text-green-400 overflow-auto max-h-64">
                {JSON.stringify(typedInvestigations, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Bilder (JSON)</h3>
              <pre className="bg-black/50 rounded-lg p-4 text-xs text-green-400 overflow-auto max-h-64">
                {JSON.stringify(typedImages, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 