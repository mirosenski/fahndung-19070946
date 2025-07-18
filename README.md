# Fahndung-System

Ein modernes Fahndung-System mit Supabase-Integration, Next.js 15 und TypeScript.

## 🚀 Features

- **Supabase-Integration**: Vollständige Datenbank-Integration mit Real-time Updates
- **Moderne UI**: Dark Mode mit Glassmorphism-Design
- **TypeScript**: Vollständig typisiert für bessere Entwicklererfahrung
- **tRPC**: Typsichere API-Kommunikation
- **Lucide Icons**: Konsistente Icon-Bibliothek
- **Responsive Design**: Optimiert für alle Geräte

## 🛠️ Technologie-Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: tRPC, Supabase
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Datenbank**: PostgreSQL (Supabase)

## 📋 Voraussetzungen

- Node.js 18+ 
- pnpm (empfohlen) oder npm
- Supabase-Account

## 🚀 Installation

1. **Repository klonen**
```bash
git clone <repository-url>
cd fahndung
```

2. **Dependencies installieren**
```bash
pnpm install
```

3. **Supabase-Projekt einrichten**
   - Gehe zu [supabase.com](https://supabase.com)
   - Erstelle ein neues Projekt
   - Notiere dir die Projekt-URL und den Anon Key

4. **Datenbank-Schema einrichten**
   - Öffne das Supabase Dashboard
   - Gehe zu "SQL Editor"
   - Führe das SQL-Script aus `supabase-schema.sql` aus

5. **Umgebungsvariablen konfigurieren**
```bash
cp fahndung-alt/env.example .env.local
```

Bearbeite `.env.local` und setze deine Supabase-Credentials:
```bash
# Ersetze [YOUR-PASSWORD] mit deinem Supabase-Datenbankpasswort
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.rgbxdxrhwrszidbnsmuy.supabase.co:5432/postgres"

# Ersetze mit deinen eigenen Supabase-Credentials
NEXT_PUBLIC_SUPABASE_URL="https://deine-projekt-url.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="dein-anon-key"
```

6. **Entwicklungsserver starten**
```bash
pnpm dev
```

Die Anwendung ist jetzt unter `http://localhost:3001` verfügbar.

## 📁 Projektstruktur

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard-Seite
│   ├── login/            # Login-Seite
│   └── page.tsx          # Hauptseite
├── components/            # React-Komponenten
├── lib/                   # Utility-Funktionen
│   └── supabase.ts       # Supabase-Client
├── server/                # Server-seitiger Code
│   ├── api/              # tRPC API
│   └── db.ts             # Datenbank-Konfiguration
└── trpc/                 # tRPC-Client
```

## 🔧 API-Endpunkte

### Fahndungen
- `GET /api/trpc/post.getInvestigations` - Fahndungen abrufen
- `POST /api/trpc/post.createInvestigation` - Neue Fahndung erstellen
- `PUT /api/trpc/post.updateInvestigation` - Fahndung aktualisieren
- `DELETE /api/trpc/post.deleteInvestigation` - Fahndung löschen

### Bilder
- `GET /api/trpc/post.getInvestigationImages` - Bilder zu einer Fahndung abrufen
- `POST /api/trpc/post.addInvestigationImage` - Bild zu einer Fahndung hinzufügen

## 🎨 Design-System

Das Projekt verwendet ein konsistentes Design-System:

- **Farben**: Dark Mode mit Purple/Slate-Gradient
- **Komponenten**: Glassmorphism-Effekte mit Backdrop-Blur
- **Icons**: Lucide React für konsistente Iconographie
- **Typography**: Tailwind CSS für responsive Typografie

## 🔐 Authentifizierung

Die Anwendung unterstützt Supabase-Authentifizierung:

- **Login**: `/login` - Anmeldung und Registrierung
- **Session-Management**: Automatische Session-Verwaltung
- **Protected Routes**: Geschützte Routen für authentifizierte Benutzer

## 📊 Datenbank-Schema

### Tabellen

#### `investigations`
- `id` (UUID, Primary Key)
- `title` (VARCHAR)
- `description` (TEXT)
- `status` (VARCHAR, Default: 'active')
- `priority` (VARCHAR, Default: 'medium')
- `tags` (TEXT[])
- `location` (VARCHAR)
- `contact_info` (JSONB)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### `investigation_images`
- `id` (UUID, Primary Key)
- `investigation_id` (UUID, Foreign Key)
- `file_name` (VARCHAR)
- `file_path` (VARCHAR)
- `file_size` (INTEGER)
- `mime_type` (VARCHAR)
- `width` (INTEGER)
- `height` (INTEGER)
- `tags` (TEXT[])
- `description` (TEXT)
- `is_primary` (BOOLEAN)
- `uploaded_at` (TIMESTAMP)

## 🚀 Deployment

### Vercel (Empfohlen)

1. Verbinde dein Repository mit Vercel
2. Setze die Umgebungsvariablen in Vercel
3. Deploy automatisch bei Git-Push

### Andere Plattformen

Das Projekt kann auf jeder Node.js-Plattform deployed werden:
- Netlify
- Railway
- DigitalOcean App Platform

## 🐛 Fehlerbehebung

### "Supabase URL und Anon Key müssen in den Umgebungsvariablen gesetzt sein"
- Überprüfe `.env.local`
- Stelle sicher, dass die Variablen korrekt gesetzt sind

### "Table does not exist"
- Führe das SQL-Schema in Supabase aus
- Überprüfe die Tabellen-Namen

### "Permission denied"
- Überprüfe die RLS-Policies in Supabase
- Stelle sicher, dass anonyme Benutzer Zugriff haben

## 📝 Entwicklung

### Neue Features hinzufügen

1. **tRPC-Router erweitern**
```typescript
// src/server/api/routers/post.ts
export const postRouter = createTRPCRouter({
  // Neue Endpunkte hier hinzufügen
});
```

2. **Neue Komponenten erstellen**
```typescript
// src/components/NewComponent.tsx
export function NewComponent() {
  return <div>Neue Komponente</div>;
}
```

3. **Supabase-Client erweitern**
```typescript
// src/lib/supabase.ts
// Neue Funktionen hier hinzufügen
```

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Committe deine Änderungen
4. Erstelle einen Pull Request

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.

## 🆘 Support

Bei Fragen oder Problemen:
1. Überprüfe die Dokumentation
2. Schaue in die Issues
3. Erstelle ein neues Issue mit detaillierter Beschreibung
