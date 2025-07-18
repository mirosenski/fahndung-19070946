'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, AlertCircle, User, Building, Phone, ArrowLeft } from 'lucide-react';
import { supabase } from '~/lib/supabase';
import { sendRegistrationNotification } from '~/lib/email-notifications';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Bitte geben Sie Ihren Namen ein.');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Bitte geben Sie Ihre E-Mail-Adresse ein.');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      return false;
    }
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      if (!supabase) {
        setError('Supabase ist nicht konfiguriert');
        return;
      }
      
      // Registrierung mit vollständigen Daten
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            name: formData.name,
            department: formData.department,
            phone: formData.phone,
            role: 'user',
            status: 'pending',
            registration_email: formData.email
          }
        }
      });

      if (error) {
        console.error('Registrierungs-Fehler:', error);
        if (error.message.includes('already registered')) {
          setError('Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an.');
        } else if (error.message.includes('password')) {
          setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
        } else if (error.message.includes('email')) {
          setError('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
        } else {
          setError(`Registrierungs-Fehler: ${error.message}`);
        }
      } else if (data.user) {
        console.log('User erstellt:', data.user.id);
        
        // Versuche User-Profil zu erstellen
        try {
          const profileData = {
            user_id: data.user.id,
            email: formData.email,
            name: formData.name,
            role: 'user',
            status: 'pending',
            registration_email: formData.email,
            department: formData.department || 'Allgemein',
            phone: formData.phone
          };
          
          console.log('Versuche Profil zu erstellen:', profileData);
          
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert(profileData);

          if (profileError) {
            console.warn('Profil-Erstellung fehlgeschlagen (wird später erstellt):', profileError.message);
                  } else {
          console.log('Profil erfolgreich erstellt');
        }
      } catch (profileError) {
        console.warn('Profil-Erstellung Exception (wird später erstellt):', profileError);
      }
      
      // E-Mail-Benachrichtigung an Super-Admin senden
      try {
        await sendRegistrationNotification({
          userEmail: formData.email,
          userName: formData.name,
          department: formData.department || 'Allgemein',
          phone: formData.phone,
          registrationDate: new Date().toLocaleString('de-DE')
        });
        console.log('✅ E-Mail-Benachrichtigung an Super-Admin gesendet');
      } catch (emailError) {
        console.warn('E-Mail-Benachrichtigung fehlgeschlagen:', emailError);
      }
      
      setError('✅ Registrierung erfolgreich! Eine Bestätigungs-E-Mail wurde an ptlsweb@gmail.com gesendet. Bitte warten Sie auf die Genehmigung.');
      
      // Nach 3 Sekunden zur Login-Seite weiterleiten
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      } else {
        setError('✅ Registrierung erfolgreich! Eine Bestätigungs-E-Mail wurde an ptlsweb@gmail.com gesendet. Bitte warten Sie auf die Genehmigung.');
      }
    } catch (error) {
      console.error('Unerwarteter Registrierungs-Fehler:', error);
      setError('Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Registrierung</h1>
            <p className="text-gray-400">Erstellen Sie Ihr Konto für Fahndung</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Vollständiger Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Max Mustermann"
                />
              </div>
            </div>

            {/* E-Mail */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                E-Mail-Adresse *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="ihre@email.com"
                />
              </div>
            </div>

            {/* Passwort */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Passwort *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
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
              <p className="text-xs text-gray-400 mt-1">Mindestens 6 Zeichen</p>
            </div>

            {/* Passwort bestätigen */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Passwort bestätigen *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Abteilung */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-300 mb-2">
                Abteilung
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <select
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Abteilung auswählen</option>
                  <option value="IT">IT</option>
                  <option value="Redaktion">Redaktion</option>
                  <option value="Polizei">Polizei</option>
                  <option value="Justiz">Justiz</option>
                  <option value="Allgemein">Allgemein</option>
                </select>
              </div>
            </div>

            {/* Telefon */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Telefonnummer
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="+49 123 456789"
                />
              </div>
            </div>

            {/* Registrieren Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Registrierung läuft...' : 'Registrieren'}
            </button>
          </form>

          {/* Zurück zur Login-Seite */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/login')}
              className="flex items-center justify-center space-x-2 text-gray-400 hover:text-white transition-colors mx-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Zurück zur Anmeldung</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Durch die Registrierung stimmen Sie unseren{' '}
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