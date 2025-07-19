-- Storage Buckets für Medien (nur erstellen, falls nicht vorhanden)
DO $$ BEGIN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('fahndung-straftaeter', 'fahndung-straftaeter', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']);
EXCEPTION
    WHEN unique_violation THEN null;
END $$;

DO $$ BEGIN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('fahndung-vermisste', 'fahndung-vermisste', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']);
EXCEPTION
    WHEN unique_violation THEN null;
END $$;

DO $$ BEGIN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('fahndung-unbekannte-tote', 'fahndung-unbekannte-tote', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']);
EXCEPTION
    WHEN unique_violation THEN null;
END $$;

DO $$ BEGIN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('fahndung-sachen', 'fahndung-sachen', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']);
EXCEPTION
    WHEN unique_violation THEN null;
END $$;

-- Storage-Policies werden automatisch von Supabase verwaltet
-- Keine manuellen Policies nötig für storage.objects 