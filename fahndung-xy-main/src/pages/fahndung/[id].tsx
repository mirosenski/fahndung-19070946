import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { 
  ArrowLeft, 
  Edit, 
  Globe, 
  MapPin, 
  Phone, 
  Mail, 
  FileText
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { InvestigationEditForm } from "~/components/InvestigationEditForm";
import { api } from "~/utils/api";
import Image from "next/image";

function getCategoryLabel(category: string): string {
  switch (category) {
    case "WANTED_PERSON": return "Straftäter";
    case "MISSING_PERSON": return "Vermisste Person";
    case "UNKNOWN_DEAD": return "Unbekannte Tote";
    case "STOLEN_GOODS": return "Gesuchte Sachen";
    default: return category;
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "URGENT":
      return <Badge variant="destructive">EILFAHNDUNG</Badge>;
    case "NEW":
      return <Badge variant="default">NEU</Badge>;
    default:
      return <Badge variant="secondary">NORMAL</Badge>;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "PUBLISHED":
      return <Badge variant="default">Veröffentlicht</Badge>;
    case "DRAFT":
      return <Badge variant="secondary">Entwurf</Badge>;
    case "ARCHIVED":
      return <Badge variant="outline">Archiviert</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function InvestigationDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [showEditForm, setShowEditForm] = useState(false);

  // Lade echte Daten aus der Datenbank
  const { data: investigation, isLoading, error } = api.investigation.getById.useQuery(
    { id: id as string },
    { enabled: !!id }
  );

  // tRPC Mutations
  const publishInvestigationMutation = api.investigation.publish.useMutation();

  const handlePublish = async () => {
    if (!investigation) return;
    
    try {
      await publishInvestigationMutation.mutateAsync({ id: investigation.id });
      alert('Fahndung erfolgreich veröffentlicht!');
      router.reload();
    } catch (error) {
      console.error('Fehler beim Veröffentlichen:', error);
      alert('Fehler beim Veröffentlichen der Fahndung.');
    }
  };

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
  };

  const handleSaveEdit = () => {
    setShowEditForm(false);
    router.reload();
  };

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Lade Fahndung...</title>
        </Head>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Lade Fahndung...</p>
          </div>
        </main>
      </>
    );
  }

  if (error || !investigation) {
    return (
      <>
        <Head>
          <title>Fahndung nicht gefunden</title>
        </Head>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Fahndung nicht gefunden</h1>
            <p className="text-muted-foreground mb-4">
              Die angeforderte Fahndung konnte nicht gefunden werden.
            </p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{investigation.title} - Fahndung</title>
        <meta name="description" content={`Fahndung: ${investigation.title}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 mb-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Startseite
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium">Fahndung {investigation.caseNumber}</span>
          </div>

          {/* Header mit Aktionen */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{investigation.title}</h1>
                <p className="text-muted-foreground mt-1">{investigation.shortDescription}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Bearbeiten
              </Button>
              {investigation.status === "DRAFT" && (
                <Button onClick={handlePublish}>
                  <Globe className="w-4 h-4 mr-2" />
                  Veröffentlichen
                </Button>
              )}
            </div>
          </div>

          {/* Status und Badges */}
          <div className="flex items-center space-x-4 mb-6">
            {getPriorityBadge(investigation.priority)}
            {getStatusBadge(investigation.status)}
            <Badge variant="outline">
              {getCategoryLabel(investigation.category)}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hauptinhalt */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hauptbild */}
              {investigation.mainImage && (
                <Card>
                  <CardContent className="p-0">
                    <div className="relative h-64 lg:h-96">
                      <Image
                        src={investigation.mainImage}
                        alt={investigation.title}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Beschreibung */}
              <Card>
                <CardHeader>
                  <CardTitle>Beschreibung</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {investigation.description}
                  </p>
                </CardContent>
              </Card>

              {/* Tathergang/Umstände */}
              {investigation.context && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tathergang/Umstände</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {investigation.context}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Besondere Merkmale */}
              {investigation.features && (
                <Card>
                  <CardHeader>
                    <CardTitle>Besondere Merkmale</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {investigation.features}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Frage an die Öffentlichkeit */}
              {investigation.question && (
                <Card>
                  <CardHeader>
                    <CardTitle>Frage an die Öffentlichkeit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium text-primary">
                      {investigation.question}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Weitere Bilder */}
              {investigation.images && investigation.images.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Weitere Bilder</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {investigation.images.map((image, index) => (
                        <div key={image.id} className="relative aspect-square">
                          <Image
                            src={image.url}
                            alt={image.altText || `Bild ${index + 1}`}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Kontaktinformationen */}
              <Card>
                <CardHeader>
                  <CardTitle>Kontaktinformationen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{investigation.location}</p>
                      <p className="text-xs text-muted-foreground">{investigation.station}</p>
                    </div>
                  </div>
                  
                  {investigation.contact && (
                    <>
                      {investigation.contact.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{investigation.contact.phone}</span>
                        </div>
                      )}
                      
                      {investigation.contact.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{investigation.contact.email}</span>
                        </div>
                      )}
                      
                      {investigation.contact.address && (
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <span className="text-sm">{investigation.contact.address}</span>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Metadaten */}
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Fallnummer:</span>
                    <span className="text-sm font-mono">{investigation.caseNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Erstellt:</span>
                    <span className="text-sm">
                      {new Date(investigation.createdAt).toLocaleDateString("de-DE")}
                    </span>
                  </div>
                  {investigation.publishedAt && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Veröffentlicht:</span>
                      <span className="text-sm">
                        {new Date(investigation.publishedAt).toLocaleDateString("de-DE")}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Bearbeitungsformular */}
      {showEditForm && (
        <InvestigationEditForm
          investigationId={investigation.id}
          onClose={handleCloseEditForm}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
} 