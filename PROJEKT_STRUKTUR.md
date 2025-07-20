# Projektstruktur - Fahndung

## Vollständige Verzeichnisstruktur

```
fahndung/
├── .git/                          # Git Repository
├── .next/                         # Next.js Build-Verzeichnis
├── .vscode/                       # VS Code Konfiguration
│   ├── css_custom_data.json      # CSS IntelliSense-Daten
│   └── settings.json             # VS Code-Einstellungen
├── .vercel/                       # Vercel Deployment-Konfiguration
│   ├── README.txt                # Vercel-Dokumentation
│   └── project.json              # Vercel-Projekt-Konfiguration
├── archiv/                        # Archivierte Dateien
│   ├── anleitungen/               # Anleitungen und Dokumentation
│   │   ├── DEMO-USER-SETUP.md    # Demo-User Setup-Anleitung
│   │   ├── EMAIL-SETUP.md        # E-Mail-Setup-Anleitung
│   │   ├── GENEHMIGUNGSSYSTEM-ANLEITUNG.md # Genehmigungssystem-Anleitung
│   │   ├── PENDING-REGISTRATIONS-SETUP.md # Pending-Registrations-Setup
│   │   ├── QUICK-FIX.md          # Quick-Fix-Anleitung
│   │   ├── REGISTRATION-SETUP.md # Registrierungs-Setup
│   │   ├── RLS-FIX-ANLEITUNG.md # RLS-Fix-Anleitung
│   │   ├── SCHEMA-FIX-ANLEITUNG.md # Schema-Fix-Anleitung
│   │   ├── SCHNELLFIX-ANLEITUNG.md # Schnellfix-Anleitung
│   │   ├── SUPER-ADMIN-ANLEITUNG.md # Super-Admin-Anleitung
│   │   ├── SUPER-ADMIN-SETUP.md # Super-Admin-Setup
│   │   ├── SUPABASE-AUTH-SETUP.md # Supabase-Auth-Setup
│   │   ├── SUPABASE-SETUP.md     # Supabase-Setup
│   │   ├── SUPABASE-SETUP-ANLEITUNG.md # Supabase-Setup-Anleitung
│   │   └── VERCEL-FIX.md         # Vercel-Fix-Anleitung
│   └── database/                  # Datenbank-Archiv
│       ├── basic-schema.sql       # Grundlegendes Schema
│       ├── create-admin-profile.sql # Admin-Profil-Erstellung
│       ├── disable-rls-temp.sql   # Temporäre RLS-Deaktivierung
│       ├── extended-admin-schema.sql # Erweitertes Admin-Schema
│       ├── fix-existing-users.sql # Fix für bestehende User
│       ├── fix-registration.sql   # Registrierungs-Fix
│       ├── fix-rls-policies.sql   # RLS-Policies-Fix
│       ├── pending-registrations-schema.sql # Pending-Registrations-Schema
│       ├── pending-registrations.sql # Pending-Registrations
│       ├── super-admin-schema-fixed.sql # Super-Admin-Schema (Fixed)
│       ├── super-admin-schema-fixed-v2.sql # Super-Admin-Schema (Fixed v2)
│       ├── super-admin-schema.sql # Super-Admin-Schema
│       └── supabase-schema.sql    # Supabase-Schema
├── node_modules/                  # Node.js Abhängigkeiten
├── public/                        # Öffentliche statische Dateien
│   └── favicon.ico               # Website-Favicon
├── src/                          # Hauptquellcode-Verzeichnis
│   ├── app/                      # Next.js App Router
│   │   ├── (public)/            # Öffentliche Routen (Layout-Gruppe)
│   │   │   ├── layout.tsx       # Layout für öffentliche Seiten
│   │   │   ├── page.tsx         # Öffentliche Startseite
│   │   │   └── test/            # Test-Verzeichnis (leer)
│   │   ├── _components/         # App-spezifische Komponenten
│   │   │   └── post.tsx         # Post-Komponente
│   │   ├── admin/               # Admin-Bereich
│   │   │   ├── page.tsx         # Admin-Hauptseite
│   │   │   ├── users/           # User-Verwaltung
│   │   │   │   └── page.tsx     # User-Verwaltungs-Seite
│   │   │   └── wizard/          # Admin-Wizard
│   │   │       └── page.tsx     # Admin-Wizard-Seite
│   │   ├── api/                 # API-Routen
│   │   │   └── trpc/            # tRPC-API
│   │   │       └── [trpc]/      # tRPC-Dynamic-Route
│   │   │           └── route.ts # tRPC-Route-Handler
│   │   ├── dashboard/           # Dashboard-Bereich
│   │   │   └── page.tsx        # Dashboard-Hauptseite
│   │   ├── debug/               # Debug-Bereich
│   │   ├── login/               # Login-Seite
│   │   ├── register/            # Registrierungs-Seite
│   │   ├── globals.css          # Globale CSS-Styles
│   │   ├── layout.tsx           # Root-Layout
│   │   └── page.tsx             # Root-Seite
│   ├── components/              # Wiederverwendbare Komponenten
│   │   ├── fahndung/           # Fahndung-spezifische Komponenten
│   │   │   └── FahndungCard.tsx # Fahndung-Karten-Komponente
│   │   ├── ui/                 # UI-Basis-Komponenten
│   │   │   ├── badge.tsx       # Badge-Komponente
│   │   │   ├── button.tsx      # Button-Komponente
│   │   │   └── card.tsx        # Card-Komponente
│   │   └── SessionInitializer.tsx # Session-Initialisierung
│   ├── lib/                    # Utility-Bibliotheken
│   │   ├── supabase/           # Supabase-spezifische Utilities
│   │   │   ├── client.ts       # Supabase-Client
│   │   │   └── server.ts       # Supabase-Server
│   │   ├── auth.ts             # Authentifizierung
│   │   ├── email-notifications.ts # E-Mail-Benachrichtigungen
│   │   ├── supabase.ts         # Supabase-Client
│   │   └── utils.ts            # Allgemeine Utilities
│   ├── server/                 # Server-seitiger Code
│   │   ├── api/                # API-Logik
│   │   │   ├── routers/        # tRPC Router
│   │   │   │   ├── auth.ts     # Authentifizierungs-Router
│   │   │   │   └── post.ts     # Post-Router
│   │   │   ├── root.ts         # Root-Router
│   │   │   └── trpc.ts         # tRPC-Konfiguration
│   │   └── db.ts               # Datenbank-Verbindung
│   ├── trpc/                   # tRPC-Client-Konfiguration
│   │   ├── query-client.ts     # Query-Client
│   │   ├── react.tsx           # React-Integration
│   │   └── server.ts           # Server-Konfiguration
│   ├── types/                  # TypeScript-Typdefinitionen
│   │   ├── fahndung.ts         # Fahndung-spezifische Typen
│   │   └── supabase.ts         # Supabase-Typen
│   ├── env.js                  # Umgebungsvariablen
│   └── middleware.ts           # Next.js Middleware
├── supabase/                   # Supabase-Konfiguration
│   ├── migrations/             # Datenbank-Migrationen
│   │   ├── 001_initial_schema.sql    # Initiales Schema
│   │   ├── 002_storage_setup.sql     # Storage-Setup
│   │   └── 003_add_missing_columns.sql # Fehlende Spalten
│   ├── .gitignore              # Supabase Gitignore
│   └── config.toml             # Supabase-Konfiguration
├── .eslintrc.json              # ESLint-Konfiguration
├── .gitignore                  # Git Ignore-Datei
├── .npmrc                      # NPM-Konfiguration
├── eslint.config.js            # ESLint-Konfiguration (neu)
├── next-env.d.ts              # Next.js TypeScript-Definitionen
├── next.config.js              # Next.js-Konfiguration
├── package.json                # Projekt-Abhängigkeiten
├── pnpm-lock.yaml             # PNPM Lock-Datei
├── postcss.config.js           # PostCSS-Konfiguration
├── prettier.config.js          # Prettier-Konfiguration
├── README.md                   # Projekt-Dokumentation
├── start-database.sh           # Datenbank-Start-Skript
├── tsconfig.json               # TypeScript-Konfiguration
├── tsconfig.tsbuildinfo        # TypeScript Build-Info
├── vercel.json                 # Vercel-Deployment-Konfiguration
└── PROJECT_STRUKTUR.md         # Diese Datei
```

