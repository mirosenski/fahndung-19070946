import { NextPage } from "next";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { ThemeToggle } from "~/components/ui/theme-toggle";
import { ThemeToggleSimple } from "~/components/ui/theme-toggle-simple";
import { ThemeToggleNative } from "~/components/ui/theme-toggle-native";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

const ThemeTestPage: NextPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">Theme Toggle Test</h1>
            <p className="text-muted-foreground">Teste die verschiedenen ThemeToggle-Varianten</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dropdown ThemeToggle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Dropdown-Menü mit Light/Dark/System Optionen
                </p>
                <div className="flex items-center space-x-4">
                  <ThemeToggle />
                  <span className="text-sm">Dropdown-Version</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Simple ThemeToggle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Einfacher Button mit Cycle-Funktion
                </p>
                <div className="flex items-center space-x-4">
                  <ThemeToggleSimple />
                  <span className="text-sm">Simple-Version</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Native ThemeToggle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Native HTML Dropdown ohne Radix UI
                </p>
                <div className="flex items-center space-x-4">
                  <ThemeToggleNative />
                  <span className="text-sm">Native-Version</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Theme Test Komponenten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button>Default Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>

              <div className="p-4 bg-card border rounded-lg">
                <p className="text-card-foreground">
                  Dies ist ein Test-Text um zu sehen, wie die Farben in verschiedenen Themes aussehen.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ThemeTestPage; 