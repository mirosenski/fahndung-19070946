import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createDemoUser() {
  try {
    // Prüfen ob Admin-Benutzer bereits existiert
    const existingAdmin = await prisma.user.findFirst({
      where: { email: "admin@fahndung.de" }
    });

    if (existingAdmin) {
      console.log("Admin-Benutzer existiert bereits:", existingAdmin.email);
      return;
    }

    // Demo-Admin-Benutzer erstellen
    const demoUser = await prisma.user.create({
      data: {
        name: "Administrator",
        email: "admin@fahndung.de",
        role: "ADMIN",
      },
    });

    console.log("Demo-Admin-Benutzer erstellt:", demoUser);
  } catch (error) {
    console.error("Fehler beim Erstellen des Demo-Benutzers:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoUser(); 