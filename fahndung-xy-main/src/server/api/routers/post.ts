import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  // Alle Post-Routen, die auf ctx.db.post zugreifen, sind deaktiviert, da das Model im Prisma-Schema fehlt.
  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
