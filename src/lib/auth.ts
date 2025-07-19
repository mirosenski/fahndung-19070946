import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  name?: string;
  role: 'admin' | 'editor' | 'user';
  department?: string;
  phone?: string;
  last_login?: string;
  login_count?: number;
  is_active?: boolean;
  created_by?: string;
  notes?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: 'login' | 'logout' | 'profile_update' | 'investigation_create' | 
                'investigation_edit' | 'investigation_delete' | 'media_upload' |
                'user_block' | 'user_unblock' | 'role_change' | 'password_reset';
  description?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_id: string;
  ip_address?: string;
  user_agent?: string;
  login_at: string;
  logout_at?: string;
  is_active: boolean;
  metadata: Record<string, unknown>;
}

export interface AdminAction {
  id: string;
  admin_id: string;
  action_type: 'user_block' | 'user_unblock' | 'role_change' | 'user_delete' |
               'investigation_approve' | 'investigation_reject' | 'system_settings';
  target_user_id?: string;
  target_investigation_id?: string;
  description?: string;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface Session {
  user: {
    id: string;
    email: string;
  };
  profile: UserProfile | null;
}

// Benutzer-Rollen prüfen
export const hasRole = (profile: UserProfile | null, role: 'admin' | 'editor' | 'user'): boolean => {
  if (!profile) return false;
  
  const roleHierarchy = {
    'user': 1,
    'editor': 2,
    'admin': 3
  };
  
  return roleHierarchy[profile.role] >= roleHierarchy[role];
};

// Admin-Rechte prüfen
export const isAdmin = (profile: UserProfile | null): boolean => {
  return hasRole(profile, 'admin');
};

// Editor-Rechte prüfen
export const isEditor = (profile: UserProfile | null): boolean => {
  return hasRole(profile, 'editor');
};

// Supabase-Session initialisieren
export const initializeSession = async (): Promise<void> => {
  if (!supabase) {
    console.error('❌ Supabase ist nicht konfiguriert');
    return;
  }

  try {
    console.log('🔄 Initialisiere Supabase-Session...');
    
    // Session initialisieren
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Fehler bei Session-Initialisierung:', error);
      
      // Bei Refresh Token Problemen: Session zurücksetzen
      if (error.message.includes('Invalid Refresh Token') || 
          error.message.includes('Refresh Token Not Found')) {
        console.log('🔄 Ungültiger Refresh Token - setze Session zurück...');
        await supabase.auth.signOut();
      }
    } else if (data.session) {
      console.log('✅ Session erfolgreich initialisiert');
    } else {
      console.log('ℹ️ Keine aktive Session gefunden');
    }
  } catch (error) {
    console.error('❌ Fehler bei Session-Initialisierung:', error);
  }
};

