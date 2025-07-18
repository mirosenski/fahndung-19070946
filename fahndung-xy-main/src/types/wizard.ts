export type WizardStep = 1 | 2 | 3 | 4 | 5;

export interface WizardData {
  step1: {
    category: string;
    priority: string;
    caseNumber: string;
    internalTitle: string;
  };
  step2: {
    displayName: string;
    shortInfo: string;
    location: string;
    date: string;
    status: string;
  };
  step3: {
    age: string;
    height: string;
    build: string;
    hairColor: string;
    hairStyle: string;
    eyes: string;
    features: string;
    clothing: string;
  };
  step4: {
    question: string;
    description: string;
    context: string;
  };
  step5: {
    tel: string;
    email: string;
    formUrl: string;
    station: string;
    location: string;
    areaInsteadOfPoint: boolean;
    preview: boolean;
    publish: boolean;
  };
}

export const WIZARD_STEPS = [
  {
    id: 1,
    title: "Grunddaten",
    description: "Fallkategorie und grundlegende Informationen",
    icon: "file-text",
  },
  {
    id: 2,
    title: "Karteninfos",
    description: "Name und Ort der Fahndung",
    icon: "user",
  },
  {
    id: 3,
    title: "Personenbeschreibung",
    description: "Äußere Merkmale und Bekleidung",
    icon: "user-check",
  },
  {
    id: 4,
    title: "Falldetails",
    description: "Beschreibung und Hintergrund",
    icon: "clipboard-list",
  },
  {
    id: 5,
    title: "Kontakt & Veröffentlichung",
    description: "Kontaktdaten und Veröffentlichung",
    icon: "phone",
  },
];

