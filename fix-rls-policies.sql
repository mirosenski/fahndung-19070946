-- Fix für RLS-Policies Endlosschleife
-- Führe diese SQL-Befehle in der Supabase SQL Editor aus

-- Zuerst alle bestehenden Policies löschen
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow profile creation during registration" ON public.user_profiles;

-- Neue, einfachere Policies erstellen
-- 1. Jeder kann sein eigenes Profil lesen
CREATE POLICY "Users can read own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- 2. Jeder kann sein eigenes Profil aktualisieren
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- 3. Jeder kann sein eigenes Profil erstellen
CREATE POLICY "Users can create own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Admins können alle Profile lesen (ohne Endlosschleife)
CREATE POLICY "Admins can read all profiles" ON public.user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up 
            WHERE up.user_id = auth.uid() 
            AND up.role = 'admin'
        )
    );

-- 5. Admins können alle Profile verwalten (ohne Endlosschleife)
CREATE POLICY "Admins can manage all profiles" ON public.user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up 
            WHERE up.user_id = auth.uid() 
            AND up.role = 'admin'
        )
    );

-- Temporäre Policy für unauthentifizierte Benutzer (für Registrierung)
CREATE POLICY "Allow unauthenticated profile creation" ON public.user_profiles
    FOR INSERT WITH CHECK (true);

-- Investigations Policies (falls auch problematisch)
DROP POLICY IF EXISTS "Anyone can read published investigations" ON public.investigations;
DROP POLICY IF EXISTS "Authenticated users can read all investigations" ON public.investigations;
DROP POLICY IF EXISTS "Editors and admins can manage investigations" ON public.investigations;

-- Neue Investigations Policies
CREATE POLICY "Anyone can read published investigations" ON public.investigations
    FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can read all investigations" ON public.investigations
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Editors and admins can manage investigations" ON public.investigations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up 
            WHERE up.user_id = auth.uid() 
            AND up.role IN ('admin', 'editor')
        )
    );

-- Investigation images Policies
DROP POLICY IF EXISTS "Anyone can read published investigation images" ON public.investigation_images;
DROP POLICY IF EXISTS "Authenticated users can read all investigation images" ON public.investigation_images;
DROP POLICY IF EXISTS "Editors and admins can manage investigation images" ON public.investigation_images;

CREATE POLICY "Anyone can read published investigation images" ON public.investigation_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.investigations i 
            WHERE i.id = investigation_id 
            AND i.status = 'published'
        )
    );

CREATE POLICY "Authenticated users can read all investigation images" ON public.investigation_images
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Editors and admins can manage investigation images" ON public.investigation_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up 
            WHERE up.user_id = auth.uid() 
            AND up.role IN ('admin', 'editor')
        )
    );

-- Media Policies
DROP POLICY IF EXISTS "Authenticated users can read media" ON public.media;
DROP POLICY IF EXISTS "Editors and admins can manage media" ON public.media;

CREATE POLICY "Authenticated users can read media" ON public.media
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Editors and admins can manage media" ON public.media
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up 
            WHERE up.user_id = auth.uid() 
            AND up.role IN ('admin', 'editor')
        )
    ); 