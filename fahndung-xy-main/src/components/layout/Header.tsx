"use client";

import Link from "next/link";
import { LogOut, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Logo } from "~/components/ui/Logo";
import { getDemoSession, clearDemoSession } from "~/utils/session";

export function Header() {
  const [session, setSession] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const demoSession = getDemoSession();
    if (demoSession && demoSession.user) {
      setSession({
        id: demoSession.user.id,
        name: demoSession.user.name,
        email: demoSession.user.email,
        role: demoSession.user.role
      });
    }
  }, []);

  const handleLogout = () => {
    clearDemoSession();
    setSession(null);
    window.location.href = "/";
  };

  if (!isClient) {
    return (
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Logo />
            </div>
            <nav className="hidden sm:flex items-center space-x-4 lg:space-x-6">
              <Link href="/login" className="text-xs sm:text-sm font-medium text-primary">
                Dashboard
              </Link>
              <Link href="/login" className="text-xs sm:text-sm font-medium hover:text-primary">
                Fahndung erstellen
              </Link>
            </nav>
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="sm:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="sm:hidden mt-4 space-y-2 border-t pt-4">
              <Link 
                href="/login" 
                className="block text-xs sm:text-sm font-medium text-primary py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="/login" 
                className="block text-xs sm:text-sm font-medium hover:text-primary py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Fahndung erstellen
              </Link>
            </nav>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Logo />
          </div>
          <nav className="hidden sm:flex items-center space-x-4 lg:space-x-6">
            <Link 
              href={session ? "/admin" : "/login"} 
              className="text-xs sm:text-sm font-medium text-primary"
            >
              Dashboard
            </Link>
            <Link 
              href={session ? "/wizard" : "/login"} 
              className="text-xs sm:text-sm font-medium hover:text-primary"
            >
              Fahndung erstellen
            </Link>
            {session && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground text-xs sm:text-sm"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden xs:inline">Abmelden</span>
                <span className="xs:hidden">Logout</span>
              </Button>
            )}
          </nav>
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="sm:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="sm:hidden mt-4 space-y-2 border-t pt-4">
            <Link 
              href={session ? "/admin" : "/login"} 
              className="block text-xs sm:text-sm font-medium text-primary py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              href={session ? "/wizard" : "/login"} 
              className="block text-xs sm:text-sm font-medium hover:text-primary py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Fahndung erstellen
            </Link>
            {session && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full justify-start text-muted-foreground hover:text-foreground py-2 text-xs sm:text-sm"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                <span className="hidden xs:inline">Abmelden</span>
                <span className="xs:hidden">Logout</span>
              </Button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
} 