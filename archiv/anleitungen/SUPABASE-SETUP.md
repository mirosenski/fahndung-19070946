# Supabase Setup für Fahndung-System

## 1. Supabase-Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com)
2. Erstelle ein neues Projekt
3. Notiere dir die Projekt-URL und den Anon Key

## 2. Datenbank-Schema einrichten

1. Öffne das Supabase Dashboard
2. Gehe zu "SQL Editor"
3. Führe das SQL-Script aus `supabase-schema.sql` aus

## 3. Umgebungsvariablen konfigurieren

Bearbeite die `.env.local` Datei und setze deine Supabase-Credentials:

```bash
# Ersetze [YOUR-PASSWORD] mit deinem Supabase-Datenbankpasswort
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.rgbxdxrhwrszidbnsmuy.supabase.co:5432/postgres"

# Ersetze mit deinen eigenen Supabase-Credentials
NEXT_PUBLIC_SUPABASE_URL="https://deine-projekt-url.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="dein-anon-key"
```

## 4. Entwicklungsserver starten

```bash
pnpm dev
```

## 5. Testen

Die Anwendung sollte jetzt ohne Fehler starten und die Fahndungen aus der Supabase-Datenbank anzeigen.

## Fehlerbehebung

### Fehler: "Supabase URL und Anon Key müssen in den Umgebungsvariablen gesetzt sein"

- Überprüfe, ob die `.env.local` Datei korrekt konfiguriert ist
- Stelle sicher, dass die Umgebungsvariablen korrekt gesetzt sind

### Fehler: "Table does not exist"

- Führe das SQL-Schema in Supabase aus
- Überprüfe, ob die Tabellen `investigations` und `investigation_images` existieren

### Fehler: "Permission denied"

- Überprüfe die RLS-Policies in Supabase
- Stelle sicher, dass die Tabellen für anonyme Benutzer zugänglich sind 