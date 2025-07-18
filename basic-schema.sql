-- Grundlegendes Schema für Fahndung System
-- Führe diese SQL-Befehle ZUERST im Supabase SQL Editor aus

-- 1. User-Profile Tabelle erstellen (falls nicht existiert)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'user')),
    department VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    registration_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 2. RLS aktivieren
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
CREATE POLICY "Users can read own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND role = 'admin'
    ));

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow profile creation during registration" ON public.user_profiles;
CREATE POLICY "Allow profile creation during registration" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.user_profiles;
CREATE POLICY "Admins can manage all profiles" ON public.user_profiles
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND role = 'admin'
    ));

-- 4. Indexe
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON public.user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- 5. Super-Admin erstellen (falls nicht existiert)
INSERT INTO public.user_profiles (user_id, email, role, name, status, department)
SELECT 
    id,
    email,
    'admin',
    'Super Administrator',
    'approved',
    'IT'
FROM auth.users 
WHERE email = 'ptlsweb@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
    role = 'admin',
    status = 'approved';

-- 6. Bestehende User auf 'approved' setzen (falls sie keinen Status haben)
UPDATE public.user_profiles 
SET status = 'approved' 
WHERE status IS NULL OR status = '';

-- 7. Prüfung
SELECT 
    'Grundlegendes Schema erstellt' as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_users,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_users,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users
FROM public.user_profiles; 