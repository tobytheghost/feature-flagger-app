import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { convertFlagNameToKey } from "../../../../utils/convertFlagNameToKey";
import { flagSchema, toggleFlagSchema } from "./schema";
import { addUserDataToFlags } from "./utils";

export const flagsRouter = createTRPCRouter({
  /**
   * Get all flags
   */
  getAll: publicProcedure.query(async ({ ctx }) => {
    const flags = await ctx.prisma.flag.findMany();
    return addUserDataToFlags(flags);
  }),

  /**
   * Get flag by name
   */
  getByName: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.flag.findMany({
        where: { name: input.name },
      });
    }),

  /**
   * Create a new flag
   */
  create: privateProcedure
    .input(flagSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const { name } = input;

      if (!name) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Name is required",
        });
      }

      const flag = await ctx.prisma.flag.create({
        data: {
          key: convertFlagNameToKey(name),
          name,
          createdBy: userId,
          updatedBy: userId,
          development: true,
        },
      });
      return flag;
    }),

  /**
   * Update a flag
   */
  toggle: privateProcedure
    .input(toggleFlagSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const { id, development, staging, production } = input;

      console.log("here");

      if (!id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ID is required",
        });
      }

      const flag = await ctx.prisma.flag.update({
        where: { id },
        data: {
          development,
          staging,
          production,
          updatedBy: userId,
          updatedAt: new Date(),
        },
      });
      return flag;
    }),
});

export type FlagsRouter = typeof flagsRouter;