## Technologie-Stack

### Frontend
- **Next.js 14** - React-Framework mit App Router
- **TypeScript** - Typsichere JavaScript-Entwicklung
- **Tailwind CSS** - Utility-First CSS-Framework
- **Lucide Icons** - Icon-Bibliothek

### Backend & Datenbank
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Datenbank
- **tRPC** - End-to-End TypeScript-API

### Entwicklungstools
- **ESLint** - Code-Linting
- **Prettier** - Code-Formatierung
- **PNPM** - Package Manager

### Deployment
- **Vercel** - Hosting-Plattform

## Projektstruktur-Erklärung

### `/src/app/`
Next.js App Router mit verschiedenen Routen-Gruppen:
- `(public)/` - Öffentlich zugängliche Seiten
- `dashboard/` - Geschützter Dashboard-Bereich
- `admin/` - Admin-Funktionalitäten
- `api/` - API-Endpunkte

### `/src/components/`
Wiederverwendbare React-Komponenten:
- `ui/` - Basis-UI-Komponenten (Button, Card, Badge)
- `fahndung/` - Anwendungsspezifische Komponenten

### `/src/lib/`
Utility-Funktionen und Konfigurationen:
- `auth.ts` - Authentifizierungslogik
- `supabase.ts` - Supabase-Client-Konfiguration
- `email-notifications.ts` - E-Mail-Benachrichtigungssystem

### `/src/server/`
Server-seitige Logik:
- `api/routers/` - tRPC-Router für API-Endpunkte
- `db.ts` - Datenbankverbindung

### `/supabase/`
Supabase-Konfiguration und Migrationen:
- `migrations/` - SQL-Migrationen für Datenbankschema
- `config.toml` - Supabase-Projektkonfiguration

## Datenbank-Schema

Das Projekt verwendet Supabase mit PostgreSQL und enthält drei Hauptmigrationen:
1. **001_initial_schema.sql** - Grundlegendes Datenbankschema
2. **002_storage_setup.sql** - File-Storage-Konfiguration
3. **003_add_missing_columns.sql** - Ergänzende Spalten

## Authentifizierung

Das System implementiert eine vollständige Authentifizierung mit:
- Supabase Auth
- Session-Management
- Geschützte Routen
- Admin-Berechtigungen

## Deployment

Das Projekt ist für Deployment auf Vercel konfiguriert mit:
- Automatische Builds
- Umgebungsvariablen-Management
- Supabase-Integration 