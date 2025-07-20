'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Shield, Activity, Clock, Eye, EyeOff, Edit, Trash2, 
  UserCheck, UserX, Crown, Settings, BarChart3, AlertTriangle,
  Search, Filter, MoreHorizontal, Calendar, MapPin, Mail
} from 'lucide-react';
import { 
  getCurrentSession, getAllUsers, getUserActivity, getUserSessions,
  blockUser, unblockUser, changeUserRole, deleteUser, getAdminActions,
  logUserActivity, UserProfile, UserActivity, UserSession, AdminAction,
  isAdmin
} from '../../lib/auth';

export default function AdminDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('users');

  // Session-Management
  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentSession = await getCurrentSession();
        if (!currentSession) {
          router.push('/login');
          return;
        }
        
        if (!isAdmin(currentSession.profile)) {
          router.push('/dashboard');
          return;
        }
        
        setSession(currentSession);
        await loadData();
      } catch (error) {
        console.error('Session-Fehler:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    void checkSession();
  }, [router]);

  const loadData = async () => {
    try {
      const [usersData, actionsData] = await Promise.all([
        getAllUsers(),
        getAdminActions()
      ]);
      
      setUsers(usersData);
      setAdminActions(actionsData);
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
    }
  };

  const handleUserAction = async (action: string, userId: string, reason?: string) => {
    try {
      let success = false;
      
      switch (action) {
        case 'block':
          success = await blockUser(userId, reason);
          break;
        case 'unblock':
          success = await unblockUser(userId, reason);
          break;
        case 'delete':
          if (confirm('Benutzer wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
            success = await deleteUser(userId, reason);
          }
          break;
      }
      
      if (success) {
        await loadData();
        await logUserActivity('admin_action', `${action} für Benutzer ${userId}`);
      }
    } catch (error) {
      console.error('Fehler bei Benutzeraktion:', error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'editor' | 'user') => {
    try {
      const success = await changeUserRole(userId, newRole, `Rolle geändert zu ${newRole}`);
      if (success) {
        await loadData();
        await logUserActivity('admin_action', `Rolle für Benutzer ${userId} zu ${newRole} geändert`);
      }
    } catch (error) {
      console.error('Fehler beim Ändern der Rolle:', error);
    }
  };

  const loadUserDetails = async (user: UserProfile) => {
    setSelectedUser(user);
    try {
      const [activity, sessions] = await Promise.all([
        getUserActivity(user.user_id),
        getUserSessions(user.user_id)
      ]);
      setUserActivity(activity);
    } catch (error) {
      console.error('Fehler beim Laden der Benutzerdetails:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const emailMatch =
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    const nameMatch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    const matchesSearch = [emailMatch, nameMatch].some(Boolean);
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && user.is_active) ||
      (filterStatus === 'blocked' && !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    blocked: users.filter(u => !u.is_active).length,
    admins: users.filter(u => u.role === 'admin').length,
    editors: users.filter(u => u.role === 'editor').length,
    users: users.filter(u => u.role === 'user').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Lade Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-white">Super Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                <Crown className="h-5 w-5 text-yellow-500" />
                <span className="text-sm">{session.user.email}</span>
              </div>
              
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-400">Gesamt Benutzer</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="flex items-center space-x-3">
              <UserCheck className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-400">Aktiv</p>
                <p className="text-2xl font-bold text-white">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="flex items-center space-x-3">
              <UserX className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-gray-400">Gesperrt</p>
                <p className="text-2xl font-bold text-white">{stats.blocked}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="flex items-center space-x-3">
              <Crown className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-400">Admins</p>
                <p className="text-2xl font-bold text-white">{stats.admins}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="flex items-center space-x-3">
              <Edit className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-400">Editoren</p>
                <p className="text-2xl font-bold text-white">{stats.editors}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-gray-500" />
              <div>
                <p className="text-sm text-gray-400">Benutzer</p>
                <p className="text-2xl font-bold text-white">{stats.users}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-white/10">
            <nav className="flex space-x-8">
              {[
                { id: 'users', label: 'Benutzer', icon: Users },
                { id: 'activity', label: 'Aktivität', icon: Activity },
                { id: 'actions', label: 'Admin Aktionen', icon: Shield }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Benutzer suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Alle Rollen</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="user">Benutzer</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Alle Status</option>
                <option value="active">Aktiv</option>
                <option value="blocked">Gesperrt</option>
              </select>
            </div>

            {/* Users Table */}
            <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Benutzer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Rolle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Letzter Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-white/5">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                <span className="text-white font-medium">
                                  {user.name?.charAt(0) ?? user.email.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">
                                {user.name ?? 'Unbekannt'}
                              </div>
                              <div className="text-sm text-gray-400">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                            user.role === 'editor' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                            user.is_active 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {user.is_active ? (
                              <>
                                <UserCheck className="h-3 w-3 mr-1" />
                                Aktiv
                              </>
                            ) : (
                              <>
                                <UserX className="h-3 w-3 mr-1" />
                                Gesperrt
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {user.last_login ? (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {new Date(user.last_login).toLocaleDateString('de-DE')}
                            </div>
                          ) : (
                            'Nie'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => loadUserDetails(user)}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            
                            {user.is_active ? (
                              <button
                                onClick={() => handleUserAction('block', user.user_id, 'Admin-Sperrung')}
                                className="text-red-400 hover:text-red-300"
                                title="Benutzer sperren"
                              >
                                <UserX className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUserAction('unblock', user.user_id, 'Admin-Entsperrung')}
                                className="text-green-400 hover:text-green-300"
                                title="Benutzer entsperren"
                              >
                                <UserCheck className="h-4 w-4" />
                              </button>
                            )}
                            
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.user_id, e.target.value as 'admin' | 'editor' | 'user')}
                              className="bg-transparent text-xs border border-white/20 rounded px-1 py-1 text-white"
                            >
                              <option value="user">User</option>
                              <option value="editor">Editor</option>
                              <option value="admin">Admin</option>
                            </select>
                            
                            <button
                              onClick={() => handleUserAction('delete', user.user_id, 'Admin-Löschung')}
                              className="text-red-600 hover:text-red-500"
                              title="Benutzer löschen"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && selectedUser && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">
                Aktivität für {selectedUser.name ?? selectedUser.email}
              </h3>
              
              <div className="space-y-4">
                {userActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                    <Activity className="h-5 w-5 text-blue-500" />
                    <div className="flex-1">
                      <div className="text-sm text-white">{activity.description ?? activity.activity_type}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(activity.created_at).toLocaleString('de-DE')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Admin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Aktion
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Ziel
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Beschreibung
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Datum
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {adminActions.map((action) => (
                      <tr key={action.id} className="hover:bg-white/5">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {action.admin_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            action.action_type.includes('block') ? 'bg-red-500/20 text-red-400' :
                            action.action_type.includes('unblock') ? 'bg-green-500/20 text-green-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {action.action_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {action.target_user_id ?? action.target_investigation_id ?? '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {action.description ?? '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(action.created_at).toLocaleString('de-DE')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 