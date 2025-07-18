# Registrierung Setup - Vollständige Anleitung

## 🎯 Ziel
Registrierung funktioniert so:
1. Benutzer registriert sich → Status: `pending`
2. E-Mail an ptlsweb@gmail.com → Super-Admin prüft
3. Super-Admin genehmigt/lehnt ab → Status: `approved`/`rejected`
4. Benutzer kann sich anmelden

## 📋 Schritt-für-Schritt Setup

### 1. Supabase Schema erweitern
Führe diesen SQL-Code im Supabase SQL Editor aus:

```sql
-- User-Profile Schema erweitern
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS registration_email VARCHAR(255);

-- Bestehende User auf 'approved' setzen
UPDATE public.user_profiles 
SET status = 'approved' 
WHERE status IS NULL OR status = '';

-- RLS Policy für Registrierung hinzufügen
CREATE POLICY "Allow profile creation during registration" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index für Status hinzufügen
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON public.user_profiles(status);
```

### 2. Supabase Auth-Einstellungen

#### Gehe zu: https://app.supabase.com/project/rgbxdxrhwrszidbnsmuy/auth/settings

#### Email Auth aktivieren:
1. ✅ **"Enable email confirmations"** → **AN** (check)
2. ✅ **"Enable email change confirmations"** → **AN** (check)

#### SMTP Settings (für ptlsweb@gmail.com):
1. **SMTP Host**: `smtp.gmail.com`
2. **SMTP Port**: `587`
3. **SMTP User**: `ptlsweb@gmail.com`
4. **SMTP Pass**: [Gmail App-Passwort]
5. **Sender Name**: `Fahndung System`
6. **Sender Email**: `ptlsweb@gmail.com`

#### URL Configuration:
1. **Site URL**: `http://localhost:3000`
2. **Redirect URLs**: `http://localhost:3000/dashboard`

### 3. Gmail App-Passwort erstellen
1. Gehe zu: https://myaccount.google.com/apppasswords
2. Wähle "Mail" und "Windows Computer"
3. Kopiere das generierte Passwort
4. Verwende es als SMTP Pass in Supabase

### 4. Super-Admin erstellen
1. Gehe zu: https://app.supabase.com/project/rgbxdxrhwrszidbnsmuy/auth/users
2. Klicke "Add User"
3. Erstelle: `ptlsweb@gmail.com` / `Heute-2025!sp`
4. Gehe zu SQL Editor und führe aus:

```sql
-- Super-Admin Profil erstellen
INSERT INTO public.user_profiles (user_id, email, role, name, status, department)
SELECT 
    id,
    email,
    'admin',
    'Super Administrator',
    'approved',
    'IT'
FROM auth.users 
WHERE email = 'ptlsweb@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
    role = 'admin',
    status = 'approved';
```

### 5. Testen der Registrierung

#### Test 1: Registrierung
1. Gehe zu: http://localhost:3000/login
2. Registriere dich mit einer neuen E-Mail (z.B. `test@example.com`)
3. Du solltest die Meldung sehen: "Registrierung erfolgreich! Eine Bestätigungs-E-Mail wurde an ptlsweb@gmail.com gesendet."

#### Test 2: Admin-Genehmigung
1. Prüfe `ptlsweb@gmail.com` auf E-Mail
2. Gehe zu: http://localhost:3000/admin/users
3. Melde dich mit `ptlsweb@gmail.com` / `Heute-2025!sp` an
4. Du solltest die ausstehende Registrierung sehen
5. Klicke "Genehmigen"

#### Test 3: Anmeldung
1. Gehe zurück zu: http://localhost:3000/login
2. Melde dich mit der registrierten E-Mail an
3. Du solltest zum Dashboard weitergeleitet werden

## 🔧 Troubleshooting

### Problem: "User not allowed"
**Lösung**: RLS Policy hinzufügen
```sql
CREATE POLICY "Allow profile creation during registration" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Problem: E-Mail kommt nicht an
**Lösung**: 
1. SMTP-Einstellungen prüfen
2. Gmail App-Passwort verwenden (nicht normales Passwort)
3. Spam-Ordner prüfen

### Problem: Registrierung funktioniert nicht
**Lösung**:
1. E-Mail-Bestätigung in Supabase aktiviert?
2. URL-Einstellungen korrekt?
3. Schema erweitert?

## 🎉 Erfolg!
Wenn alles funktioniert:
- ✅ Registrierung erstellt User mit Status 'pending'
- ✅ E-Mail an ptlsweb@gmail.com gesendet
- ✅ Super-Admin kann in /admin/users genehmigen/ablehnen
- ✅ Genehmigte User können sich anmelden

## 📞 Support
Falls Probleme auftreten:
1. Prüfe die Browser-Konsole auf Fehler
2. Prüfe Supabase Logs
3. Stelle sicher, dass alle SQL-Befehle ausgeführt wurden 