// Aktuelle Session abrufen
export const getCurrentSession = async (): Promise<Session | null> => {
  if (!supabase) {
    console.error('❌ Supabase ist nicht konfiguriert');
    return null;
  }

  try {
    console.log('🔍 Prüfe Benutzer-Authentifizierung...');
    
    // Zuerst die aktuelle Session abrufen
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session-Fehler:', sessionError);
      
      // Bei Refresh Token Fehlern: Session zurücksetzen
      if (sessionError.message.includes('Invalid Refresh Token') || 
          sessionError.message.includes('Refresh Token Not Found')) {
        console.log('🔄 Refresh Token ungültig - setze Session zurück...');
        await supabase.auth.signOut();
        return null;
      }
      
      return null;
    }
    
    if (!sessionData.session) {
      console.log('❌ Keine aktive Session gefunden');
      return null;
    }

    const user = sessionData.session.user;
    console.log('✅ Benutzer authentifiziert:', { id: user.id, email: user.email });

    // Benutzer-Profil abrufen
    console.log('🔍 Lade Benutzer-Profil...');
    const profileResult = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    const { data: profile, error: profileError } = profileResult as {
      data: UserProfile | null;
      error: { message: string; code: string } | null;
    };

    if (profileError) {
      console.log('⚠️ Profile Error Details:', {
        code: profileError.code,
        message: profileError.message,
        details: profileError
      });
      
      if (profileError.code === 'PGRST116') {
        // Profil existiert nicht - erstelle es automatisch
        console.log('🔄 Profil existiert nicht, erstelle es automatisch...');
        const autoProfile = await createOrUpdateProfile(
          user.id,
          user.email ?? '',
          {
            name: user.email?.split('@')[0] ?? 'Benutzer',
            role: 'user',
            department: 'Allgemein'
          }
        );
        
        if (autoProfile) {
          console.log('✅ Profil erfolgreich erstellt');
          return {
            user: {
              id: user.id,
              email: user.email ?? ''
            },
            profile: autoProfile
          };
        } else {
          console.error('❌ Fehler beim automatischen Erstellen des Profils');
        }
      } else {
        console.error('❌ Fehler beim Abrufen des Benutzer-Profils:', {
          code: profileError.code,
          message: profileError.message,
          fullError: profileError
        });
      }
    } else if (profile) {
      console.log('✅ Benutzer-Profil gefunden:', { 
        id: profile.id, 
        role: profile.role, 
        name: profile.name 
      });
    }

    const typedProfile = profile;

    return {
      user: {
        id: user.id,
        email: user.email ?? ''
      },
      profile: typedProfile
    };
  } catch (error) {
    console.error('❌ Fehler beim Abrufen der Session:', error);
    return null;
  }
};

// Benutzer-Profil erstellen oder aktualisieren
export const createOrUpdateProfile = async (userId: string, email: string, profileData: Partial<UserProfile>): Promise<UserProfile | null> => {
  if (!supabase) {
    console.error('❌ Supabase ist nicht konfiguriert');
    return null;
  }

  try {
    console.log('🔄 Erstelle/Aktualisiere Benutzer-Profil...', { userId, email });
    
    const upsertData = {
      user_id: userId,
      email,
      status: 'approved', // Automatisch genehmigt für bestehende User
      ...profileData
    };

    console.log('📝 Upsert-Daten:', upsertData);

    const upsertResult = await supabase
      .from('user_profiles')
      .upsert(upsertData)
      .select()
      .single();

    const { data, error } = upsertResult as {
      data: UserProfile | null;
      error: { message: string } | null;
    };

    if (error) {
      console.error('❌ Fehler beim Erstellen/Aktualisieren des Profils:', {
        message: error.message,
        fullError: error
      });
      return null;
    }

    console.log('✅ Profil erfolgreich erstellt/aktualisiert:', data);
    return data;
  } catch (error) {
    console.error('❌ Fehler beim Erstellen/Aktualisieren des Profils:', error);
    return null;
  }
};

