# Demo-User Setup Anleitung

## Problem
Die Demo-User existieren noch nicht in Supabase, daher funktioniert der Login nicht.

## Lösung: Demo-User manuell anlegen

### Option 1: Über die Login-Seite (Empfohlen)
1. Gehe zu `http://localhost:3000/login`
2. Klicke auf den **"Demo-Benutzer erstellen"** Button (lila Button)
3. Warte auf die Bestätigung
4. Klicke dann auf einen der Demo-Buttons (Admin/Editor/User)

### Option 2: Manuell im Supabase Dashboard
1. Gehe zu [Supabase Dashboard](https://app.supabase.com/project/rgbxdxrhwrszidbnsmuy/auth/users)
2. Klicke auf **"Add User"** oder **"Benutzer hinzufügen"**
3. Erstelle die folgenden User:

#### Admin User
- **Email:** `admin@fahndung.local`
- **Password:** `admin123`
- **Role:** `admin`

#### Editor User
- **Email:** `editor@fahndung.local`
- **Password:** `editor123`
- **Role:** `editor`

#### User User
- **Email:** `user@fahndung.local`
- **Password:** `user123`
- **Role:** `user`

### Option 3: Über SQL (Für Entwickler)
Führe diese SQL-Befehle im Supabase SQL Editor aus:

```sql
-- Demo-User erstellen (falls sie nicht existieren)
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES 
  ('admin@fahndung.local', crypt('admin123', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('editor@fahndung.local', crypt('editor123', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('user@fahndung.local', crypt('user123', gen_salt('bf')), NOW(), NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- User-Profile erstellen
INSERT INTO public.user_profiles (user_id, email, role, name, department)
SELECT 
  u.id,
  u.email,
  CASE 
    WHEN u.email = 'admin@fahndung.local' THEN 'admin'
    WHEN u.email = 'editor@fahndung.local' THEN 'editor'
    ELSE 'user'
  END,
  CASE 
    WHEN u.email = 'admin@fahndung.local' THEN 'Administrator'
    WHEN u.email = 'editor@fahndung.local' THEN 'Editor'
    ELSE 'Benutzer'
  END,
  CASE 
    WHEN u.email = 'admin@fahndung.local' THEN 'IT'
    WHEN u.email = 'editor@fahndung.local' THEN 'Redaktion'
    ELSE 'Allgemein'
  END
FROM auth.users u
WHERE u.email IN ('admin@fahndung.local', 'editor@fahndung.local', 'user@fahndung.local')
ON CONFLICT (user_id) DO NOTHING;
```

## Nach dem Setup
1. Gehe zu `http://localhost:3000/login`
2. Klicke auf einen der Demo-Buttons (Admin/Editor/User)
3. Du wirst automatisch angemeldet und zum Dashboard weitergeleitet

## Rollen und Berechtigungen
- **Admin:** Vollzugriff auf alle Funktionen
- **Editor:** Kann Fahndungen erstellen und bearbeiten
- **User:** Kann Fahndungen anzeigen und durchsuchen

## Troubleshooting
- Falls der "Demo-Benutzer erstellen" Button nicht funktioniert, verwende Option 2 oder 3
- Prüfe die Browser-Konsole auf Fehlermeldungen
- Stelle sicher, dass das Supabase-Schema (`supabase-schema.sql`) importiert wurde 