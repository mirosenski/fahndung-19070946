'use client';


import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, User, LogIn, Plus } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function Home() {
  const router = useRouter();

  const handleDashboard = () => {
    router.push('/dashboard');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleWizard = () => {
    router.push('/admin/wizard');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-primary to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-white">Fahndung</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleDashboard}
                className="flex items-center space-x-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <User className="h-4 w-4" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={handleLogin}
                className="flex items-center space-x-2 rounded-lg bg-secondary px-4 py-2 text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>Anmelden</span>
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>



      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Willkommen beim Fahndungssystem
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Professionelle Fahndungserstellung mit Supabase-Integration
            </p>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={handleWizard}
                className="flex items-center space-x-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Neue Fahndung erstellen</span>
              </button>

            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-6">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 mx-auto text-red-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Fahndungserstellung</h3>
                <p className="text-muted-foreground text-sm">
                  Erstellen Sie professionelle Fahndungen mit unserem intuitiven Wizard-System
                </p>
              </div>
            </div>
            
            <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-6">
              <div className="text-center">
                <User className="h-12 w-12 mx-auto text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Benutzer-Management</h3>
                <p className="text-muted-foreground text-sm">
                  Verwalten Sie Benutzer und Berechtigungen mit Admin-Tools
                </p>
              </div>
            </div>
            
            
          </div>

          {/* System-Status */}
          <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-6">
            <h2 className="text-xl font-semibold text-white mb-4">System-Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-muted-foreground">Wizard: Aktiv</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-muted-foreground">Supabase: Verbunden</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-muted-foreground">Datenbank: Online</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-muted-foreground">Admin: Verfügbar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
