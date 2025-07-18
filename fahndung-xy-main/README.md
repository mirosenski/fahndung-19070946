# Fahndung - Öffentliche Fahndungen

Ein modernes System zur Verwaltung öffentlicher Fahndungen und Vermisstenmeldungen mit Real-time Updates und optimierter Performance.

## 🚀 Features

### ✅ Implementiert
- **Real-time Updates** mit Supabase
- **Optimierte Caching-Strategien** für bessere Performance
- **PWA-Support** für Offline-Funktionalität
- **Edge Functions** für Bildoptimierung
- **Responsive Design** mit moderner UI
- **tRPC API** mit TypeScript-Sicherheit
- **Prisma ORM** mit PostgreSQL
- **Lucide Icons** für konsistentes Design

### 🔄 Live Updates
- Automatische Synchronisation zwischen allen Clients
- Optimistische Updates für bessere UX
- Real-time Benachrichtigungen bei Änderungen

## 🚀 Deployment auf Vercel

### 1. Datenbank einrichten

Für Vercel benötigen Sie eine PostgreSQL-Datenbank. Empfohlene Optionen:

- **Vercel Postgres** (einfachste Option)
- **Neon** (kostenlos)
- **Supabase** (kostenlos mit Real-time Features)

### 2. Supabase Setup (Empfohlen)

1. **Projekt erstellen** auf [supabase.com](https://supabase.com)
2. **Datenbank-URL kopieren** aus den Einstellungen
3. **Real-time aktivieren** für die `investigations` Tabelle

### 3. Umgebungsvariablen in Vercel

Fügen Sie diese Umgebungsvariablen in Ihrem Vercel-Projekt hinzu:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Supabase (für Real-time Updates)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# NextAuth (falls benötigt)
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-secret-key"
```

### 4. Deployment

1. **Repository zu Vercel verbinden**
   - Gehen Sie zu [vercel.com](https://vercel.com)
   - Verbinden Sie Ihr GitHub-Repository
   - Wählen Sie das Repository aus

2. **Build-Einstellungen**
   - Framework: Next.js
   - Build Command: `pnpm run vercel-build`
   - Install Command: `pnpm install`

3. **Deploy**
   - Klicken Sie auf "Deploy"
   - Vercel wird automatisch die Datenbank migrieren

### 5. Demo-Login

Nach dem Deployment können Sie sich mit den Demo-Zugangsdaten anmelden:

- **E-Mail:** admin@demo.de
- **Passwort:** demo123

## 🛠 Lokale Entwicklung

```bash
# Abhängigkeiten installieren
pnpm install

# Datenbank generieren
pnpm prisma generate

# Entwicklungsserver starten
pnpm dev
```

## 📁 Projektstruktur

```
src/
├── components/          # React-Komponenten
│   ├── admin/          # Admin-Dashboard Komponenten
│   ├── layout/         # Layout-Komponenten
│   └── ui/             # UI-Komponenten
├── hooks/              # Custom Hooks
│   └── useRealtimeInvestigations.ts  # Real-time Updates
├── lib/                # Utilities
│   ├── supabase.ts     # Supabase Client
│   └── database.ts     # Datenbank-Utilities
├── pages/              # Next.js Seiten
│   ├── admin.tsx       # Admin-Dashboard
│   ├── login.tsx       # Login-Seite
│   └── index.tsx       # Startseite
├── server/             # Backend-Logik
│   ├── api/            # tRPC API
│   └── db.ts           # Datenbankverbindung
└── utils/              # Utilities
    └── api.ts          # tRPC Client
```

## 🔧 Technologie-Stack

- **Frontend:** Next.js 15, React 18, TypeScript
- **Styling:** Tailwind CSS, Radix UI
- **Backend:** tRPC, Prisma, PostgreSQL
- **Real-time:** Supabase
- **Deployment:** Vercel
- **Icons:** Lucide React

## 🎯 Performance-Optimierungen

- **Edge Functions** für Bildoptimierung
- **PWA-Caching** für Offline-Support
- **Optimierte Queries** mit Prisma
- **Real-time Updates** ohne Page-Reload
- **Responsive Images** mit WebP-Format

## 🔄 Real-time Features

Das System unterstützt automatische Live-Updates:

1. **Neue Fahndungen** werden sofort angezeigt
2. **Aktualisierungen** werden in Echtzeit übertragen
3. **Löschungen** werden automatisch synchronisiert
4. **Optimistische Updates** für bessere UX

## 📱 PWA-Features

- **Offline-Support** für bereits geladene Inhalte
- **Installation** als native App möglich
- **Push-Benachrichtigungen** (in Entwicklung)
- **Background Sync** (in Entwicklung)

## 🚀 Nächste Schritte

1. **Push-Benachrichtigungen** implementieren
2. **Erweiterte Suchfunktionen** hinzufügen
3. **Mobile App** mit React Native
4. **Analytics** und Performance-Monitoring
5. **Erweiterte Bildbearbeitung** mit AI

---

**Entwickelt mit ❤️ für moderne Web-Anwendungen**
