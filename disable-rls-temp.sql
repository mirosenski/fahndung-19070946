-- Temporäre RLS-Deaktivierung für Debugging
-- Führe diese SQL-Befehle in der Supabase SQL Editor aus

-- RLS für alle Tabellen temporär deaktivieren
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigation_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.media DISABLE ROW LEVEL SECURITY;

-- Bestehende Demo-Profile löschen (falls vorhanden)
DELETE FROM public.user_profiles WHERE email IN (
  'admin@fahndung.local',
  'editor@fahndung.local', 
  'user@fahndung.local'
);

-- Demo-Profile neu erstellen
INSERT INTO public.user_profiles (email, role, name, department, status) VALUES
('admin@fahndung.local', 'admin', 'Administrator', 'IT', 'approved'),
('editor@fahndung.local', 'editor', 'Editor', 'Redaktion', 'approved'),
('user@fahndung.local', 'user', 'Benutzer', 'Allgemein', 'approved');

-- Bestätigung
SELECT 'RLS deaktiviert und Demo-Profile erstellt' as status; 