// Demo-Benutzer erstellen
export const createDemoUsers = async (): Promise<{ success: boolean; message: string }> => {
  if (!supabase) {
    return { success: false, message: 'Supabase ist nicht konfiguriert' };
  }

  try {
    console.log('🔄 Erstelle Demo-User Profile...');
    
    // Demo-User Profile
    const demoProfiles = [
      { 
        email: 'admin@fahndung.local', 
        role: 'admin',
        name: 'Administrator',
        department: 'IT',
        status: 'approved'
      },
      { 
        email: 'editor@fahndung.local', 
        role: 'editor',
        name: 'Editor',
        department: 'Redaktion',
        status: 'approved'
      },
      { 
        email: 'user@fahndung.local', 
        role: 'user',
        name: 'Benutzer',
        department: 'Allgemein',
        status: 'approved'
      }
    ];

    // Versuche Profile zu erstellen
    try {
      console.log('📝 Versuche Demo-Profile zu erstellen...');
      
      const { data, error: profileError } = await supabase
        .from('user_profiles')
        .upsert(demoProfiles, { 
          onConflict: 'email',
          ignoreDuplicates: false 
        })
        .select();

      if (profileError) {
        console.error('❌ Fehler beim Erstellen der Demo-Profile:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError
        });
        
        if (profileError.code === '42P17') {
          return { 
            success: false, 
            message: `❌ RLS-Policy Endlosschleife erkannt!\n\nBitte führe das SQL-Script 'disable-rls-temp.sql' in Supabase aus, um RLS temporär zu deaktivieren.` 
          };
        }
        
        return { 
          success: false, 
          message: `❌ Fehler beim Erstellen der Demo-Profile: ${profileError.message}\n\nBitte führe das SQL-Script 'disable-rls-temp.sql' in Supabase aus.` 
        };
      }

      console.log('✅ Demo-Profile erfolgreich erstellt:', data);
      return { 
        success: true, 
        message: `✅ Demo-Profile erfolgreich erstellt! Du kannst jetzt mit den Demo-Buttons einloggen.` 
      };
    } catch (error) {
      console.error('❌ Fehler beim Erstellen der Demo-Profile:', error);
      
      if (error instanceof Error && error.message.includes('infinite recursion')) {
        return { 
          success: false, 
          message: `❌ RLS-Policy Endlosschleife erkannt!\n\nBitte führe das SQL-Script 'disable-rls-temp.sql' in Supabase aus, um RLS temporär zu deaktivieren.` 
        };
      }
      
      return { 
        success: false, 
        message: `❌ Fehler beim Erstellen der Demo-Profile: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}\n\nBitte führe das SQL-Script 'disable-rls-temp.sql' in Supabase aus.` 
      };
    }
  } catch (error) {
    console.error('❌ Allgemeiner Fehler beim Erstellen der Demo-User:', error);
    return { 
      success: false, 
      message: `❌ Fehler beim Erstellen der Demo-User: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}\n\nBitte führe das SQL-Script 'disable-rls-temp.sql' in Supabase aus.` 
    };
  }
};

// Benutzer abmelden
export const signOut = async (): Promise<void> => {
  if (!supabase) return;

  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Fehler beim Abmelden:', error);
  }
};

// Middleware für geschützte Routen
export const requireAuth = async (): Promise<Session> => {
  const session = await getCurrentSession();
  
  if (!session) {
    throw new Error('Nicht authentifiziert');
  }
  
  return session;
};

// Middleware für Admin-Routen
export const requireAdmin = async (): Promise<Session> => {
  const session = await requireAuth();
  
  if (!isAdmin(session.profile)) {
    throw new Error('Admin-Rechte erforderlich');
  }
  
  return session;
};

// Middleware für Editor-Routen
export const requireEditor = async (): Promise<Session> => {
  const session = await requireAuth();
  
  if (!isEditor(session.profile)) {
    throw new Error('Editor-Rechte erforderlich');
  }
  
  return session;
};

// Test-Funktion für Supabase-Verbindung
export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  if (!supabase) {
    return { success: false, message: 'Supabase ist nicht konfiguriert' };
  }

  try {
    console.log('🔍 Teste Supabase-Verbindung...');
    
    // Teste Authentifizierung
    const { data: authData, error: authError } = await supabase.auth.getUser();
    console.log('🔐 Auth-Test:', { hasUser: !!authData?.user, error: authError });
    
    // Teste Datenbankverbindung
    const { data: dbData, error: dbError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    console.log('🗄️ DB-Test:', { hasData: !!dbData, error: dbError });
    
    if (authError) {
      return { success: false, message: `Authentifizierungsfehler: ${authError.message}` };
    }
    
    if (dbError) {
      return { success: false, message: `Datenbankfehler: ${dbError.message}` };
    }
    
    return { success: true, message: '✅ Supabase-Verbindung funktioniert' };
  } catch (error) {
    console.error('❌ Supabase-Verbindungstest fehlgeschlagen:', error);
    return { 
      success: false, 
      message: `Verbindungsfehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}` 
    };
  }
};

