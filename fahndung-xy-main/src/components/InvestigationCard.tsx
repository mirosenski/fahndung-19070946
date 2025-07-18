import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Eye, Calendar, MapPin } from "lucide-react";

interface Investigation {
  id: string;
  title: string;
  category: string;
  priority: string;
  location: string;
  date: string;
  imageUrl?: string;
}

interface InvestigationCardProps {
  investigation: Investigation;
}

export function InvestigationCard({ investigation }: InvestigationCardProps) {
  function getCategoryLabel(category: string): string {
    const labels = {
      "WANTED_PERSON": "Straftäter",
      "MISSING_PERSON": "Vermisste Person",
      "UNKNOWN_DEAD": "Unbekannte Tote",
      "STOLEN_GOODS": "Gesuchte Sachen",
    };
    return labels[category as keyof typeof labels] || category;
  }

  function getPriorityBadge(priority: string) {
    switch (priority) {
      case "URGENT":
        return <Badge variant="destructive">EILFAHNDUNG</Badge>;
      case "NORMAL":
        return <Badge variant="outline">Normal</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <Link href={`/fahndung/${investigation.id}`}>
      <Card className="h-full investigation-card cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{investigation.title}</CardTitle>
              <div className="flex items-center space-x-2 mb-2">
                {getPriorityBadge(investigation.priority)}
                <Badge variant="secondary">
                  {getCategoryLabel(investigation.category)}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{investigation.location}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{formatDate(investigation.date)}</span>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="ghost" size="sm" className="text-primary">
                <Eye className="w-4 h-4 mr-1" />
                Details anzeigen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
} 