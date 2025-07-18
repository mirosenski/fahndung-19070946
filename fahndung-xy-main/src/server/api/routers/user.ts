import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

function isAdmin(session: { user?: { role?: string } }) {
  return session?.user?.role === "ADMIN";
}

export const userRouter = createTRPCRouter({
  // Alle Benutzer auflisten (nur für Admins)
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!isAdmin(ctx.session)) {
      throw new Error("Nicht autorisiert");
    }
    return ctx.db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Einzelnen Benutzer abrufen (nur für Admins)
  get: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    if (!isAdmin(ctx.session)) {
      throw new Error("Nicht autorisiert");
    }
    return ctx.db.user.findUnique({
      where: { id: input.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }),

  // Benutzer anlegen (nur für Admins)
  create: protectedProcedure.input(z.object({
    name: z.string().optional(),
    email: z.string().email(),
    role: z.enum(["ADMIN", "USER"]),
  })).mutation(async ({ ctx, input }) => {
    if (!isAdmin(ctx.session)) {
      throw new Error("Nicht autorisiert");
    }
    return ctx.db.user.create({
      data: {
        name: input.name,
        email: input.email,
        role: input.role,
      },
    });
  }),

  // Benutzer bearbeiten (nur für Admins)
  update: protectedProcedure.input(z.object({
    id: z.string(),
    name: z.string().optional(),
    email: z.string().email().optional(),
    role: z.enum(["ADMIN", "USER"]).optional(),
  })).mutation(async ({ ctx, input }) => {
    if (!isAdmin(ctx.session)) {
      throw new Error("Nicht autorisiert");
    }
    return ctx.db.user.update({
      where: { id: input.id },
      data: {
        name: input.name,
        email: input.email,
        role: input.role,
      },
    });
  }),

  // Benutzer löschen (nur für Admins)
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    if (!isAdmin(ctx.session)) {
      throw new Error("Nicht autorisiert");
    }
    return ctx.db.user.delete({
      where: { id: input.id },
    });
  }),
}); 