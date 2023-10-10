import { clerkClient } from "@clerk/nextjs";
import { type User } from "@clerk/nextjs/dist/types/server";
import { type Flag } from "@prisma/client";

export const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.imageUrl,
    firstName: user.firstName,
    lastName: user.lastName,
  };
};

export const addUserDataToFlags = async (flags: Flag[]) => {
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

    return {
      flag,
      // Spread / re-assign to make sure username is typed correctly
      createdByUser: createdByUser && {
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
