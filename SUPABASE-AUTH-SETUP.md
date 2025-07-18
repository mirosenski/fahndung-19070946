# Supabase Authentifizierung Setup für echte Registrierung

## Ziel
Echte Registrierung mit E-Mail-Bestätigung an ptlsweb@gmail.com für Genehmigung/Ablehnung.

## 1. Supabase Schema erweitern
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
```

## 2. Supabase Auth-Einstellungen

### Gehe zu: https://app.supabase.com/project/rgbxdxrhwrszidbnsmuy/auth/settings

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

## 3. Gmail App-Passwort erstellen
1. Gehe zu: https://myaccount.google.com/apppasswords
2. Wähle "Mail" und "Windows Computer"
3. Kopiere das generierte Passwort
4. Verwende es als SMTP Pass in Supabase

## 4. Admin-Zugang einrichten
1. Gehe zu: https://app.supabase.com/project/rgbxdxrhwrszidbnsmuy/auth/users
2. Erstelle Admin-User: `ptlsweb@gmail.com` / `Heute-2025!sp`
3. Setze Rolle auf 'admin' in user_profiles

## 5. Testen
1. Registriere dich mit einer neuen E-Mail
2. Prüfe ptlsweb@gmail.com auf Bestätigungs-E-Mail
3. Gehe zu http://localhost:3000/admin/users
4. Genehmige oder lehne den Benutzer ab

## Workflow
1. **Benutzer registriert sich** → Status: 'pending'
2. **E-Mail an ptlsweb@gmail.com** → Admin prüft
3. **Admin genehmigt/lehnt ab** → Status: 'approved'/'rejected'
4. **Benutzer erhält Bestätigung** → Kann sich anmelden

## Admin-Seite
- URL: http://localhost:3000/admin/users
- Nur für Admin-Benutzer zugänglich
- Zeigt alle ausstehenden Registrierungen
- Genehmigen/Ablehnen mit einem Klick 