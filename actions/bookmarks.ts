"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function getOrCreateDbUser() {
  const { userId } = auth();
  if (!userId) return null;

  let dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!dbUser) {
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress || `${userId}@user.codexa.io`;
    const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Engineer";

    dbUser = await prisma.user.upsert({
      where: { clerkId: userId },
      update: { email, name, imageUrl: user?.imageUrl },
      create: {
        clerkId: userId,
        email,
        name,
        imageUrl: user?.imageUrl,
      },
    });
  }

  return dbUser;
}

export async function toggleBookmark(lessonId: string) {
  try {
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) return { success: false, reason: "unauthenticated" };

    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_lessonId: {
          userId: dbUser.id,
          lessonId,
        },
      },
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });
      revalidatePath("/dashboard", "page");
      revalidatePath("/dashboard/bookmarks", "page");
      return { success: true, isBookmarked: false };
    } else {
      await prisma.bookmark.create({
        data: {
          userId: dbUser.id,
          lessonId,
        },
      });
      revalidatePath("/dashboard", "page");
      revalidatePath("/dashboard/bookmarks", "page");
      return { success: true, isBookmarked: true };
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    return { success: false };
  }
}

export async function getUserBookmarks() {
  try {
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) return [];

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: dbUser.id },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                part: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return bookmarks.map((b) => ({
      id: b.id,
      lessonId: b.lessonId,
      lessonSlug: b.lesson.slug,
      lessonTitle: b.lesson.title,
      description: b.lesson.description,
      moduleTitle: b.lesson.module.title,
      partTitle: b.lesson.module.part.title,
      readingMinutes: b.lesson.readingTimeMinutes,
      createdAt: b.createdAt,
    }));
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return [];
  }
}
