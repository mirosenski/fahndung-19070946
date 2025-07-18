-- Pending Registrations Schema für Genehmigungssystem
-- Führe dieses Script in Supabase SQL Editor aus

-- Tabelle für ausstehende Registrierungen
CREATE TABLE IF NOT EXISTS pending_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  department TEXT,
  phone TEXT,
  password_hash TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies für pending_registrations
ALTER TABLE pending_registrations ENABLE ROW LEVEL SECURITY;

-- Nur Admins können pending_registrations sehen und bearbeiten
CREATE POLICY IF NOT EXISTS "Admins can manage pending registrations" ON pending_registrations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_pending_registrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS update_pending_registrations_updated_at
  BEFORE UPDATE ON pending_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_pending_registrations_updated_at();

-- Funktion zum Genehmigen einer Registrierung
CREATE OR REPLACE FUNCTION approve_registration(
  registration_id UUID,
  admin_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  registration_record pending_registrations%ROWTYPE;
  new_user_id UUID;
BEGIN
  -- Prüfe Admin-Berechtigung
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Nur Administratoren können Registrierungen genehmigen';
  END IF;

  -- Hole Registrierungsdaten
  SELECT * INTO registration_record 
  FROM pending_registrations 
  WHERE id = registration_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registrierung nicht gefunden oder bereits bearbeitet';
  END IF;

  -- Erstelle neuen Benutzer in auth.users
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
  ) VALUES (
    registration_record.email,
    registration_record.password_hash,
    NOW(),
    NOW(),
    NOW()
  ) RETURNING id INTO new_user_id;

  -- Erstelle Benutzer-Profil
  INSERT INTO user_profiles (
    user_id,
    email,
    name,
    role,
    department,
    phone,
    is_active,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    registration_record.email,
    registration_record.name,
    'user',
    registration_record.department ?? 'Allgemein',
    registration_record.phone,
    true,
    auth.uid(),
    NOW(),
    NOW()
  );

  -- Markiere Registrierung als genehmigt
  UPDATE pending_registrations 
  SET 
    status = 'approved',
    admin_notes = admin_notes,
    approved_by = auth.uid(),
    approved_at = NOW()
  WHERE id = registration_id;

  -- Logge Admin-Aktion
  INSERT INTO admin_actions (
    admin_id,
    action_type,
    target_user_id,
    description,
    created_at,
    metadata
  ) VALUES (
    auth.uid(),
    'user_approve',
    new_user_id,
    'Registrierung genehmigt: ' || registration_record.email,
    NOW(),
    jsonb_build_object('registration_id', registration_id, 'email', registration_record.email)
  );

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Fehler beim Genehmigen der Registrierung: %', SQLERRM;
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funktion zum Ablehnen einer Registrierung
CREATE OR REPLACE FUNCTION reject_registration(
  registration_id UUID,
  admin_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  -- Prüfe Admin-Berechtigung
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Nur Administratoren können Registrierungen ablehnen';
  END IF;

  -- Markiere Registrierung als abgelehnt
  UPDATE pending_registrations 
  SET 
    status = 'rejected',
    admin_notes = admin_notes,
    approved_by = auth.uid(),
    approved_at = NOW()
  WHERE id = registration_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registrierung nicht gefunden oder bereits bearbeitet';
  END IF;

  -- Logge Admin-Aktion
  INSERT INTO admin_actions (
    admin_id,
    action_type,
    description,
    created_at,
    metadata
  ) VALUES (
    auth.uid(),
    'user_reject',
    'Registrierung abgelehnt: ' || (SELECT email FROM pending_registrations WHERE id = registration_id),
    NOW(),
    jsonb_build_object('registration_id', registration_id)
  );

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Fehler beim Ablehnen der Registrierung: %', SQLERRM;
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_pending_registrations_status ON pending_registrations(status);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_created_at ON pending_registrations(created_at); 