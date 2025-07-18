-- Fix für bestehende User - Führe das in Supabase SQL Editor aus

-- 1. Profile für alle auth.users erstellen, die noch keine haben
INSERT INTO public.user_profiles (user_id, email, name, role, department, status)
SELECT 
    u.id,
    u.email,
    COALESCE(u.email::text, 'Benutzer') as name,
    'user' as role,
    'Allgemein' as department,
    'approved' as status
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.user_id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 2. Alle bestehenden Profile auf 'approved' setzen
UPDATE public.user_profiles 
SET status = 'approved' 
WHERE status IS NULL OR status = '';

-- 3. Prüfe das Ergebnis
SELECT 
    'Bestehende User gefixt' as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_users,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_users
FROM public.user_profiles; 