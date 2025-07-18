import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { User, Lock, ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Header } from "~/components/layout/Header";
import { createDemoSession, setDemoSession } from "~/utils/session";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Demo-Login mit festen Zugangsdaten
    if (formData.email === "admin@fahndung.de" && formData.password === "admin123") {
      // Erstelle Demo-Session
      const session = createDemoSession();
      setDemoSession(session);
      
      // Simuliere erfolgreiche Anmeldung
      setTimeout(() => {
        router.push("/admin");
      }, 1000);
    } else {
      setError("Ungültige Zugangsdaten. Bitte verwenden Sie die Demo-Zugangsdaten.");
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData({
      email: "admin@fahndung.de",
      password: "admin123",
    });
  };

  return (
    <>
      <Head>
        <title>Login - Fahndung</title>
        <meta name="description" content="Anmeldung für das Fahndungssystem" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <div className="min-h-screen bg-background flex items-center justify-center py-8">
        <div className="max-w-md w-full mx-4">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Image
                  src="/logo.svg"
                  alt="Fahndung Logo"
                  width={48}
                  height={48}
                  className="w-12 h-12"
                />
              </div>
              <CardTitle className="text-2xl">Anmeldung</CardTitle>
              <p className="text-muted-foreground mt-2">
                Melden Sie sich an, um das Dashboard zu nutzen
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="ihre@email.de"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Passwort</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <ArrowRight className="w-4 h-4 mr-2" />
                  )}
                  Anmelden
                </Button>
              </form>

                              <div className="mt-6 p-4 bg-accent rounded-md">
                  <h3 className="font-semibold text-accent-foreground mb-2">Demo-Zugangsdaten:</h3>
                  <div className="space-y-1 text-sm text-accent-foreground">
                  <p><strong>E-Mail:</strong> admin@fahndung.de</p>
                  <p><strong>Passwort:</strong> admin123</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDemoLogin}
                  className="mt-3 w-full"
                >
                  Demo-Zugangsdaten verwenden
                </Button>
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Dies ist eine Demo-Version. In der Produktion würden hier echte Authentifizierung und Sicherheitsmaßnahmen implementiert.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
} 