// Super-Admin Funktionen
export const getAllUsers = async (): Promise<UserProfile[]> => {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Fehler beim Abrufen aller Benutzer:', error);
      return [];
    }

    return (data as UserProfile[]) ?? [];
  } catch (error) {
    console.error('❌ Fehler beim Abrufen aller Benutzer:', error);
    return [];
  }
};

export const getUserActivity = async (userId: string): Promise<UserActivity[]> => {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('❌ Fehler beim Abrufen der Benutzeraktivität:', error);
      return [];
    }

    return (data as UserActivity[]) ?? [];
  } catch (error) {
    console.error('❌ Fehler beim Abrufen der Benutzeraktivität:', error);
    return [];
  }
};

export const getUserSessions = async (userId: string): Promise<UserSession[]> => {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('login_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('❌ Fehler beim Abrufen der Benutzersessions:', error);
      return [];
    }

    return (data as UserSession[]) ?? [];
  } catch (error) {
    console.error('❌ Fehler beim Abrufen der Benutzersessions:', error);
    return [];
  }
};

export const blockUser = async (userId: string, reason?: string): Promise<boolean> => {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_active: false })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Fehler beim Blockieren des Benutzers:', error);
      return false;
    }

    // Log admin action
    await logAdminAction('user_block', userId, reason);
    
    return true;
  } catch (error) {
    console.error('❌ Fehler beim Blockieren des Benutzers:', error);
    return false;
  }
};

export const unblockUser = async (userId: string, reason?: string): Promise<boolean> => {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_active: true })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Fehler beim Entsperren des Benutzers:', error);
      return false;
    }

    // Log admin action
    await logAdminAction('user_unblock', userId, reason);
    
    return true;
  } catch (error) {
    console.error('❌ Fehler beim Entsperren des Benutzers:', error);
    return false;
  }
};

export const changeUserRole = async (userId: string, newRole: 'admin' | 'editor' | 'user', reason?: string): Promise<boolean> => {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ role: newRole })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Fehler beim Ändern der Benutzerrolle:', error);
      return false;
    }

    // Log admin action
    await logAdminAction('role_change', userId, reason, { newRole });
    
    return true;
  } catch (error) {
    console.error('❌ Fehler beim Ändern der Benutzerrolle:', error);
    return false;
  }
};

export const deleteUser = async (userId: string, reason?: string): Promise<boolean> => {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Fehler beim Löschen des Benutzers:', error);
      return false;
    }

    // Log admin action
    await logAdminAction('user_delete', userId, reason);
    
    return true;
  } catch (error) {
    console.error('❌ Fehler beim Löschen des Benutzers:', error);
    return false;
  }
};

export const getAdminActions = async (): Promise<AdminAction[]> => {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('admin_actions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('❌ Fehler beim Abrufen der Admin-Aktionen:', error);
      return [];
    }

    return (data as AdminAction[]) ?? [];
  } catch (error) {
    console.error('❌ Fehler beim Abrufen der Admin-Aktionen:', error);
    return [];
  }
};

// Hilfsfunktionen
const logAdminAction = async (actionType: string, targetUserId?: string, reason?: string, metadata?: Record<string, unknown>) => {
  if (!supabase) return;

  try {
    const currentUser = await getCurrentSession();
    if (!currentUser) return;

    await supabase
      .from('admin_actions')
      .insert({
        admin_id: currentUser.user.id,
        action_type: actionType,
        target_user_id: targetUserId,
        description: reason,
        metadata: metadata ?? {}
      });
  } catch (error) {
    console.error('❌ Fehler beim Loggen der Admin-Aktion:', error);
  }
};

export const logUserActivity = async (activityType: string, description?: string, metadata?: Record<string, unknown>) => {
  if (!supabase) return;

  try {
    const currentUser = await getCurrentSession();
    if (!currentUser) return;

    await supabase
      .from('user_activity')
      .insert({
        user_id: currentUser.user.id,
        activity_type: activityType,
        description,
        metadata: metadata ?? {}
      });
  } catch (error) {
    console.error('❌ Fehler beim Loggen der Benutzeraktivität:', error);
  }
}; 