# 🔧 Vercel Login-Fix für Fahndung System

## 🚨 Problem
Login funktioniert nicht in Vercel: "Invalid login credentials"

## 🔍 Ursache
Vercel verwendet ein anderes Supabase-Projekt als die lokale Entwicklung.

## 🛠️ Lösung: Vercel an lokale Konfiguration anpassen

### Schritt 1: Vercel-Umgebungsvariablen ändern

#### Option A: Über Vercel Dashboard (Standard)
1. **Gehe zu Vercel Dashboard**: https://vercel.com/dashboard
2. **Wähle dein Projekt**: `fahndung`
3. **Gehe zu Settings → Environment Variables**
4. **Ändere diese Variablen** auf die lokalen Werte:

```env
# Supabase (für Real-time Updates)
NEXT_PUBLIC_SUPABASE_URL="https://rgbxdxrhwrszidbnsmuy.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnYnhkeHJod3JzemlkYm5zbXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NzgyODUsImV4cCI6MjA2ODI1NDI4NX0.E3E02E91-Wu_dsUioIWumWhn3eaZ0dZ0SzbgvQOs7ts"

# Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.rgbxdxrhwrszidbnsmuy.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="https://fahndung.vercel.app"
NEXTAUTH_SECRET="your-secret-key-here"
```

#### Option B: Über Vercel CLI (für sensitive Variablen)
Falls die Variablen als "sensitive" markiert und gesperrt sind:

1. **Vercel CLI installieren**:
```bash
npm install -g vercel
```

2. **Projekt verlinken** (falls noch nicht gemacht):
```bash
vercel link
```

3. **Variablen über CLI aktualisieren**:
```bash
# Alte Variablen entfernen
vercel env rm NEXT_PUBLIC_SUPABASE_URL production
vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env rm DATABASE_URL production

# Neue Variablen hinzufügen
echo "https://rgbxdxrhwrszidbnsmuy.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnYnhkeHJod3JzemlkYm5zbXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NzgyODUsImV4cCI6MjA2ODI1NDI4NX0.E3E02E91-Wu_dsUioIWumWhn3eaZ0dZ0SzbgvQOs7ts" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "postgresql://postgres:[YOUR-PASSWORD]@db.rgbxdxrhwrszidbnsmuy.supabase.co:5432/postgres" | vercel env add DATABASE_URL production
```

4. **Redeploy über CLI**:
```bash
vercel deploy --prod
```

**Wichtig**: Ersetze `[YOUR-PASSWORD]` mit deinem tatsächlichen Supabase-Datenbankpasswort!

### Schritt 2: Demo-User in Supabase erstellen

1. **Gehe zu Supabase Dashboard**: https://app.supabase.com/project/rgbxdxrhwrszidbnsmuy/auth/users
2. **Klicke "Add User"**
3. **Erstelle diese Demo-User**:

#### Admin User
- **Email:** `admin@fahndung.local`
- **Password:** `admin123`

#### Editor User  
- **Email:** `editor@fahndung.local`
- **Password:** `editor123`

#### User User
- **Email:** `user@fahndung.local`
- **Password:** `user123`

### Schritt 3: User-Profile erstellen

1. **Gehe zu SQL Editor**: https://app.supabase.com/project/rgbxdxrhwrszidbnsmuy/sql
2. **Führe diesen SQL-Code aus**:

```sql
-- User-Profile für Demo-User erstellen
INSERT INTO public.user_profiles (user_id, email, role, name, department, status)
SELECT 
    id,
    email,
    CASE 
        WHEN email = 'admin@fahndung.local' THEN 'admin'
        WHEN email = 'editor@fahndung.local' THEN 'editor'
        ELSE 'user'
    END,
    CASE 
        WHEN email = 'admin@fahndung.local' THEN 'Administrator'
        WHEN email = 'editor@fahndung.local' THEN 'Editor'
        ELSE 'Benutzer'
    END,
    CASE 
        WHEN email = 'admin@fahndung.local' THEN 'IT'
        WHEN email = 'editor@fahndung.local' THEN 'Redaktion'
        ELSE 'Allgemein'
    END,
    'approved'
FROM auth.users 
WHERE email IN ('admin@fahndung.local', 'editor@fahndung.local', 'user@fahndung.local')
ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    status = 'approved';
```

### Schritt 4: Redeploy

#### Über Dashboard:
1. **Gehe zurück zu Vercel**
2. **Klicke "Redeploy"** in den Project Settings
3. **Warte bis der Build fertig ist**

#### Über CLI:
```bash
vercel deploy --prod
```

### Schritt 5: Testen

1. **Gehe zu**: https://fahndung.vercel.app/login
2. **Klicke "Demo-Benutzer erstellen"** (falls verfügbar)
3. **Oder verwende direkt**:
   - **Email:** `admin@fahndung.local`
   - **Password:** `admin123`

## ✅ Erfolg

Nach diesen Schritten sollte der Login in Vercel funktionieren und das gleiche Supabase-Projekt wie lokal verwenden!

## 🔧 Alternative: Automatische Demo-User-Erstellung

Falls der "Demo-Benutzer erstellen" Button nicht funktioniert:

1. **Gehe zu**: https://fahndung.vercel.app/debug
2. **Klicke "Demo-User erstellen"**
3. **Warte auf Bestätigung**
4. **Teste Login erneut**

## 🚨 Troubleshooting

### Problem: "Supabase ist nicht konfiguriert"
**Lösung**: Umgebungsvariablen in Vercel prüfen

### Problem: "Invalid login credentials"
**Lösung**: Demo-User in Supabase erstellen

### Problem: "User profile not found"
**Lösung**: SQL-Code für User-Profile ausführen

### Problem: "Database connection failed"
**Lösung**: DATABASE_URL in Vercel prüfen und Passwort korrekt setzen

### Problem: "Variable is locked/sensitive"
**Lösung**: Verwende Vercel CLI (Option B oben)

## 📞 Support

Falls es immer noch nicht funktioniert:
1. **Prüfe Browser-Konsole** (F12)
2. **Prüfe Vercel-Logs**
3. **Prüfe Supabase-Logs**

---

**Wichtig**: Stelle sicher, dass alle Umgebungsvariablen in Vercel korrekt gesetzt sind und das gleiche Supabase-Projekt wie lokal verwenden! 