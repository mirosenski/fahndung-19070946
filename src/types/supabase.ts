export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      fahndungen: {
        Row: {
          id: string
          typ: 'straftaeter' | 'vermisste' | 'unbekannte_tote' | 'sachen'
          status: 'entwurf' | 'pruefung' | 'veroeffentlicht' | 'archiviert'
          prioritaet: 'niedrig' | 'normal' | 'hoch' | 'dringend'
          titel: string
          kurzbeschreibung: string | null
          beschreibung: string | null
          ort_name: string | null
          ort_lat: number | null
          ort_lng: number | null
          ort_radius: number | null
          veroeffentlicht_von: string | null
          veroeffentlicht_bis: string | null
          erstellt_von: string | null
          erstellt_am: string
          aktualisiert_am: string
          wizard_data: Json | null
        }
        Insert: {
          id?: string
          typ: 'straftaeter' | 'vermisste' | 'unbekannte_tote' | 'sachen'
          status?: 'entwurf' | 'pruefung' | 'veroeffentlicht' | 'archiviert'
          prioritaet?: 'niedrig' | 'normal' | 'hoch' | 'dringend'
          titel: string
          kurzbeschreibung?: string | null
          beschreibung?: string | null
          ort_name?: string | null
          ort_lat?: number | null
          ort_lng?: number | null
          ort_radius?: number | null
          veroeffentlicht_von?: string | null
          veroeffentlicht_bis?: string | null
          erstellt_von?: string | null
          erstellt_am?: string
          aktualisiert_am?: string
          wizard_data?: Json | null
        }
        Update: {
          id?: string
          typ?: 'straftaeter' | 'vermisste' | 'unbekannte_tote' | 'sachen'
          status?: 'entwurf' | 'pruefung' | 'veroeffentlicht' | 'archiviert'
          prioritaet?: 'niedrig' | 'normal' | 'hoch' | 'dringend'
          titel?: string
          kurzbeschreibung?: string | null
          beschreibung?: string | null
          ort_name?: string | null
          ort_lat?: number | null
          ort_lng?: number | null
          ort_radius?: number | null
          veroeffentlicht_von?: string | null
          veroeffentlicht_bis?: string | null
          erstellt_von?: string | null
          erstellt_am?: string
          aktualisiert_am?: string
          wizard_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fahndungen_erstellt_von_fkey"
            columns: ["erstellt_von"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: {
      fahndung_typ: 'straftaeter' | 'vermisste' | 'unbekannte_tote' | 'sachen'
      fahndung_status: 'entwurf' | 'pruefung' | 'veroeffentlicht' | 'archiviert'
      fahndung_prioritaet: 'niedrig' | 'normal' | 'hoch' | 'dringend'
      benutzer_rolle: 'nutzer' | 'redakteur' | 'admin' | 'superuser'
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          id: string
          name: string
          owner: string | null
          public: boolean | null
          file_size_limit: number | null
          allowed_mime_types: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          owner?: string | null
          public?: boolean | null
          file_size_limit?: number | null
          allowed_mime_types?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner?: string | null
          public?: boolean | null
          file_size_limit?: number | null
          allowed_mime_types?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          id: string
          bucket_id: string | null
          name: string | null
          owner: string | null
          created_at: string | null
          updated_at: string | null
          last_accessed_at: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          bucket_id?: string | null
          name?: string | null
          owner?: string | null
          created_at?: string | null
          updated_at?: string | null
          last_accessed_at?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          bucket_id?: string | null
          name?: string | null
          owner?: string | null
          created_at?: string | null
          updated_at?: string | null
          last_accessed_at?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: Record<never, never>
  }
}
