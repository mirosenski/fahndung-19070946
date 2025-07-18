'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Check, X, Mail, Clock, AlertCircle, Crown, Shield, Settings, Trash2, 
  Activity, Eye, Edit, Search, Filter, MoreHorizontal, Calendar, Phone, Building,
  Globe, Wifi, WifiOff, Users, UserCheck, UserX, TrendingUp, BarChart3
} from 'lucide-react';
import { supabase } from '~/lib/supabase';
import { getCurrentSession, type Session } from '~/lib/auth';
import { sendUserConfirmationEmail } from '~/lib/email-notifications';

interface PendingUser {
  id: string;
  user_id: string;
  email: string;
  registration_email: string;
  name: string;
  role: 'admin' | 'editor' | 'user';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface AllUser {
  id: string;
  user_id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'user';
  status: 'pending' | 'approved' | 'rejected';
  department: string;
  phone: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_online?: boolean;
  login_count?: number;
}

interface UserActivity {
  id: string;
  user_id: string;
  activity_type: 'login' | 'logout' | 'profile_update' | 'investigation_create' | 'investigation_edit';
  description: string;
  created_at: string;
}

interface DashboardStats {
  totalUsers: number;
  pendingUsers: number;
  approvedUsers: number;
  onlineUsers: number;
  recentRegistrations: number;
  activeToday: number;
}

export default function AdminUsersPage() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [allUsers, setAllUsers] = useState<AllUser[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingUsers: 0,
    approvedUsers: 0,
    onlineUsers: 0,
    recentRegistrations: 0,
    activeToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pending' | 'all' | 'activities'>('dashboard');
  const [currentUser, setCurrentUser] = useState<Session | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AllUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    void checkAuthAndLoadUsers();
  }, []);

  const checkAuthAndLoadUsers = async () => {
    try {
      const session = await getCurrentSession();
      if (!session?.profile || session.profile.role !== 'admin') {
        router.push('/login');
        return;
      }

      setCurrentUser(session);
      await loadAllData();
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    }
  };

  const loadAllData = async () => {
    await Promise.all([
      loadPendingUsers(),
      loadAllUsers(),
      loadUserActivities(),
      loadDashboardStats()
    ]);
    setLoading(false);
  };

  const loadPendingUsers = async () => {
    try {
      if (!supabase) return;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading pending users:', error);
        setError('Fehler beim Laden der ausstehenden Benutzer');
      } else {
        setPendingUsers(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Ein unerwarteter Fehler ist aufgetreten');
    }
  };

  const loadAllUsers = async () => {
    try {
      if (!supabase) return;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading all users:', error);
        setError('Fehler beim Laden aller Benutzer');
      } else {
        setAllUsers(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Ein unerwarteter Fehler ist aufgetreten');
    }
  };

  const loadUserActivities = async () => {
    try {
      if (!supabase) return;

      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('Error loading user activities:', error);
        // Aktivitäten sind optional, daher nur Warnung
      } else {
        setUserActivities(data || []);
      }
    } catch (error) {
      console.warn('Error loading activities:', error);
    }
  };

  const loadDashboardStats = async () => {
    try {
      if (!supabase) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Statistiken berechnen
      const stats: DashboardStats = {
        totalUsers: allUsers.length,
        pendingUsers: pendingUsers.length,
        approvedUsers: allUsers.filter(u => u.status === 'approved').length,
        onlineUsers: allUsers.filter(u => u.is_online).length,
        recentRegistrations: allUsers.filter(u => new Date(u.created_at) >= today).length,
        activeToday: userActivities.filter(a => new Date(a.created_at) >= today).length
      };

      setDashboardStats(stats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const approveUser = async (userId: string) => {
    try {
      if (!supabase) return;

      // Benutzer-Daten abrufen für E-Mail
      const { data: userData, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching user data:', fetchError);
        setError('Fehler beim Abrufen der Benutzer-Daten');
        return;
      }

      // Status auf approved setzen
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          status: 'approved',
          role: 'user' // Standard-Rolle
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error approving user:', error);
        setError('Fehler beim Genehmigen des Benutzers');
      } else {
        // E-Mail-Bestätigung an Benutzer senden
        try {
          await sendUserConfirmationEmail(
            userData.registration_email || userData.email,
            userData.name || 'Benutzer',
            true // approved
          );
          console.log('✅ Bestätigungs-E-Mail an Benutzer gesendet');
        } catch (emailError) {
          console.warn('E-Mail-Bestätigung fehlgeschlagen:', emailError);
        }

        await loadAllData();
        setSuccess('✅ Benutzer erfolgreich genehmigt! Bestätigungs-E-Mail gesendet.');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Ein unerwarteter Fehler ist aufgetreten');
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      if (!supabase) return;

      // Benutzer-Daten abrufen für E-Mail
      const { data: userData, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching user data:', fetchError);
        setError('Fehler beim Abrufen der Benutzer-Daten');
        return;
      }

      // Status auf rejected setzen
      const { error } = await supabase
        .from('user_profiles')
        .update({ status: 'rejected' })
        .eq('user_id', userId);

      if (error) {
        console.error('Error rejecting user:', error);
        setError('Fehler beim Ablehnen des Benutzers');
      } else {
        // E-Mail-Bestätigung an Benutzer senden
        try {
          await sendUserConfirmationEmail(
            userData.registration_email ?? userData.email,
            userData.name ?? 'Benutzer',
            false // rejected
          );
          console.log('✅ Ablehnungs-E-Mail an Benutzer gesendet');
        } catch (emailError) {
          console.warn('E-Mail-Bestätigung fehlgeschlagen:', emailError);
        }

        await loadAllData();
        setSuccess('❌ Benutzer abgelehnt! Ablehnungs-E-Mail gesendet.');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Ein unerwarteter Fehler ist aufgetreten');
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'editor' | 'user') => {
    try {
      if (!supabase) return;

      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        setError('Fehler beim Aktualisieren der Benutzer-Rolle');
      } else {
        await loadAllData();
        setSuccess(`✅ Benutzer-Rolle erfolgreich auf '${newRole}' geändert!`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Ein unerwarteter Fehler ist aufgetreten');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Benutzer löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }

    try {
      if (!supabase) return;

      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting user:', error);
        setError('Fehler beim Löschen des Benutzers');
      } else {
        await loadAllData();
        setSuccess('🗑️ Benutzer erfolgreich gelöscht!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Ein unerwarteter Fehler ist aufgetreten');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'editor': return <Shield className="h-4 w-4 text-blue-500" />;
      default: return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-500 bg-green-500/10';
      case 'pending': return 'text-yellow-500 bg-yellow-500/10';
      case 'rejected': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getOnlineStatus = (user: AllUser) => {
    if (user.is_online) {
      return <Wifi className="h-4 w-4 text-green-500" />;
    }
    return <WifiOff className="h-4 w-4 text-gray-400" />;
  };

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesOnline = !showOnlineOnly || user.is_online;

    return matchesSearch && matchesRole && matchesStatus && matchesOnline;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Super-Admin Dashboard</h1>
          <p className="text-gray-400">Verwalten Sie alle Benutzer, Aktivitäten und Systemeinstellungen</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <span className="text-green-400">{success}</span>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white/10 backdrop-blur-sm rounded-lg p-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'dashboard' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'pending' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>Ausstehend ({pendingUsers.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Alle Benutzer ({allUsers.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'activities' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>Aktivitäten</span>
            </button>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Gesamt Benutzer</p>
                    <p className="text-2xl font-bold text-white">{dashboardStats.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-400" />
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Ausstehend</p>
                    <p className="text-2xl font-bold text-yellow-400">{dashboardStats.pendingUsers}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-400" />
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Online</p>
                    <p className="text-2xl font-bold text-green-400">{dashboardStats.onlineUsers}</p>
                  </div>
                  <Wifi className="h-8 w-8 text-green-400" />
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Heute aktiv</p>
                    <p className="text-2xl font-bold text-purple-400">{dashboardStats.activeToday}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-400" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">Letzte Aktivitäten</h3>
              </div>
              <div className="p-6">
                {userActivities.slice(0, 10).map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 py-3 border-b border-white/5 last:border-b-0">
                    <div className="bg-blue-600/20 p-2 rounded-full">
                      <Activity className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{activity.description}</p>
                      <p className="text-gray-400 text-xs">{formatDate(activity.created_at)}</p>
                    </div>
                  </div>
                ))}
                {userActivities.length === 0 && (
                  <p className="text-gray-400 text-center py-4">Keine Aktivitäten verfügbar</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pending Users Tab */}
        {activeTab === 'pending' && (
          <div>
            {pendingUsers.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Keine ausstehenden Registrierungen</h3>
                <p className="text-gray-400">Alle neuen Benutzer wurden bereits bearbeitet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map((user) => (
                  <div key={user.id} className="bg-white/5 border border-white/10 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-600/20 p-3 rounded-full">
                          <User className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <Mail className="h-4 w-4" />
                            <span>{user.registration_email}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Registriert am: {formatDate(user.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => approveUser(user.user_id)}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                          <Check className="h-4 w-4" />
                          <span>Genehmigen</span>
                        </button>
                        <button
                          onClick={() => rejectUser(user.user_id)}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                          <span>Ablehnen</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Users Tab */}
        {activeTab === 'all' && (
          <div>
            {/* Filters */}
            <div className="mb-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Suche</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Name, E-Mail, Abteilung..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rolle</label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="all">Alle Rollen</option>
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="user">User</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="all">Alle Status</option>
                    <option value="approved">Genehmigt</option>
                    <option value="pending">Ausstehend</option>
                    <option value="rejected">Abgelehnt</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <label className="flex items-center space-x-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={showOnlineOnly}
                      onChange={(e) => setShowOnlineOnly(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Nur Online</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Users List */}
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-600/20 p-3 rounded-full">
                        <User className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                          {getOnlineStatus(user)}
                          {getRoleIcon(user.role)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-4 w-4" />
                            <span>{user.email}</span>
                          </div>
                          {user.department && (
                            <div className="flex items-center space-x-1">
                              <Building className="h-4 w-4" />
                              <span>{user.department}</span>
                            </div>
                          )}
                          {user.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-4 w-4" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                          <span>Erstellt: {formatDate(user.created_at)}</span>
                          {user.last_login && (
                            <span>Letzter Login: {formatDate(user.last_login)}</span>
                          )}
                          {user.login_count && (
                            <span>Logins: {user.login_count}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 text-gray-400 hover:text-white transition-colors"
                          title="Details anzeigen"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <div className="relative">
                          <button className="p-2 text-gray-400 hover:text-white transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                          <div className="absolute right-0 top-full mt-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 shadow-lg z-10 min-w-[200px]">
                            <div className="p-2">
                              <button
                                onClick={() => updateUserRole(user.user_id, 'admin')}
                                className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors"
                              >
                                Als Admin setzen
                              </button>
                              <button
                                onClick={() => updateUserRole(user.user_id, 'editor')}
                                className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors"
                              >
                                Als Editor setzen
                              </button>
                              <button
                                onClick={() => updateUserRole(user.user_id, 'user')}
                                className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors"
                              >
                                Als User setzen
                              </button>
                              <hr className="border-white/10 my-1" />
                              <button
                                onClick={() => deleteUser(user.user_id)}
                                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                              >
                                Löschen
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Keine Benutzer gefunden</h3>
                  <p className="text-gray-400">Versuchen Sie andere Filter-Einstellungen.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === 'activities' && (
          <div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">Benutzer-Aktivitäten</h3>
                <p className="text-gray-400 text-sm">Alle System-Aktivitäten der letzten 50 Aktionen</p>
              </div>
              <div className="p-6">
                {userActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 py-4 border-b border-white/5 last:border-b-0">
                    <div className="bg-blue-600/20 p-3 rounded-full">
                      <Activity className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white">{activity.description}</p>
                      <p className="text-gray-400 text-sm">{formatDate(activity.created_at)}</p>
                    </div>
                    <span className="text-xs text-gray-500 bg-white/10 px-2 py-1 rounded">
                      {activity.activity_type}
                    </span>
                  </div>
                ))}
                {userActivities.length === 0 && (
                  <p className="text-gray-400 text-center py-8">Keine Aktivitäten verfügbar</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Benutzer-Details</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Name</label>
                  <p className="text-white">{selectedUser.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300">E-Mail</label>
                  <p className="text-white">{selectedUser.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300">Rolle</label>
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(selectedUser.role)}
                    <span className="text-white capitalize">{selectedUser.role}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300">Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedUser.status)}`}>
                    {selectedUser.status}
                  </span>
                </div>
                
                {selectedUser.department && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Abteilung</label>
                    <p className="text-white">{selectedUser.department}</p>
                  </div>
                )}
                
                {selectedUser.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Telefon</label>
                    <p className="text-white">{selectedUser.phone}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-300">Erstellt am</label>
                  <p className="text-white">{formatDate(selectedUser.created_at)}</p>
                </div>
                
                {selectedUser.last_login && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Letzter Login</label>
                    <p className="text-white">{formatDate(selectedUser.last_login)}</p>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-300">Online Status:</span>
                  {getOnlineStatus(selectedUser)}
                  <span className="text-white">{selectedUser.is_online ? 'Online' : 'Offline'}</span>
                </div>
              </div>
              
              <div className="flex space-x-2 mt-6">
                <button
                  onClick={() => {
                    // Hier können weitere Aktionen hinzugefügt werden
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Bearbeiten
                </button>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Schließen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 