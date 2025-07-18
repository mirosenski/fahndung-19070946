'use client';

import { useState } from 'react';
import { testSupabaseConnection, getCurrentSession, createDemoUsers } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

export default function DebugPage() {
  const [connectionTest, setConnectionTest] = useState<{ success: boolean; message: string } | null>(null);
  const [sessionTest, setSessionTest] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const handleConnectionTest = async () => {
    setLoading(true);
    try {
      const result = await testSupabaseConnection();
      setConnectionTest(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      setConnectionTest({ success: false, message: `Fehler: ${errorMessage}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSessionTest = async () => {
    setLoading(true);
    try {
      const session = await getCurrentSession();
      setSessionTest(session);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      setSessionTest({ error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDemoUsers = async () => {
    setLoading(true);
    try {
      const result = await createDemoUsers();
      setConnectionTest(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      setConnectionTest({ success: false, message: `Fehler: ${errorMessage}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setSessionTest(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">🔧 Debug-Seite</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Supabase-Verbindungstest */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">🔗 Supabase-Verbindung</h2>
            <button
              onClick={handleConnectionTest}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {loading ? 'Teste...' : 'Verbindung testen'}
            </button>
            {connectionTest && (
              <div className={`mt-4 p-3 rounded-lg ${
                connectionTest.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                <p className="font-medium">{connectionTest.message}</p>
              </div>
            )}
          </div>

          {/* Session-Test */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">👤 Session-Test</h2>
            <div className="space-y-2">
              <button
                onClick={handleSessionTest}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {loading ? 'Lade...' : 'Session prüfen'}
              </button>
              <button
                onClick={handleSignOut}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Abmelden
              </button>
            </div>
            {sessionTest && (
              <div className="mt-4 p-3 rounded-lg bg-blue-500/20 text-blue-400">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(sessionTest as Record<string, unknown>, null, 2) as string}
                </pre>
              </div>
            )}
          </div>

          {/* Demo-User erstellen */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">👥 Demo-User</h2>
            <button
              onClick={handleCreateDemoUsers}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {loading ? 'Erstelle...' : 'Demo-User erstellen'}
            </button>
          </div>

          {/* Umgebungsvariablen */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">⚙️ Konfiguration</h2>
            <div className="space-y-2 text-sm text-gray-300">
              <div>
                <span className="font-medium">Supabase URL:</span>
                <span className="ml-2">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Gesetzt' : '❌ Fehlt'}
                </span>
              </div>
              <div>
                <span className="font-medium">Supabase Key:</span>
                <span className="ml-2">
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Gesetzt' : '❌ Fehlt'}
                </span>
              </div>
              <div>
                <span className="font-medium">Supabase Client:</span>
                <span className="ml-2">
                  {supabase ? '✅ Initialisiert' : '❌ Nicht initialisiert'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="mt-8 bg-white/5 rounded-lg p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">📋 Browser-Konsole</h2>
          <p className="text-gray-400 text-sm">
            Öffne die Browser-Konsole (F12) um detaillierte Logs zu sehen.
          </p>
        </div>
      </div>
    </div>
  );
} 