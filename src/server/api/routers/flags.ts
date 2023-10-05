import { clerkClient } from "@clerk/nextjs";
import { type User } from "@clerk/nextjs/dist/types/server";
import { type Flag } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { convertFlagNameToKey } from "../../../utils/convertFlagNameToKey";

const flagSchema = z.object({
  name: z.string().max(144),
});

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl,
    firstName: user.firstName,
    lastName: user.lastName,
  };
};
const addUserDataToFlags = async (flags: Flag[]) => {
  const userIds = [
    ...new Set([
      ...flags.map((flag) => flag.createdBy),
      ...flags.map((flag) => flag.updatedBy),
    ]),
  ];

  const users = (
    await clerkClient.users.getUserList({
      userId: userIds,
      limit: 100,
    })
  ).map(filterUserForClient);

  return flags.map((flag) => {
    const createdByUser = users.find((user) => user.id === flag.createdBy);
    const updatedByUser = users.find((user) => user.id === flag.updatedBy);

    if (!createdByUser?.username) {
      return {
        flag,
      };
    }

    return {
      flag,
      // Spread / re-assign to make sure username is typed correctly
      createdByUser: {
        ...createdByUser,
        username: createdByUser.username,
      },
      // Spread / re-assign to make sure username is typed correctly
      updatedByUser: updatedByUser && {
        ...updatedByUser,
        username: updatedByUser.username,
      },
    };
  });
};

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
        },
      });
      return flag;
    }),
});

export type FlagsRouter = typeof flagsRouter;
