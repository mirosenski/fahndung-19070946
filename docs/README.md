# Fahndung - Dokumentation

## 📚 Setup-Anleitungen

### 🗄️ Datenbank & Backend
- [Supabase Setup](./SUPABASE-SETUP-ANLEITUNG.md) - Grundlegende Datenbank-Konfiguration
- [Email Setup](./EMAIL-SETUP.md) - Email-Versand konfigurieren

### 👥 Benutzerverwaltung
- [Super Admin Setup](./SUPER-ADMIN-ANLEITUNG.md) - Administrator-Accounts einrichten

## 🏗️ Architektur

### Komponenten-Struktur
```
src/
├── components/
│   ├── ui/          # Basis-Komponenten (shadcn/ui)
│   ├── features/    # Feature-spezifische Komponenten
│   └── layouts/     # Layout-Komponenten
```

### API-Router-Organisation
```
src/server/api/routers/
├── auth/           # Authentifizierung
├── fahndung/       # Hauptfunktionalität
└── admin/          # Admin-Funktionen
```

## 🔧 Entwicklung

### Umgebung
- **Framework**: Next.js 14 mit App Router
- **Datenbank**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **API**: tRPC
- **Styling**: Tailwind CSS + shadcn/ui

### Scripts
```bash
# Entwicklung
pnpm dev

# Build
pnpm build

# Production
pnpm start
```

## 📁 Projektstruktur

### Wichtige Dateien
- `src/env.js` - Umgebungsvariablen
- `src/middleware.ts` - Next.js Middleware
- `supabase/` - Datenbank-Migrationen
- `src/server/api/routers/` - tRPC Router

### Sicherheit
- Row Level Security (RLS) aktiviert
- Environment Variables über Vercel verwaltet
- Auth-Guards für geschützte Routen 