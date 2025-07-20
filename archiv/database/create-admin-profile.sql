-- Admin-Profil für ptlsweb@gmail.com erstellen
-- Führe dieses Script im Supabase SQL Editor aus

-- Zuerst prüfen, ob die user_profiles Tabelle existiert
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        RAISE EXCEPTION 'Tabelle user_profiles existiert nicht. Bitte führe zuerst basic-schema.sql aus.';
    END IF;
END $$;

-- Admin-Profil für ptlsweb@gmail.com erstellen
INSERT INTO user_profiles (
    user_id,
    email,
    name,
    role,
    department,
    status,
    created_at,
    updated_at
) VALUES (
    'admin-user-id', -- Platzhalter für user_id
    'ptlsweb@gmail.com',
    'Super Administrator',
    'admin',
    'IT & Verwaltung',
    'approved',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    status = EXCLUDED.status,
    updated_at = NOW();

-- Bestätigung ausgeben
SELECT 'Admin-Profil für ptlsweb@gmail.com erfolgreich erstellt/aktualisiert!' as message; 