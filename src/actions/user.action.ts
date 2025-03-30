"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

type UserWithCounts = Awaited<ReturnType<typeof prisma.user.findUnique>> & {
  _count: {
    followers: number;
    following: number;
    posts: number;
  };
};

export async function syncUser(): Promise<UserWithCounts> {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      console.warn("No authenticated user found");
      throw new Error("Authentication required");
    }

    // Validate required fields
    if (!user.emailAddresses[0]?.emailAddress) {
      throw new Error("User email is required");
    }

    // First check if user exists without _count
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (existingUser) {
      // Now fetch with _count if needed
      return await prisma.user.findUnique({
        where: { clerkId: userId },
        include: {
          _count: {
            select: {
              followers: true,
              following: true,
              posts: true,
            },
          },
        },
      }) as UserWithCounts;
    }

    // Create new user with fallbacks
    const username = user.username || 
                    user.emailAddresses[0].emailAddress.split("@")[0] || 
                    `user-${Math.random().toString(36).substring(2, 8)}`;

    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

    const newUser = await prisma.user.create({
      data: {
        clerkId: userId,
        name: fullName || username,
        username,
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
      },
    });

    // Return with _count structure
    return {
      ...newUser,
      _count: {
        followers: 0,
        following: 0,
        posts: 0,
      },
    };
  } catch (error) {
    console.error("Failed to sync user:", error);
    throw new Error("Failed to synchronize user");
  }
}

export async function getUserByClerkId(clerkId: string): Promise<UserWithCounts> {
  if (!clerkId) {
    throw new Error("clerkId is required");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to retrieve user");
  }
}

export async function getDbUserId(): Promise<string | null> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return null;
    }

    let user: UserWithCounts | null;
    try {
      user = await getUserByClerkId(clerkId);
    } catch {
      user = await syncUser();
    }

    if (!user) {
      throw new Error("User not found after sync attempt");
    }

    return user.id;
  } catch (error) {
    console.error("Failed to get user ID:", error);
    throw error;
  }
}

export async function getRandomUsers(): Promise<Array<{
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  _count: {
    followers: number;
  };
}>> {
  try {
    const userId = await getDbUserId();
    if (!userId) return [];

    return await prisma.user.findMany({
      where: {
        AND: [
          { NOT: { id: userId } },
          {
            NOT: {
              followers: {
                some: { followerId: userId },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    });
  } catch (error) {
    console.error("Failed to fetch random users:", error);
    return [];
  }
}

export async function toggleFollow(
  targetUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      throw new Error("Authentication required");
    }

    if (userId === targetUserId) {
      throw new Error("Cannot follow yourself");
    }

    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      // Unfollow
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      });
    } else {
      // Follow with transaction
      await prisma.$transaction([
        prisma.follows.create({
          data: {
            followerId: userId,
            followingId: targetUserId,
          },
        }),
        prisma.notification.create({
          data: {
            type: "FOLLOW",
            userId: targetUserId,
            creatorId: userId,
          },
        }),
      ]);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle follow:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to toggle follow" 
    };
  }
}