import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Prüfen ob bereits Demo-Daten existieren
    const existingInvestigations = await prisma.investigation.findMany({
      where: {
        title: {
          in: [
            "Max Mustermann - Vermisst",
            "Anna Schmidt - Gesucht",
            "Unbekannte Person - Freiburg"
          ]
        }
      }
    });

    if (existingInvestigations.length > 0) {
      return res.status(200).json({ 
        message: "Demo-Daten existieren bereits",
        count: existingInvestigations.length
      });
    }

    // Admin-Benutzer erstellen oder finden
    let adminUser = await prisma.user.findFirst({
      where: { email: "admin@fahndung.de" }
    });

    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          name: "Administrator",
          email: "admin@fahndung.de",
          role: "ADMIN",
        },
      });
    }

    // Demo-Fahndungen erstellen
    const demoInvestigations = await Promise.all([
      // Vermisste Person
      prisma.investigation.create({
        data: {
          title: "Max Mustermann - Vermisst",
          caseNumber: "BW-2024-001",
          category: "MISSING_PERSON",
          priority: "URGENT",
          location: "Stuttgart",
          status: "PUBLISHED",
          description: "Max Mustermann wurde zuletzt am 15. Januar 2024 in Stuttgart gesehen. Er trägt eine blaue Jacke und hat braune Haare.",
          features: "Braune Haare, blaue Augen, 1,75m groß, blaue Jacke",
          station: "Polizeidirektion Stuttgart",
          mainImage: "https://via.placeholder.com/289x231/cccccc/666666?text=Max+Mustermann",
          shortDescription: "Vermisste Person in Stuttgart",
          context: "Max Mustermann wurde zuletzt am 15. Januar 2024 in der Innenstadt von Stuttgart gesehen. Er war auf dem Weg zur Arbeit und hat sich seitdem nicht mehr gemeldet.",
          createdBy: adminUser.id,
          updatedBy: adminUser.id,
          contact: {
            create: {
              phone: "0711/110",
              address: "Polizeidirektion Stuttgart"
            }
          }
        }
      }),

      // Gesuchte Person
      prisma.investigation.create({
        data: {
          title: "Anna Schmidt - Gesucht",
          caseNumber: "BW-2024-002",
          category: "WANTED_PERSON",
          priority: "NORMAL",
          location: "Karlsruhe",
          status: "PUBLISHED",
          description: "Anna Schmidt wird wegen schwerer Körperverletzung gesucht. Sie wurde zuletzt in Karlsruhe gesehen.",
          features: "Blonde Haare, grüne Augen, 1,68m groß, oft schwarze Kleidung",
          station: "Polizeidirektion Karlsruhe",
          mainImage: "https://via.placeholder.com/289x231/cccccc/666666?text=Anna+Schmidt",
          shortDescription: "Gesuchte Person in Karlsruhe",
          context: "Anna Schmidt wird wegen schwerer Körperverletzung gesucht. Sie wurde zuletzt am 20. Januar 2024 in Karlsruhe gesehen.",
          createdBy: adminUser.id,
          updatedBy: adminUser.id,
          contact: {
            create: {
              phone: "0721/110",
              address: "Polizeidirektion Karlsruhe"
            }
          }
        }
      }),

      // Unbekannte Tote
      prisma.investigation.create({
        data: {
          title: "Unbekannte Person - Freiburg",
          caseNumber: "BW-2024-003",
          category: "UNKNOWN_DEAD",
          priority: "NORMAL",
          location: "Freiburg",
          status: "PUBLISHED",
          description: "Unbekannte Person wurde in Freiburg gefunden. Wir suchen nach der Identität.",
          features: "Graue Haare, braune Augen, etwa 60-70 Jahre alt",
          station: "Polizeidirektion Freiburg",
          mainImage: "https://via.placeholder.com/289x231/cccccc/666666?text=Unbekannt",
          shortDescription: "Unbekannte Person in Freiburg",
          context: "Am 25. Januar 2024 wurde eine unbekannte Person in Freiburg gefunden. Wir suchen nach der Identität der Person.",
          createdBy: adminUser.id,
          updatedBy: adminUser.id,
          contact: {
            create: {
              phone: "0761/110",
              address: "Polizeidirektion Freiburg"
            }
          }
        }
      })
    ]);

    return res.status(200).json({ 
      message: "Demo-Daten erfolgreich erstellt",
      count: demoInvestigations.length,
      investigations: demoInvestigations.map(inv => ({
        id: inv.id,
        title: inv.title,
        category: inv.category,
        status: inv.status
      }))
    });
  } catch (error) {
    console.error("Fehler beim Erstellen der Demo-Daten:", error);
    return res.status(500).json({ 
      message: "Fehler beim Erstellen der Demo-Daten",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  } finally {
    await prisma.$disconnect();
  }
} 