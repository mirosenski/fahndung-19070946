# 🚀 Schnellfix für RLS-Problem

## ⚠️ Problem
Die RLS-Policies verursachen eine Endlosschleife:
```
infinite recursion detected in policy for relation "user_profiles"
```

## 🔧 Sofortige Lösung

### Schritt 1: SQL-Script ausführen
1. Gehe zu deinem **Supabase Dashboard**
2. Öffne den **SQL Editor**
3. Kopiere den Inhalt von `disable-rls-temp.sql`
4. Führe das Script aus

### Schritt 2: Testen
1. Gehe zu `http://localhost:3001/debug`
2. Klicke auf **"Demo-User erstellen"**
3. Klicke auf **"Session prüfen"**

## 📋 Was das Script macht

```sql
-- RLS für alle Tabellen temporär deaktivieren
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigation_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.media DISABLE ROW LEVEL SECURITY;

-- Demo-Profile erstellen
INSERT INTO public.user_profiles (email, role, name, department, status) VALUES
('admin@fahndung.local', 'admin', 'Administrator', 'IT', 'approved'),
('editor@fahndung.local', 'editor', 'Editor', 'Redaktion', 'approved'),
('user@fahndung.local', 'user', 'Benutzer', 'Allgemein', 'approved');
```

## ✅ Nach dem Fix

- ✅ Demo-Profile werden erstellt
- ✅ Login funktioniert
- ✅ Dashboard ist erreichbar
- ✅ Keine Endlosschleife mehr

## 🔄 Später: RLS wieder aktivieren

Nachdem alles funktioniert, kannst du RLS wieder aktivieren:

```sql
-- RLS wieder aktivieren
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigation_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Dann die korrigierten Policies aus fix-rls-policies.sql anwenden
```

## 🆘 Falls Probleme bestehen

1. **Prüfe Supabase Logs**: Dashboard → Logs
2. **Browser-Konsole**: F12 für detaillierte Fehler
3. **Debug-Seite**: `/debug` für Tests

## 📞 Support

Falls das Problem weiterhin besteht:
1. Prüfe die Supabase-Verbindung
2. Stelle sicher, dass das SQL-Script ausgeführt wurde
3. Teste die Debug-Seite erneut 