export const DEMO_CASES = {
  "Manuell": {
    step1: { category: "", priority: "Normal", caseNumber: "", internalTitle: "" },
    step2: { displayName: "", shortInfo: "", location: "", date: "", status: "NEU" },
    step3: { age: "", height: "", build: "", hairColor: "", hairStyle: "", eyes: "", features: "", clothing: "" },
    step4: { question: "", description: "", context: "" },
    step5: { tel: "", email: "", formUrl: "", station: "", location: "", areaInsteadOfPoint: false, preview: true, publish: false },
  },
  "Raub in Stuttgart": {
    step1: { category: "WANTED_PERSON", priority: "EILFAHNDUNG", caseNumber: "BW-2024/123", internalTitle: "Raub in Stuttgart - Hauptbahnhof" },
    step2: { displayName: "Unbekannter Täter", shortInfo: "Tatverdächtiger nach bewaffnetem Raub", location: "Stuttgart Hauptbahnhof", date: "2024-06-15", status: "NEU" },
    step3: { age: "25-30", height: "180 cm", build: "schlank", hairColor: "dunkelbraun", hairStyle: "kurz", eyes: "braun", features: "Tattoo am rechten Unterarm, Narbe an der linken Wange", clothing: "schwarze Kapuzenjacke, dunkle Jeans, weiße Turnschuhe" },
    step4: { question: "Wer erkennt die abgebildete Person oder kann weitere Hinweise geben?", description: "Am 15.06.2024 ereignete sich ein bewaffneter Raub am Stuttgarter Hauptbahnhof. Der Täter bedrohte das Opfer mit einer Waffe und flüchtete mit der Beute.", context: "Der Tatverdächtige wurde von mehreren Zeugen gesehen und auf Überwachungskameras festgehalten." },
    step5: { tel: "0711/110", email: "kripo.stuttgart@polizei.bwl.de", formUrl: "", station: "Kripo Stuttgart", location: "Stuttgart", areaInsteadOfPoint: false, preview: true, publish: false },
  },
  "Einbruch in Heidelberg": {
    step1: { category: "WANTED_PERSON", priority: "URGENT", caseNumber: "BW-2024/456", internalTitle: "Einbruch Heidelberg - Altstadt" },
    step2: { displayName: "Elias Winter", shortInfo: "Tatverdächtiger nach Einbruch", location: "Heidelberg Altstadt", date: "2024-06-10", status: "NEU" },
    step3: { age: "28", height: "175 cm", build: "normal", hairColor: "dunkelbraun", hairStyle: "kurz", eyes: "braun", features: "Tattoo am linken Unterarm, Ohrring im rechten Ohr", clothing: "graue Kapuzenjacke, schwarze Hose, rote Turnschuhe" },
    step4: { question: "Wer erkennt die abgebildete Person oder kann weitere Hinweise geben?", description: "Elias Winter wird wegen Einbruch in der Heidelberger Altstadt gesucht. Der Tatverdächtige wurde zuletzt am 10.06.2024 in der Nähe des Marktplatzes gesehen.", context: "Der Einbruch ereignete sich in einem Geschäft in der Heidelberger Altstadt. Zeugen haben die Person beschrieben." },
    step5: { tel: "06221/110", email: "kripo.heidelberg@polizei.bwl.de", formUrl: "", station: "PP Heidelberg", location: "Heidelberg", areaInsteadOfPoint: false, preview: true, publish: false },
  },
  "Betrug in Karlsruhe": {
    step1: { category: "WANTED_PERSON", priority: "NORMAL", caseNumber: "BW-2024/789", internalTitle: "Betrug Karlsruhe - Innenstadt" },
    step2: { displayName: "Unbekannter Betrüger", shortInfo: "Tatverdächtiger nach Betrug", location: "Karlsruhe Innenstadt", date: "2024-06-12", status: "NEU" },
    step3: { age: "35-40", height: "170 cm", build: "kräftig", hairColor: "schwarz", hairStyle: "glatt", eyes: "dunkel", features: "Brille, Vollbart", clothing: "grauer Anzug, weiße Hemd, schwarze Schuhe" },
    step4: { question: "Wer erkennt die abgebildete Person oder kann weitere Hinweise geben?", description: "Ein unbekannter Mann hat am 12.06.2024 in der Karlsruher Innenstadt mehrere Personen betrogen. Der Täter gibt sich als Bankangestellter aus.", context: "Der Betrüger hat bereits mehrere Opfer um größere Geldbeträge gebracht." },
    step5: { tel: "0721/110", email: "kripo.karlsruhe@polizei.bwl.de", formUrl: "", station: "PP Karlsruhe", location: "Karlsruhe", areaInsteadOfPoint: false, preview: true, publish: false },
  },
  "Körperverletzung in Mannheim": {
    step1: { category: "WANTED_PERSON", priority: "URGENT", caseNumber: "BW-2024/321", internalTitle: "Körperverletzung Mannheim - Neckarstadt" },
    step2: { displayName: "Unbekannter Angreifer", shortInfo: "Tatverdächtiger nach schwerer Körperverletzung", location: "Mannheim Neckarstadt", date: "2024-06-08", status: "NEU" },
    step3: { age: "20-25", height: "185 cm", build: "athletisch", hairColor: "blond", hairStyle: "kurz", eyes: "blau", features: "Tattoo am Hals, Piercing in der Nase", clothing: "schwarze Lederjacke, blaue Jeans, schwarze Stiefel" },
    step4: { question: "Wer erkennt die abgebildete Person oder kann weitere Hinweise geben?", description: "Am 08.06.2024 ereignete sich eine schwere Körperverletzung in der Mannheimer Neckarstadt. Der Angreifer verletzte das Opfer schwer.", context: "Der Tatverdächtige wurde von Zeugen gesehen und auf Überwachungskameras festgehalten." },
    step5: { tel: "0621/110", email: "kripo.mannheim@polizei.bwl.de", formUrl: "", station: "PP Mannheim", location: "Mannheim", areaInsteadOfPoint: false, preview: true, publish: false },
  },
}; 