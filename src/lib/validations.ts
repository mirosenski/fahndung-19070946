import { z } from "zod";

// Basis-Validierungen
export const emailSchema = z.string().email("Ungültige Email-Adresse");
export const passwordSchema = z.string().min(8, "Passwort muss mindestens 8 Zeichen lang sein");

// Auth-Validierungen
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwörter stimmen nicht überein",
  path: ["confirmPassword"],
});

// Fahndung-Validierungen
export const fahndungSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich").max(100, "Titel zu lang"),
  description: z.string().min(10, "Beschreibung muss mindestens 10 Zeichen lang sein"),
  location: z.string().min(1, "Ort ist erforderlich"),
  contact: z.string().min(1, "Kontakt ist erforderlich"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  status: z.enum(["active", "resolved", "archived"]).default("active"),
});

export const fahndungUpdateSchema = fahndungSchema.partial();

// Admin-Validierungen
export const adminUserSchema = z.object({
  email: emailSchema,
  role: z.enum(["admin", "super_admin"]).default("admin"),
});

// API Response-Validierungen
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.unknown().optional(),
});

// Pagination
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

// Search
export const searchSchema = z.object({
  query: z.string().min(1, "Suchbegriff ist erforderlich"),
  filters: z.record(z.string()).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type FahndungInput = z.infer<typeof fahndungSchema>;
export type FahndungUpdateInput = z.infer<typeof fahndungUpdateSchema>;
export type AdminUserInput = z.infer<typeof adminUserSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>; 