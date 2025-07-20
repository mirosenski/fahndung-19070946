-- Erweitertes Schema für Super-Admin Dashboard
-- Führe diese SQL-Befehle in der Supabase SQL Editor aus

-- 1. User-Profile erweitern für Online-Status und Aktivitäten
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. User-Aktivitäten Tabelle erstellen
CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('login', 'logout', 'profile_update', 'investigation_create', 'investigation_edit', 'user_approved', 'user_rejected')),
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Admin-Benachrichtigungen Tabelle
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    department VARCHAR(255),
    phone VARCHAR(50),
    registration_date VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. User-Benachrichtigungen Tabelle
CREATE TABLE IF NOT EXISTS public.user_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Online-Status Tracking Tabelle
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. RLS Policies für neue Tabellen
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- 7. Policies für User-Aktivitäten
CREATE POLICY "Users can view own activities" ON public.user_activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activities" ON public.user_activities
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Users can create own activities" ON public.user_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. Policies für Admin-Benachrichtigungen
CREATE POLICY "Admins can manage notifications" ON public.admin_notifications
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND role = 'admin'
    ));

-- 9. Policies für User-Benachrichtigungen
CREATE POLICY "Users can view own notifications" ON public.user_notifications
    FOR SELECT USING (user_email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
    ));

CREATE POLICY "Admins can manage user notifications" ON public.user_notifications
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND role = 'admin'
    ));

-- 10. Policies für User-Sessions
CREATE POLICY "Users can manage own sessions" ON public.user_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions" ON public.user_sessions
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND role = 'admin'
    ));

-- 11. Indexe für bessere Performance
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON public.user_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON public.user_activities(activity_type);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON public.admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_status ON public.admin_notifications(status);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON public.admin_notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_email ON public.user_notifications(user_email);
CREATE INDEX IF NOT EXISTS idx_user_notifications_type ON public.user_notifications(type);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON public.user_notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON public.user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON public.user_sessions(last_activity);

-- 12. Funktion für Online-Status Update
CREATE OR REPLACE FUNCTION update_user_online_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user_profiles.is_online based on active sessions
    UPDATE public.user_profiles 
    SET 
        is_online = EXISTS (
            SELECT 1 FROM public.user_sessions 
            WHERE user_id = NEW.user_id AND is_active = true
        ),
        last_activity = NOW()
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 13. Trigger für Online-Status
DROP TRIGGER IF EXISTS trigger_update_online_status ON public.user_sessions;
CREATE TRIGGER trigger_update_online_status
    AFTER INSERT OR UPDATE OR DELETE ON public.user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_online_status();

-- 14. Funktion für Login-Aktivität
CREATE OR REPLACE FUNCTION log_user_login()
RETURNS TRIGGER AS $$
BEGIN
    -- Log login activity
    INSERT INTO public.user_activities (user_id, activity_type, description)
    VALUES (NEW.user_id, 'login', 'Benutzer hat sich angemeldet');
    
    -- Update login count and last login
    UPDATE public.user_profiles 
    SET 
        login_count = COALESCE(login_count, 0) + 1,
        last_login = NOW(),
        is_online = true
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 15. Trigger für Login-Logging
DROP TRIGGER IF EXISTS trigger_log_user_login ON public.user_sessions;
CREATE TRIGGER trigger_log_user_login
    AFTER INSERT ON public.user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION log_user_login();

-- 16. Funktion für Logout-Aktivität
CREATE OR REPLACE FUNCTION log_user_logout()
RETURNS TRIGGER AS $$
BEGIN
    -- Log logout activity
    INSERT INTO public.user_activities (user_id, activity_type, description)
    VALUES (OLD.user_id, 'logout', 'Benutzer hat sich abgemeldet');
    
    -- Update online status
    UPDATE public.user_profiles 
    SET is_online = false
    WHERE user_id = OLD.user_id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 17. Trigger für Logout-Logging
DROP TRIGGER IF EXISTS trigger_log_user_logout ON public.user_sessions;
CREATE TRIGGER trigger_log_user_logout
    AFTER DELETE ON public.user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION log_user_logout();

-- 18. Funktion für Admin-Benachrichtigung bei neuer Registrierung
CREATE OR REPLACE FUNCTION notify_admin_new_registration()
RETURNS TRIGGER AS $$
BEGIN
    -- Create admin notification
    INSERT INTO public.admin_notifications (
        type, user_email, user_name, department, phone, registration_date, status
    ) VALUES (
        'new_registration',
        NEW.registration_email,
        NEW.name,
        NEW.department,
        NEW.phone,
        NEW.created_at::text,
        'pending'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 19. Trigger für Admin-Benachrichtigung
DROP TRIGGER IF EXISTS trigger_notify_admin_registration ON public.user_profiles;
CREATE TRIGGER trigger_notify_admin_registration
    AFTER INSERT ON public.user_profiles
    FOR EACH ROW
    WHEN (NEW.status = 'pending')
    EXECUTE FUNCTION notify_admin_new_registration();

-- 20. Funktion für User-Benachrichtigung bei Genehmigung/Ablehnung
CREATE OR REPLACE FUNCTION notify_user_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Create user notification
    INSERT INTO public.user_notifications (
        user_email, user_name, type, status
    ) VALUES (
        COALESCE(NEW.registration_email, NEW.email),
        NEW.name,
        'registration_confirmation',
        NEW.status
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 21. Trigger für User-Benachrichtigung
DROP TRIGGER IF EXISTS trigger_notify_user_status ON public.user_profiles;
CREATE TRIGGER trigger_notify_user_status
    AFTER UPDATE ON public.user_profiles
    FOR EACH ROW
    WHEN (OLD.status != NEW.status AND NEW.status IN ('approved', 'rejected'))
    EXECUTE FUNCTION notify_user_status_change();

-- 22. Cleanup alte Sessions (alle 24 Stunden)
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void AS $$
BEGIN
    -- Deactivate sessions older than 24 hours
    UPDATE public.user_sessions 
    SET is_active = false 
    WHERE last_activity < NOW() - INTERVAL '24 hours';
    
    -- Update online status for users with no active sessions
    UPDATE public.user_profiles 
    SET is_online = false 
    WHERE user_id IN (
        SELECT DISTINCT user_id 
        FROM public.user_sessions 
        WHERE is_active = false
    );
END;
$$ LANGUAGE plpgsql;

-- 23. Test-Daten für Demo (optional)
INSERT INTO public.user_activities (user_id, activity_type, description) 
SELECT 
    up.user_id,
    'login',
    'Demo-Login für ' || up.name
FROM public.user_profiles up 
WHERE up.status = 'approved' 
LIMIT 5;

-- 24. Prüfung der Installation
SELECT 
    'Schema erweitert' as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN is_online THEN 1 END) as online_users,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_users
FROM public.user_profiles; 