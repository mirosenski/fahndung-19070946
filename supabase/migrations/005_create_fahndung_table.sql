-- Migration: Create fahndung table
-- Beschreibung: Erstellt die Haupttabelle für Fahndungen

-- Erstelle die fahndung Tabelle
CREATE TABLE IF NOT EXISTS fahndung (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  priority TEXT DEFAULT 'medium',
  category TEXT,
  location TEXT,
  station TEXT,
  features TEXT,
  case_number TEXT,
  short_description TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'
);

-- Erstelle die profiles Tabelle falls sie nicht existiert
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  role TEXT DEFAULT 'user',
  department TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Erstelle Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_fahndung_created_by ON fahndung(created_by);
CREATE INDEX IF NOT EXISTS idx_fahndung_status ON fahndung(status);
CREATE INDEX IF NOT EXISTS idx_fahndung_priority ON fahndung(priority);
CREATE INDEX IF NOT EXISTS idx_fahndung_category ON fahndung(category);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Aktiviere Row Level Security
ALTER TABLE fahndung ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies für fahndung
CREATE POLICY "Users can view all fahndung" ON fahndung
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own fahndung" ON fahndung
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own fahndung" ON fahndung
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all fahndung" ON fahndung
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies für profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Funktion für automatische Timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger für updated_at
CREATE TRIGGER update_fahndung_updated_at
    BEFORE UPDATE ON fahndung
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 