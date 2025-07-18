'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, AlertCircle, User, Shield, Crown, Database } from 'lucide-react';
import { supabase } from '~/lib/supabase';
import { createDemoUsers } from '~/lib/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!supabase) {
        setError('Supabase ist nicht konfiguriert');
        return;
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login-Fehler:', error);
        if (error.message.includes('Invalid login credentials')) {
          setError('Ungültige Anmeldedaten. Bitte überprüfen Sie E-Mail und Passwort.');
        } else {
          setError(`Login-Fehler: ${error.message}`);
        }
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  // Demo-Login-Daten automatisch ausfüllen
  const fillDemoData = (role: 'admin' | 'editor' | 'user') => {
    const demoData = {
      admin: { email: 'admin@fahndung.local', password: 'admin123' },
      editor: { email: 'editor@fahndung.local', password: 'editor123' },
      user: { email: 'user@fahndung.local', password: 'user123' }
    };
    
    setEmail(demoData[role].email);
    setPassword(demoData[role].password);
    setError('');
  };

  // Demo-Login mit automatischer Anmeldung
  const handleDemoLogin = async (role: 'admin' | 'editor' | 'user') => {
    fillDemoData(role);
    
    // Kurze Verzögerung für bessere UX
    setTimeout(() => {
      void (async () => {
    setLoading(true);
    setError('');

    try {
      if (!supabase) {
        setError('Supabase ist nicht konfiguriert');
        return;
      }
      
          const { error } = await supabase.auth.signInWithPassword({
            email: role === 'admin' ? 'admin@fahndung.local' : 
                   role === 'editor' ? 'editor@fahndung.local' : 'user@fahndung.local',
            password: role === 'admin' ? 'admin123' : 
                     role === 'editor' ? 'editor123' : 'user123',
      });

      if (error) {
            console.error('Login-Fehler:', error);
            if (error.message.includes('Invalid login credentials')) {
              setError(`Demo-User ${role} existiert nicht. Bitte erstelle zuerst die Demo-User mit dem "Demo-Benutzer erstellen" Button.`);
            } else {
              setError(`Login-Fehler: ${error.message}`);
            }
      } else {
            router.push('/dashboard');
      }
        } catch (error) {
          console.error('Unerwarteter Fehler:', error);
      setError('Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setLoading(false);
        }
      })();
    }, 100);
  };

  // Demo-Benutzer erstellen
  const handleSetupDemoUsers = async () => {
    setSetupLoading(true);
    setError('');

    try {
      const result = await createDemoUsers();
      setError(result.message);
    } catch (error) {
      console.error('Setup-Fehler:', error);
      setError('Fehler beim Erstellen der Demo-Benutzer. Bitte überprüfen Sie die Supabase-Konfiguration.');
    } finally {
      setSetupLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Fahndung</h1>
            <p className="text-gray-400">Anmelden oder Registrieren</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            {/* Demo-Login-Buttons */}
            <div className="space-y-3">
              <p className="text-sm text-gray-400 text-center">Demo-Accounts zum Testen:</p>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin')}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center space-x-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors disabled:opacity-50"
                >
                  <Crown className="h-4 w-4" />
                  <span>{loading ? 'Anmelden...' : 'Admin'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('editor')}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg px-3 py-2 text-sm text-blue-400 transition-colors disabled:opacity-50"
                >
                  <Shield className="h-4 w-4" />
                  <span>{loading ? 'Anmelden...' : 'Editor'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('user')}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center space-x-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg px-3 py-2 text-sm text-green-400 transition-colors disabled:opacity-50"
                >
                  <User className="h-4 w-4" />
                  <span>{loading ? 'Anmelden...' : 'User'}</span>
                </button>
              </div>
              
              {/* Setup Demo Users Button */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleSetupDemoUsers}
                  disabled={setupLoading}
                  className="flex items-center justify-center space-x-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg px-4 py-2 text-sm text-purple-400 transition-colors disabled:opacity-50 mx-auto"
                >
                  <Database className="h-4 w-4" />
                  <span>{setupLoading ? 'Erstelle Demo-Benutzer...' : 'Demo-Benutzer erstellen'}</span>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                E-Mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="ihre@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Passwort
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {loading ? 'Anmelden...' : 'Anmelden'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/register')}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Registrieren
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Durch die Anmeldung stimmen Sie unseren{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300">
                Nutzungsbedingungen
              </a>{' '}
              zu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 