import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { Database, CheckCircle, AlertCircle } from "lucide-react";

export default function SetupDemoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);

  const setupDemoData = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/setup-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          count: data.count
        });
      } else {
        setResult({
          success: false,
          message: data.message || 'Fehler beim Setup'
        });
      }
    } catch {
      setResult({
        success: false,
        message: 'Netzwerkfehler beim Setup'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Demo-Daten Setup - Fahndung</title>
        <meta name="description" content="Demo-Daten für Fahndung initialisieren" />
      </Head>

      <Header />

      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Demo-Daten Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Diese Seite erstellt Demo-Fahndungen für die Vercel-Umgebung. 
                  Die Daten werden nur erstellt, wenn sie noch nicht existieren.
                </p>

                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Folgende Demo-Daten werden erstellt:</h3>
                  <ul className="text-sm space-y-1">
                    <li>• Max Mustermann - Vermisst (Stuttgart)</li>
                    <li>• Anna Schmidt - Gesucht (Karlsruhe)</li>
                    <li>• Unbekannte Person - Freiburg</li>
                  </ul>
                </div>

                <Button 
                  onClick={setupDemoData} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Setup läuft...' : 'Demo-Daten erstellen'}
                </Button>

                {result && (
                  <div className={`p-4 rounded-lg border ${
                    result.success 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                      <span className="font-medium">{result.message}</span>
                    </div>
                    {result.count && (
                      <p className="text-sm mt-1">
                        {result.count} Fahndungen verfügbar
                      </p>
                    )}
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  <p>Nach dem Setup können Sie zur <Link href="/" className="text-primary hover:underline">Homepage</Link> gehen, um die Demo-Fahndungen zu sehen.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
} 