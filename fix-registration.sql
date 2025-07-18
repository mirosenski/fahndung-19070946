-- Fix für Registrierung - Führe das in Supabase SQL Editor aus

-- 1. Schema erweitern
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS registration_email VARCHAR(255);

-- 2. Bestehende User auf 'approved' setzen
UPDATE public.user_profiles 
SET status = 'approved' 
WHERE status IS NULL OR status = '';

-- 3. RLS Policies für Registrierung
DROP POLICY IF EXISTS "Allow profile creation during registration" ON public.user_profiles;
CREATE POLICY "Allow profile creation during registration" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Policy für Lesen eigener Profile
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
CREATE POLICY "Users can read own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND role = 'admin'
    ));

-- 5. Policy für Admin-Management
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.user_profiles;
CREATE POLICY "Admins can manage all profiles" ON public.user_profiles
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND role = 'admin'
    ));

-- 6. Index für Status
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON public.user_profiles(status);

-- 7. RLS aktivieren (falls nicht aktiviert)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 8. Test: Prüfe ob alles funktioniert
SELECT 
    'Schema erweitert' as status,
    COUNT(*) as user_count,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count
FROM public.user_profiles; 