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

export async function saveReadingProgress(lessonId: string, scrollPercent: number) {
  try {
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) return { success: false, reason: "unauthenticated" };

    const normalizedPercent = Math.min(100, Math.max(0, Math.round(scrollPercent)));
    const isCompleted = normalizedPercent >= 90;

    await prisma.readingProgress.upsert({
      where: {
        userId_lessonId: {
          userId: dbUser.id,
          lessonId,
        },
      },
      update: {
        scrollPercent: normalizedPercent,
        isCompleted,
        completedAt: isCompleted ? new Date() : undefined,
        lastViewedAt: new Date(),
      },
      create: {
        userId: dbUser.id,
        lessonId,
        scrollPercent: normalizedPercent,
        isCompleted,
        completedAt: isCompleted ? new Date() : undefined,
      },
    });

    return { success: true, isCompleted };
  } catch (error) {
    console.error("Error saving reading progress:", error);
    return { success: false };
  }
}

export async function saveVideoProgress(
  lessonId: string,
  watchedSeconds: number,
  durationSeconds: number
) {
  try {
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) return { success: false, reason: "unauthenticated" };

    const percentWatched =
      durationSeconds > 0
        ? Math.min(100, Math.round((watchedSeconds / durationSeconds) * 100))
        : 0;
    const isCompleted = percentWatched >= 85;

    await prisma.videoProgress.upsert({
      where: {
        userId_lessonId: {
          userId: dbUser.id,
          lessonId,
        },
      },
      update: {
        watchedSeconds: Math.round(watchedSeconds),
        durationSeconds: Math.round(durationSeconds),
        percentWatched,
        isCompleted,
        completedAt: isCompleted ? new Date() : undefined,
        lastWatchedAt: new Date(),
      },
      create: {
        userId: dbUser.id,
        lessonId,
        watchedSeconds: Math.round(watchedSeconds),
        durationSeconds: Math.round(durationSeconds),
        percentWatched,
        isCompleted,
        completedAt: isCompleted ? new Date() : undefined,
      },
    });

    return { success: true, isCompleted, percentWatched };
  } catch (error) {
    console.error("Error saving video progress:", error);
    return { success: false };
  }
}

export async function markLessonComplete(lessonId: string, mode: "READING" | "VIDEO" = "READING") {
  try {
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) return { success: false };

    if (mode === "READING") {
      await prisma.readingProgress.upsert({
        where: { userId_lessonId: { userId: dbUser.id, lessonId } },
        update: { scrollPercent: 100, isCompleted: true, completedAt: new Date() },
        create: { userId: dbUser.id, lessonId, scrollPercent: 100, isCompleted: true, completedAt: new Date() },
      });
    } else {
      await prisma.videoProgress.upsert({
        where: { userId_lessonId: { userId: dbUser.id, lessonId } },
        update: { percentWatched: 100, isCompleted: true, completedAt: new Date() },
        create: { userId: dbUser.id, lessonId, percentWatched: 100, isCompleted: true, completedAt: new Date() },
      });
    }

    revalidatePath("/learn/[courseSlug]/[lessonSlug]", "page");
    return { success: true };
  } catch (error) {
    console.error("Error marking lesson complete:", error);
    return { success: false };
  }
}
