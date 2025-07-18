'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AlertTriangle, 
  User, 
  Settings, 
  LogOut, 
  Plus, 
  Search, 
  Eye,
  Edit,
  Trash2,
  Upload,
  BarChart3,
  FileText,
  Users,
  Image as ImageIcon,
  Globe,
  Shield
} from 'lucide-react';
import { api } from '~/trpc/react';
import { getCurrentSession, signOut, isAdmin, isEditor } from '~/lib/auth';

interface Investigation {
  id: string;
  title: string;
  case_number: string;
  description: string;
  short_description: string;
  status: string;
  priority: string;
  category: string;
  location: string;
  station: string;
  features: string;
  date: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_to: string;
  tags: string[];
  metadata: Record<string, unknown>;
}

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  name?: string;
  role: 'admin' | 'editor' | 'user';
  department?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

interface Session {
  user: {
  id: string;
    email: string;
  };
  profile: UserProfile | null;
}

export default function Dashboard() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  // tRPC Queries
  const { data: investigationsData } = api.post.getInvestigations.useQuery({
    limit: 100,
    offset: 0
  });

  // Session-Management
  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentSession = await getCurrentSession();
        if (!currentSession) {
          router.push('/login');
          return;
        }
        setSession(currentSession as Session);
      } catch (error) {
        console.error('Session-Fehler:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    void checkSession();
  }, [router]);

  // Filtered investigations
  const investigations = (investigationsData as Investigation[]) || [];
  const filteredInvestigations = investigations.filter((investigation) => {
    const matchesSearch = investigation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investigation.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investigation.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || investigation.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || investigation.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || investigation.priority === selectedPriority;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  // Statistics
  const stats = {
    total: investigations.length,
    published: investigations.filter(i => i.status === 'published').length,
    draft: investigations.filter(i => i.status === 'draft').length,
    urgent: investigations.filter(i => i.priority === 'urgent').length,
    thisMonth: investigations.filter(i => {
      const date = new Date(i.created_at);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const handleCreateInvestigation = () => {
    router.push('/wizard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Lade Dashboard...</p>
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
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-white">Fahndung Dashboard</h1>
            </div>
        
                          <div className="flex items-center space-x-4">
                {/* User Info */}
                <div className="flex items-center space-x-2 text-white">
                  <User className="h-5 w-5" />
                  <span className="text-sm">{session.user.email}</span>
                  {session.profile && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      session.profile.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                      session.profile.role === 'editor' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {session.profile.role}
                    </span>
                  )}
                </div>
                
                {/* Admin Link */}
                {isAdmin(session.profile) && (
                  <button
                    onClick={() => router.push('/admin')}
                    className="flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </button>
                )}
            
              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {isEditor(session.profile) && (
                  <button
                    onClick={handleCreateInvestigation}
                    className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Neue Fahndung</span>
                  </button>
                )}
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Abmelden</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-white/10">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Übersicht', icon: BarChart3 },
                { id: 'investigations', label: 'Fahndungen', icon: FileText },
                { id: 'media', label: 'Medien', icon: ImageIcon },
                { id: 'users', label: 'Benutzer', icon: Users },
                { id: 'settings', label: 'Einstellungen', icon: Settings }
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
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-400">Gesamt Fahndungen</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center space-x-3">
                  <Globe className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-400">Veröffentlicht</p>
                    <p className="text-2xl font-bold text-white">{stats.published}</p>
                  </div>
                </div>
          </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-400">Entwürfe</p>
                    <p className="text-2xl font-bold text-white">{stats.draft}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-400">Dringend</p>
                    <p className="text-2xl font-bold text-white">{stats.urgent}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Investigations */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Neueste Fahndungen</h2>
              <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                <div className="p-6">
                  {filteredInvestigations.slice(0, 5).map((investigation) => (
                    <div key={investigation.id} className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0">
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{investigation.title}</h3>
                        <p className="text-sm text-gray-400">{investigation.case_number}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          investigation.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                          investigation.priority === 'high' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {investigation.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          investigation.status === 'published' ? 'bg-green-500/20 text-green-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {investigation.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'investigations' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Suche</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Fahndungen durchsuchen..."
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Kategorie</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full py-2 px-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="all">Alle Kategorien</option>
                    <option value="vermisst">Vermisst</option>
                    <option value="gesucht">Gesucht</option>
                    <option value="warnung">Warnung</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full py-2 px-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="all">Alle Status</option>
                    <option value="published">Veröffentlicht</option>
                    <option value="draft">Entwurf</option>
                    <option value="archived">Archiviert</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Priorität</label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full py-2 px-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="all">Alle Prioritäten</option>
                    <option value="urgent">Dringend</option>
                    <option value="high">Hoch</option>
                    <option value="medium">Mittel</option>
                    <option value="low">Niedrig</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Investigations List */}
            <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Fahndungen ({filteredInvestigations.length})</h2>
                  {isEditor(session.profile) && (
                    <button
                      onClick={handleCreateInvestigation}
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Neue Fahndung</span>
                    </button>
                  )}
                </div>
                
                {filteredInvestigations.length > 0 ? (
                  <div className="space-y-4">
                    {filteredInvestigations.map((investigation) => (
                      <div key={investigation.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{investigation.title}</h3>
                          <p className="text-sm text-gray-400">{investigation.case_number}</p>
                          <p className="text-sm text-gray-400">{investigation.location}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            investigation.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                            investigation.priority === 'high' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {investigation.priority}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            investigation.status === 'published' ? 'bg-green-500/20 text-green-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {investigation.status}
                          </span>
                          <div className="flex items-center space-x-1">
                            <button className="p-1 text-gray-400 hover:text-white transition-colors">
                              <Eye className="h-4 w-4" />
                            </button>
                            {isEditor(session.profile) && (
                              <>
                                <button className="p-1 text-gray-400 hover:text-white transition-colors">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button className="p-1 text-red-400 hover:text-red-300 transition-colors">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                ))}
              </div>
            ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-400 mb-2">Keine Fahndungen gefunden</h3>
                    <p className="text-gray-500">Erstellen Sie Ihre erste Fahndung, um zu beginnen.</p>
                  </div>
            )}
          </div>
        </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Medienverwaltung</h2>
                <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <Upload className="h-4 w-4" />
                  <span>Upload</span>
                </button>
              </div>
              <p className="text-gray-400">Medienverwaltung wird implementiert...</p>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Benutzerverwaltung</h2>
                {isAdmin(session.profile) && (
                  <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                    <Plus className="h-4 w-4" />
                    <span>Benutzer hinzufügen</span>
                  </button>
                )}
              </div>
              <p className="text-gray-400">Benutzerverwaltung wird implementiert...</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4">Einstellungen</h2>
              <p className="text-gray-400">Einstellungen werden implementiert...</p>
          </div>
        </div>
        )}
      </div>
    </div>
  );
} 