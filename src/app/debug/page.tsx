'use client';

import { useState } from 'react';
import { testSupabaseConnection, getCurrentSession, createDemoUsers, initializeSession } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

export default function DebugPage() {
  const [connectionTest, setConnectionTest] = useState<{ success: boolean; message: string } | null>(null);
  const [sessionTest, setSessionTest] = useState<string | null>(null);
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
      setSessionTest(JSON.stringify(session, null, 2));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      setSessionTest(JSON.stringify({ error: errorMessage }, null, 2));
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
      setSessionTest('Abgemeldet');
    }
  };

  const handleInitializeSession = async () => {
    setLoading(true);
    try {
      await initializeSession();
      setConnectionTest({ success: true, message: 'Session-Initialisierung abgeschlossen' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      setConnectionTest({ success: false, message: `Session-Initialisierung fehlgeschlagen: ${errorMessage}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
          <h1 className="text-3xl font-bold text-white mb-8">Debug-Seite</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Umgebungsvariablen */}
            <div className="bg-white/5 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Umgebungsvariablen</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">NEXT_PUBLIC_SUPABASE_URL:</span>
                  <span className={process.env.NEXT_PUBLIC_SUPABASE_URL ? 'text-green-400' : 'text-red-400'}>
                    {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Gesetzt' : '❌ Fehlt'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                  <span className={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'text-green-400' : 'text-red-400'}>
                    {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Gesetzt' : '❌ Fehlt'}
                  </span>
                </div>
              </div>
            </div>

            {/* Aktionen */}
            <div className="bg-white/5 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Aktionen</h2>
              <div className="space-y-3">
                <button
                  onClick={handleConnectionTest}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Teste...' : 'Supabase-Verbindung testen'}
                </button>
                
                <button
                  onClick={handleSessionTest}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Teste...' : 'Session prüfen'}
                </button>
                
                <button
                  onClick={handleInitializeSession}
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Initialisiere...' : 'Session initialisieren'}
                </button>
                
                <button
                  onClick={handleCreateDemoUsers}
                  disabled={loading}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Erstelle...' : 'Demo-User erstellen'}
                </button>
                
                <button
                  onClick={handleSignOut}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  Abmelden
                </button>
              </div>
            </div>
          </div>

          {/* Ergebnisse */}
          {connectionTest && (
            <div className="mt-6 bg-white/5 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Verbindungstest</h2>
              <div className={`p-4 rounded-lg ${connectionTest.success ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                <p className={connectionTest.success ? 'text-green-400' : 'text-red-400'}>
                  {connectionTest.message}
                </p>
              </div>
            </div>
          )}

          {sessionTest && (
            <div className="mt-6 bg-white/5 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Session-Test</h2>
              <div className="bg-black/20 p-4 rounded-lg text-sm text-gray-300 overflow-auto">
                <code>{sessionTest}</code>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 