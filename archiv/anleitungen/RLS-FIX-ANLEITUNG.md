# 🔧 RLS-Policy Fix Anleitung

## Problem
Die aktuellen RLS-Policies haben eine Endlosschleife verursacht:
```
infinite recursion detected in policy for relation "user_profiles"
```

## Lösung

### 1. SQL-Script ausführen
Führe das SQL-Script `fix-rls-policies.sql` in der Supabase SQL Editor aus:

1. Gehe zu deinem Supabase Dashboard
2. Öffne den SQL Editor
3. Kopiere den Inhalt von `fix-rls-policies.sql`
4. Führe das Script aus

### 2. Was das Script macht

#### Alte Policies löschen:
- Löscht alle problematischen RLS-Policies
- Entfernt die Endlosschleife

#### Neue Policies erstellen:
- **Einfache Benutzer-Policies**: Jeder kann sein eigenes Profil lesen/aktualisieren
- **Admin-Policies**: Admins können alle Profile verwalten (ohne Endlosschleife)
- **Temporäre Policy**: Erlaubt Profilerstellung für unauthentifizierte Benutzer

### 3. Testen

Nach dem Ausführen des Scripts:

1. Gehe zu `http://localhost:3001/debug`
2. Klicke auf "Demo-User erstellen"
3. Klicke auf "Session prüfen"

### 4. Alternative: RLS temporär deaktivieren

Falls das Script nicht funktioniert, kannst du RLS temporär deaktivieren:

```sql
-- RLS für user_profiles temporär deaktivieren
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Nach dem Test wieder aktivieren
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
```

### 5. Debugging

Die verbesserte `auth.ts` zeigt jetzt detaillierte Logs:
- ✅ Emoji-basierte Logs für bessere Übersicht
- ✅ Schritt-für-Schritt Debugging
- ✅ Spezifische Fehlercodes und Messages

### 6. Nächste Schritte

1. Führe das SQL-Script aus
2. Teste die Debug-Seite
3. Versuche dich anzumelden
4. Prüfe die Browser-Konsole für detaillierte Logs

## Fehlerbehebung

### Fehler: "Auth session missing"
- **Ursache**: Benutzer ist nicht authentifiziert
- **Lösung**: Melde dich zuerst an

### Fehler: "infinite recursion"
- **Ursache**: RLS-Policies haben Endlosschleife
- **Lösung**: Führe das SQL-Script aus

### Fehler: "500 Internal Server Error"
- **Ursache**: Datenbankproblem
- **Lösung**: Prüfe Supabase Dashboard für Details

## Support

Falls Probleme bestehen:
1. Prüfe die Supabase Logs
2. Schaue in die Browser-Konsole
3. Verwende die Debug-Seite für Tests 