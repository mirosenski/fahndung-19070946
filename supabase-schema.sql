-- Supabase Schema für Fahndung-System
-- Führe diese SQL-Befehle in der Supabase SQL Editor aus

-- Enable RLS (Row Level Security)
ALTER TABLE IF EXISTS public.investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.investigation_images ENABLE ROW LEVEL SECURITY;

-- Create investigations table
CREATE TABLE IF NOT EXISTS public.investigations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    priority VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    assigned_to UUID,
    tags TEXT[] DEFAULT '{}',
    location VARCHAR(255),
    contact_info JSONB,
    metadata JSONB DEFAULT '{}'
);

-- Create investigation_images table
CREATE TABLE IF NOT EXISTS public.investigation_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    investigation_id UUID REFERENCES public.investigations(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    width INTEGER,
    height INTEGER,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by UUID,
    tags TEXT[] DEFAULT '{}',
    description TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_investigations_status ON public.investigations(status);
CREATE INDEX IF NOT EXISTS idx_investigations_created_at ON public.investigations(created_at);
CREATE INDEX IF NOT EXISTS idx_investigations_tags ON public.investigations USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_investigation_images_investigation_id ON public.investigation_images(investigation_id);
CREATE INDEX IF NOT EXISTS idx_investigation_images_tags ON public.investigation_images USING GIN(tags);

-- Create RLS policies
-- Investigations: Allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON public.investigations
    FOR ALL USING (auth.role() = 'authenticated');

-- Investigation images: Allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON public.investigation_images
    FOR ALL USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_investigations_updated_at 
    BEFORE UPDATE ON public.investigations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO public.investigations (title, description, status, priority, tags) VALUES
('Vermisste Person - Max Mustermann', 'Max Mustermann wurde zuletzt am 15.03.2024 gesehen. Er trug eine blaue Jacke und schwarze Jeans.', 'active', 'high', ARRAY['vermisst', 'person']),
('Diebstahl in der Innenstadt', 'Mehrere Diebstähle in der Fußgängerzone gemeldet. Verdächtige Person mit Kapuze beobachtet.', 'active', 'medium', ARRAY['diebstahl', 'innenstadt']),
('Unfallflucht auf der A1', 'Unfallflucht am 20.03.2024 auf der A1, Kilometer 45. Fahrzeug mit beschädigter Stoßstange.', 'active', 'high', ARRAY['unfallflucht', 'autobahn']);

-- Insert sample images
INSERT INTO public.investigation_images (investigation_id, file_name, file_path, file_size, mime_type, width, height, tags, description) VALUES
((SELECT id FROM public.investigations WHERE title = 'Vermisste Person - Max Mustermann' LIMIT 1), 'max_mustermann.jpg', '/uploads/max_mustermann.jpg', 1024000, 'image/jpeg', 1920, 1080, ARRAY['person', 'portrait'], 'Letztes Foto von Max Mustermann'),
((SELECT id FROM public.investigations WHERE title = 'Diebstahl in der Innenstadt' LIMIT 1), 'verdaechtige_person.jpg', '/uploads/verdaechtige_person.jpg', 2048000, 'image/jpeg', 1920, 1080, ARRAY['verdaechtig', 'kapuze'], 'Verdächtige Person mit Kapuze'); 