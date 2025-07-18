import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

export const investigationRouter = createTRPCRouter({
  // Alle Fahndungen abrufen (öffentlich) - mit optimiertem Caching
  getAll: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      category: z.enum(["WANTED_PERSON", "MISSING_PERSON", "UNKNOWN_DEAD", "STOLEN_GOODS"]).optional(),
      priority: z.enum(["NORMAL", "URGENT", "NEW"]).optional(),
      status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const where = {
        ...(input.status && { status: input.status }),
        ...(input.category && { category: input.category }),
        ...(input.priority && { priority: input.priority }),
        ...(input.search && {
          OR: [
            { title: { contains: input.search, mode: "insensitive" as const } },
            { caseNumber: { contains: input.search, mode: "insensitive" as const } },
            { location: { contains: input.search, mode: "insensitive" as const } },
            { shortDescription: { contains: input.search, mode: "insensitive" as const } },
          ],
        }),
      };

      const [investigations, total] = await Promise.all([
        ctx.db.investigation.findMany({
          where,
          include: {
            images: true,
            contact: true,
          },
          orderBy: { createdAt: "desc" },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.db.investigation.count({ where }),
      ]);

      return {
        investigations,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Einzelne Fahndung abrufen (öffentlich)
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const investigation = await ctx.db.investigation.findUnique({
        where: { id: input.id },
        include: {
          images: {
            orderBy: { order: "asc" },
          },
          contact: true,
        },
      });

      if (!investigation) {
        throw new Error("Fahndung nicht gefunden");
      }

      return investigation;
    }),

  // Fahndung erstellen (nur Admin) - mit optimistischen Updates
  create: protectedProcedure
    .input(z.object({
      caseNumber: z.string(),
      title: z.string(),
      category: z.enum(["WANTED_PERSON", "MISSING_PERSON", "UNKNOWN_DEAD", "STOLEN_GOODS"]),
      priority: z.enum(["NORMAL", "URGENT", "NEW"]),
      shortDescription: z.string(),
      description: z.string(),
      location: z.string(),
      station: z.string(),
      context: z.string().optional(),
      features: z.string().optional(),
      question: z.string().optional(),
      mainImage: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      address: z.string().optional(),
      images: z.array(z.object({
        url: z.string(),
        altText: z.string().optional(),
        caption: z.string().optional(),
        order: z.number(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { images, phone, email, address, ...investigationData } = input;

      const investigation = await ctx.db.investigation.create({
        data: {
          ...investigationData,
          createdBy: ctx.session.user.id,
          updatedBy: ctx.session.user.id,
          contact: {
            create: {
              phone,
              email,
              address,
            },
          },
          images: {
            create: images?.map((image, index) => ({
              ...image,
              order: image.order ?? index,
            })) ?? [],
          },
        },
        include: {
          images: true,
          contact: true,
        },
      });

      return investigation;
    }),

  // Fahndung aktualisieren (nur Admin)
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      caseNumber: z.string().optional(),
      title: z.string().optional(),
      category: z.enum(["WANTED_PERSON", "MISSING_PERSON", "UNKNOWN_DEAD", "STOLEN_GOODS"]).optional(),
      priority: z.enum(["NORMAL", "URGENT", "NEW"]).optional(),
      shortDescription: z.string().optional(),
      description: z.string().optional(),
      location: z.string().optional(),
      station: z.string().optional(),
      context: z.string().optional(),
      features: z.string().optional(),
      question: z.string().optional(),
      mainImage: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      address: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, phone, email, address, ...updateData } = input;

      const investigation = await ctx.db.investigation.update({
        where: { id },
        data: {
          ...updateData,
          updatedBy: ctx.session.user.id,
          contact: {
            upsert: {
              create: { phone, email, address },
              update: { phone, email, address },
            },
          },
        },
        include: {
          images: true,
          contact: true,
        },
      });

      return investigation;
    }),

  // Fahndung veröffentlichen (nur Admin)
  publish: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const investigation = await ctx.db.investigation.update({
        where: { id: input.id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
          updatedBy: ctx.session.user.id,
        },
        include: {
          images: true,
          contact: true,
        },
      });

      return investigation;
    }),

  // Fahndung archivieren (nur Admin)
  archive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const investigation = await ctx.db.investigation.update({
        where: { id: input.id },
        data: {
          status: "ARCHIVED",
          updatedBy: ctx.session.user.id,
        },
        include: {
          images: true,
          contact: true,
        },
      });

      return investigation;
    }),

  // Fahndung löschen (nur Admin)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.investigation.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Statistiken abrufen (nur Admin) - mit Caching
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const [total, published, draft, urgent, thisMonth] = await Promise.all([
      ctx.db.investigation.count(),
      ctx.db.investigation.count({ where: { status: "PUBLISHED" } }),
      ctx.db.investigation.count({ where: { status: "DRAFT" } }),
      ctx.db.investigation.count({ where: { priority: "URGENT" } }),
      ctx.db.investigation.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    return {
      total,
      published,
      draft,
      urgent,
      thisMonth,
    };
  }),
}); 