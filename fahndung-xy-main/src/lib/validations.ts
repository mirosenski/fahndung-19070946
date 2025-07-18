import { z } from "zod";

export const investigationSchema = z.object({
  category: z.string().min(1, "Kategorie ist erforderlich"),
  priority: z.string().min(1, "Priorität ist erforderlich"),
  caseNumber: z.string().min(1, "Aktenzeichen ist erforderlich"),
  internalTitle: z.string().optional(),
  displayName: z.string().min(1, "Name ist erforderlich"),
  shortInfo: z.string().optional(),
  location: z.string().min(1, "Ort ist erforderlich"),
  date: z.string().optional(),
  age: z.string().optional(),
  height: z.string().optional(),
  build: z.string().optional(),
  hairColor: z.string().optional(),
  eyes: z.string().optional(),
  features: z.string().optional(),
  clothing: z.string().optional(),
  question: z.string().min(1, "Hauptfrage ist erforderlich"),
  description: z.string().min(1, "Beschreibung ist erforderlich"),
  context: z.string().optional(),
  tel: z.string().min(1, "Telefon ist erforderlich"),
  email: z.string().email("Ungültige E-Mail").optional(),
  station: z.string().min(1, "Dienststelle ist erforderlich"),
  preview: z.boolean().default(true),
  publish: z.boolean().default(false),
});

export type InvestigationFormData = z.infer<typeof investigationSchema>; 