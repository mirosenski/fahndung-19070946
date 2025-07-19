-- Fehlende Spalten zur bestehenden fahndungen-Tabelle hinzufügen

-- Spalte 'typ' hinzufügen (falls nicht vorhanden)
DO $$ BEGIN
    ALTER TABLE fahndungen ADD COLUMN typ fahndung_typ;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Spalte 'status' hinzufügen (falls nicht vorhanden)
DO $$ BEGIN
    ALTER TABLE fahndungen ADD COLUMN status fahndung_status DEFAULT 'entwurf';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Spalte 'prioritaet' hinzufügen (falls nicht vorhanden)
DO $$ BEGIN
    ALTER TABLE fahndungen ADD COLUMN prioritaet fahndung_prioritaet DEFAULT 'normal';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Spalte 'kurzbeschreibung' hinzufügen (falls nicht vorhanden)
DO $$ BEGIN
    ALTER TABLE fahndungen ADD COLUMN kurzbeschreibung TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Spalte 'beschreibung' hinzufügen (falls nicht vorhanden)
DO $$ BEGIN
    ALTER TABLE fahndungen ADD COLUMN beschreibung TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Spalte 'ort_name' hinzufügen (falls nicht vorhanden)
DO $$ BEGIN
    ALTER TABLE fahndungen ADD COLUMN ort_name VARCHAR(255);
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Spalte 'ort_lat' hinzufügen (falls nicht vorhanden)
DO $$ BEGIN
    ALTER TABLE fahndungen ADD COLUMN ort_lat DECIMAL(10, 8);
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Spalte 'ort_lng' hinzufügen (falls nicht vorhanden)
DO $$ BEGIN
    ALTER TABLE fahndungen ADD COLUMN ort_lng DECIMAL(11, 8);
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Spalte 'ort_radius' hinzufügen (falls nicht vorhanden)
DO $$ BEGIN
    ALTER TABLE fahndungen ADD COLUMN ort_radius INTEGER DEFAULT 0;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Spalte 'veroeffentlicht_von' hinzufügen (falls nicht vorhanden)
DO $$ BEGIN
    ALTER TABLE fahndungen ADD COLUMN veroeffentlicht_von TIMESTAMP WITH TIME ZONE;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Spalte 'veroeffentlicht_bis' hinzufügen (falls nicht vorhanden)
DO $$ BEGIN
    ALTER TABLE fahndungen ADD COLUMN veroeffentlicht_bis TIMESTAMP WITH TIME ZONE;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Spalte 'erstellt_von' hinzufügen (falls nicht vorhanden)
DO $$ BEGIN
    ALTER TABLE fahndungen ADD COLUMN erstellt_von UUID REFERENCES auth.users(id);
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Falls erstellt_von bereits als TEXT existiert, ändern wir den Typ
DO $$ BEGIN
    ALTER TABLE fahndungen ALTER COLUMN erstellt_von TYPE UUID USING erstellt_von::UUID;
EXCEPTION
    WHEN invalid_text_representation THEN null;
    WHEN undefined_column THEN null;
END $$;

-- Spalte 'erstellt_am' hinzufügen (falls nicht vorhanden)
DO $$ BEGIN
    ALTER TABLE fahndungen ADD COLUMN erstellt_am TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Spalte 'aktualisiert_am' hinzufügen (falls nicht vorhanden)
DO $$ BEGIN
    ALTER TABLE fahndungen ADD COLUMN aktualisiert_am TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Spalte 'wizard_data' hinzufügen (falls nicht vorhanden)
DO $$ BEGIN
    ALTER TABLE fahndungen ADD COLUMN wizard_data JSONB DEFAULT '{}'::jsonb;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Constraints hinzufügen (falls nicht vorhanden)
DO $$ BEGIN
    ALTER TABLE fahndungen ADD CONSTRAINT valid_publish_dates CHECK (
        veroeffentlicht_bis IS NULL OR 
        veroeffentlicht_von IS NULL OR 
        veroeffentlicht_bis > veroeffentlicht_von
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$; 