import Head from "next/head";
import Link from "next/link";
import { Search, FileText, AlertTriangle, User, Calendar, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import FahndungCard from "~/components/FahndungCard";
import { api } from "~/utils/api";
import { useRealtimeInvestigations } from "~/hooks/useRealtimeInvestigations";

function getCategoryLabel(category: string): string {
  switch (category) {
    case 'WANTED_PERSON': return 'Straftäter';
    case 'MISSING_PERSON': return 'Vermisste Person';
    case 'UNKNOWN_DEAD': return 'Unbekannte Tote';
    case 'STOLEN_GOODS': return 'Gesuchte Sachen';
    default: return 'Unbekannt';
  }
}

function InvestigationFlipCard({ investigation }: { investigation: {
  id: string;
  title: string;
  caseNumber: string;
  category: string;
  priority: string;
  location: string;
  date: string;
  status: string;
  shortDescription?: string;
  description: string;
  features?: string;
  station: string;
  mainImage?: string;
} }) {
  // Konvertiere die Daten für FahndungCard
  const badges = [
    {
      text: getCategoryLabel(investigation.category),
      type: (investigation.category === 'MISSING_PERSON' ? 'vermisst' : 
            investigation.category === 'WANTED_PERSON' ? 'gesucht' : 
            investigation.priority === 'URGENT' ? 'eilfahndung' : 'unbekannt') as 'vermisst' | 'eilfahndung' | 'gesucht' | 'unbekannt'
    }
  ];

  const details = {
    features: investigation.features,
    contact: investigation.station
  };

  return (
    <FahndungCard
      id={investigation.id}
      name={investigation.title}
      location={investigation.location}
      date={new Date(investigation.date).toLocaleDateString("de-DE")}
      image={investigation.mainImage || 'https://via.placeholder.com/289x231/cccccc/666666?text=Kein+Bild'}
      badges={badges}
      details={details}
    />
  );
}

export default function HomePage() {
  // Real-time Updates aktivieren (optional)
  try {
    useRealtimeInvestigations()
  } catch (error) {
    console.log('⚠️ Real-time Updates nicht verfügbar:', error)
  }

  // NEU: Echte Daten aus der Datenbank
  const { data: investigationsData, isLoading: isLoadingInvestigations } = api.investigation.getAll.useQuery({
    search: '',
    limit: 100,
    offset: 0
  });
  
  const { data: stats = { total: 0, published: 0, draft: 0, urgent: 0, thisMonth: 0 } } = api.investigation.getStats.useQuery();

  // Extract investigations array from the response and filter only published ones
  const investigations = Array.isArray(investigationsData) ? investigationsData : (investigationsData?.investigations || []);
  const publishedInvestigations = investigations.filter((investigation: {
    status: string;
  }) => investigation.status === "PUBLISHED");

  return (
    <>
      <Head>
        <title>Fahndung - Öffentliche Fahndungen</title>
        <meta name="description" content="Öffentliche Fahndungen und Vermisstenmeldungen" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-card border-b">
          <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 lg:py-16">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-foreground">
                Öffentliche Fahndungen
              </h1>
              <p className="text-sm sm:text-base lg:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
                Hier finden Sie aktuelle Fahndungen und Vermisstenmeldungen der Polizei Baden-Württemberg.
                Helfen Sie mit, Personen zu finden oder wichtige Informationen zu liefern.
              </p>
              
              {/* Suchleiste */}
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Fahndungen durchsuchen..."
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistiken */}
        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Aktive Fahndungen</CardTitle>
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">{stats.published}</div>
                  <p className="text-xs text-muted-foreground">Veröffentlicht</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Eilfahndungen</CardTitle>
                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">{stats.urgent}</div>
                  <p className="text-xs text-muted-foreground">Dringend</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Erfolgreich gelöst</CardTitle>
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">Dieses Jahr</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Letzte Aktualisierung</CardTitle>
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">Heute</div>
                  <p className="text-xs text-muted-foreground">14:30 Uhr</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Aktuelle Fahndungen */}
        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-2 sm:gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Aktuelle Fahndungen</h2>
              <Link href="/investigations" className="text-primary hover:underline text-xs sm:text-sm">
                Alle anzeigen →
              </Link>
            </div>

            {isLoadingInvestigations ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Lade Fahndungen...</p>
              </div>
            ) : publishedInvestigations.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Keine aktiven Fahndungen</h3>
                <p className="text-muted-foreground">
                  Derzeit sind keine öffentlichen Fahndungen verfügbar.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {publishedInvestigations.slice(0, 6).map((investigation: {
                  id: string;
                  title: string;
                  caseNumber: string;
                  category: string;
                  priority: string;
                  location: string;
                  date: string;
                  status: string;
                  shortDescription?: string;
                  description: string;
                  features?: string;
                  station: string;
                }) => (
                  <InvestigationFlipCard key={investigation.id} investigation={investigation} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-8 sm:py-12 bg-muted/30">
          <div className="container mx-auto px-3 sm:px-4 text-center">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Haben Sie Informationen?</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-2xl mx-auto">
              Wenn Sie Informationen zu einer der Fahndungen haben, kontaktieren Sie bitte die zuständige Polizeidienststelle.
              Ihre Hinweise können entscheidend sein.
            </p>
            <Button size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Fahndung melden
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
