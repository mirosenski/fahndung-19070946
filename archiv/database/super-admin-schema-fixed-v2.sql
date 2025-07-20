-- Super-Admin Schema für erweiterte Benutzerverwaltung (Korrigierte Version)
-- Führe diese SQL-Befehle in der Supabase SQL Editor aus

-- Erweitere user_profiles Tabelle (nur neue Spalten hinzufügen)
DO $$ 
BEGIN
    -- Füge Spalten hinzu, falls sie nicht existieren
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'last_login') THEN
        ALTER TABLE public.user_profiles ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'login_count') THEN
        ALTER TABLE public.user_profiles ADD COLUMN login_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'is_active') THEN
        ALTER TABLE public.user_profiles ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'created_by') THEN
        ALTER TABLE public.user_profiles ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'notes') THEN
        ALTER TABLE public.user_profiles ADD COLUMN notes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.user_profiles ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- Erstelle user_activity Tabelle für detaillierte Aktivitätsverfolgung
CREATE TABLE IF NOT EXISTS public.user_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN (
        'login', 'logout', 'profile_update', 'investigation_create', 
        'investigation_edit', 'investigation_delete', 'media_upload',
        'user_block', 'user_unblock', 'role_change', 'password_reset'
    )),
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Erstelle user_sessions Tabelle für Session-Tracking
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    logout_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'
);

-- Erstelle admin_actions Tabelle für Admin-Aktivitäten
CREATE TABLE IF NOT EXISTS public.admin_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES auth.users(id),
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN (
        'user_block', 'user_unblock', 'role_change', 'user_delete',
        'investigation_approve', 'investigation_reject', 'system_settings'
    )),
    target_user_id UUID REFERENCES auth.users(id),
    target_investigation_id UUID REFERENCES public.investigations(id),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Erstelle system_settings Tabelle
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Erstelle Indexe für Performance (nur falls nicht vorhanden)
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON public.user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON public.user_activity(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON public.admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_type ON public.admin_actions(action_type);

-- RLS-Policies für neue Tabellen (nur falls nicht vorhanden)
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- User Activity Policies (nur falls nicht vorhanden)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_activity' AND policyname = 'Users can view own activity') THEN
        CREATE POLICY "Users can view own activity" ON public.user_activity
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_activity' AND policyname = 'Admins can view all activity') THEN
        CREATE POLICY "Admins can view all activity" ON public.user_activity
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND role = 'admin'
                )
            );
    END IF;
END $$;

-- User Sessions Policies (nur falls nicht vorhanden)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_sessions' AND policyname = 'Users can view own sessions') THEN
        CREATE POLICY "Users can view own sessions" ON public.user_sessions
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_sessions' AND policyname = 'Admins can view all sessions') THEN
        CREATE POLICY "Admins can view all sessions" ON public.user_sessions
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND role = 'admin'
                )
            );
    END IF;
END $$;

-- Admin Actions Policies (nur falls nicht vorhanden)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_actions' AND policyname = 'Admins can manage admin actions') THEN
        CREATE POLICY "Admins can manage admin actions" ON public.admin_actions
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND role = 'admin'
                )
            );
    END IF;
END $$;

-- System Settings Policies (nur falls nicht vorhanden)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'system_settings' AND policyname = 'Admins can manage system settings') THEN
        CREATE POLICY "Admins can manage system settings" ON public.system_settings
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND role = 'admin'
                )
            );
    END IF;
END $$;

-- Funktionen für automatische Updates (nur falls nicht vorhanden)
CREATE OR REPLACE FUNCTION update_user_login_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update last_login und login_count
    UPDATE public.user_profiles 
    SET 
        last_login = NOW(),
        login_count = COALESCE(login_count, 0) + 1
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger für Login-Tracking (nur falls nicht vorhanden)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'track_user_login') THEN
        CREATE TRIGGER track_user_login
            AFTER INSERT ON public.user_sessions
            FOR EACH ROW
            EXECUTE FUNCTION update_user_login_stats();
    END IF;
END $$;

-- Funktion für Activity-Logging
CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id UUID,
    p_activity_type VARCHAR(50),
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO public.user_activity (
        user_id, 
        activity_type, 
        description, 
        metadata
    ) VALUES (
        p_user_id, 
        p_activity_type, 
        p_description, 
        p_metadata
    ) RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ language 'plpgsql';

-- Funktion für Admin-Action-Logging
CREATE OR REPLACE FUNCTION log_admin_action(
    p_admin_id UUID,
    p_action_type VARCHAR(50),
    p_target_user_id UUID DEFAULT NULL,
    p_target_investigation_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    action_id UUID;
BEGIN
    INSERT INTO public.admin_actions (
        admin_id,
        action_type,
        target_user_id,
        target_investigation_id,
        description,
        metadata
    ) VALUES (
        p_admin_id,
        p_action_type,
        p_target_user_id,
        p_target_investigation_id,
        p_description,
        p_metadata
    ) RETURNING id INTO action_id;
    
    RETURN action_id;
END;
$$ language 'plpgsql';

-- Initialisiere System-Settings (nur falls nicht vorhanden)
DO $$
BEGIN
    -- Prüfe ob System-Settings bereits existieren
    IF NOT EXISTS (SELECT 1 FROM public.system_settings WHERE setting_key = 'user_registration') THEN
        INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES
        ('user_registration', '{"enabled": true, "require_approval": true}', 'Benutzerregistrierung Einstellungen');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.system_settings WHERE setting_key = 'session_timeout') THEN
        INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES
        ('session_timeout', '{"hours": 24}', 'Session-Timeout Einstellungen');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.system_settings WHERE setting_key = 'max_login_attempts') THEN
        INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES
        ('max_login_attempts', '{"count": 5, "lockout_minutes": 30}', 'Maximale Login-Versuche');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.system_settings WHERE setting_key = 'file_upload') THEN
        INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES
        ('file_upload', '{"max_size_mb": 10, "allowed_types": ["jpg", "png", "pdf"]}', 'Datei-Upload Einstellungen');
    END IF;
END $$;

-- Erstelle Super-Admin User (falls nicht vorhanden)
DO $$
BEGIN
    -- Prüfe ob Super-Admin bereits existiert
    IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'superadmin@fahndung.local') THEN
        INSERT INTO public.user_profiles (
            email, 
            role, 
            name, 
            department, 
            status, 
            is_active,
            login_count,
            notes
        ) VALUES (
            'superadmin@fahndung.local',
            'admin',
            'Super Administrator',
            'IT',
            'approved',
            TRUE,
            0,
            'System Super Administrator'
        );
    ELSE
        -- Update bestehenden Super-Admin
        UPDATE public.user_profiles SET
            role = 'admin',
            is_active = TRUE,
            notes = 'System Super Administrator'
        WHERE email = 'superadmin@fahndung.local';
    END IF;
END $$;

-- Bestätigung
SELECT 'Super-Admin Schema erfolgreich erstellt/aktualisiert' as status; 