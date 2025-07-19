-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Types (nur erstellen, falls nicht vorhanden)
DO $$ BEGIN
    CREATE TYPE fahndung_typ AS ENUM ('straftaeter', 'vermisste', 'unbekannte_tote', 'sachen');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE fahndung_status AS ENUM ('entwurf', 'pruefung', 'veroeffentlicht', 'archiviert');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE fahndung_prioritaet AS ENUM ('niedrig', 'normal', 'hoch', 'dringend');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE benutzer_rolle AS ENUM ('nutzer', 'redakteur', 'admin', 'superuser');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Fahndungen Haupttabelle (nur erstellen, falls nicht vorhanden)
CREATE TABLE IF NOT EXISTS fahndungen (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  typ fahndung_typ NOT NULL,
  status fahndung_status DEFAULT 'entwurf',
  prioritaet fahndung_prioritaet DEFAULT 'normal',
  
  -- Grunddaten
  titel VARCHAR(255) NOT NULL,
  kurzbeschreibung TEXT,
  beschreibung TEXT,
  
  -- Ortsdaten
  ort_name VARCHAR(255),
  ort_lat DECIMAL(10, 8),
  ort_lng DECIMAL(11, 8),
  ort_radius INTEGER DEFAULT 0, -- in Metern
  
  -- Zeitsteuerung
  veroeffentlicht_von TIMESTAMP WITH TIME ZONE,
  veroeffentlicht_bis TIMESTAMP WITH TIME ZONE,
  
  -- Metadaten
  erstellt_von UUID REFERENCES auth.users(id),
  erstellt_am TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  aktualisiert_am TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Wizard Daten (JSONB für Flexibilität)
  wizard_data JSONB DEFAULT '{}'::jsonb,
  
  -- Constraints
  CONSTRAINT valid_publish_dates CHECK (
    veroeffentlicht_bis IS NULL OR 
    veroeffentlicht_von IS NULL OR 
    veroeffentlicht_bis > veroeffentlicht_von
  )
);

-- Indizes für Performance (nur erstellen, falls nicht vorhanden)
CREATE INDEX IF NOT EXISTS idx_fahndungen_status ON fahndungen(status);
CREATE INDEX IF NOT EXISTS idx_fahndungen_typ ON fahndungen(typ);
CREATE INDEX IF NOT EXISTS idx_fahndungen_veroeffentlicht ON fahndungen(veroeffentlicht_von, veroeffentlicht_bis);
-- Geografischer Index für Ort (vereinfacht)
CREATE INDEX IF NOT EXISTS idx_fahndungen_ort_coords ON fahndungen(ort_lat, ort_lng) 
WHERE ort_lat IS NOT NULL AND ort_lng IS NOT NULL;

-- RLS Policies (nur erstellen, falls nicht vorhanden)
ALTER TABLE fahndungen ENABLE ROW LEVEL SECURITY;

-- Public kann veröffentlichte Fahndungen lesen
DO $$ BEGIN
    CREATE POLICY "Public kann veröffentlichte Fahndungen lesen" ON fahndungen
      FOR SELECT
      TO public
      USING (
        status = 'veroeffentlicht' AND
        (veroeffentlicht_von IS NULL OR veroeffentlicht_von <= NOW()) AND
        (veroeffentlicht_bis IS NULL OR veroeffentlicht_bis >= NOW())
      );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Authentifizierte Benutzer können eigene Entwürfe sehen
DO $$ BEGIN
    CREATE POLICY "Benutzer können eigene Fahndungen sehen" ON fahndungen
      FOR ALL
      TO authenticated
      USING (erstellt_von = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Trigger für updated_at (nur erstellen, falls nicht vorhanden)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.aktualisiert_am = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
    CREATE TRIGGER update_fahndungen_updated_at 
      BEFORE UPDATE ON fahndungen 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$; 