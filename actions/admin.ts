"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAdminAnalytics() {
  try {
    const [totalUsers, totalLessons, totalModules, totalReadingProgress, totalVideoProgress] =
      await Promise.all([
        prisma.user.count(),
        prisma.lesson.count(),
        prisma.module.count(),
        prisma.readingProgress.count({ where: { isCompleted: true } }),
        prisma.videoProgress.count({ where: { isCompleted: true } }),
      ]);

    // Top lessons by completions
    const topCompletedLessons = await prisma.lesson.findMany({
      where: {
        readingProgress: {
          some: { isCompleted: true },
        },
      },
      include: {
        module: true,
        _count: {
          select: { readingProgress: true },
        },
      },
      take: 5,
      orderBy: {
        readingProgress: {
          _count: "desc",
        },
      },
    });

    // Modules overview
    const modules = await prisma.module.findMany({
      include: {
        part: true,
        _count: {
          select: { lessons: true },
        },
      },
      orderBy: { order: "asc" },
    });

    return {
      overview: {
        totalUsers: Math.max(totalUsers, 1),
        totalLessons,
        totalModules,
        totalCompletions: totalReadingProgress + totalVideoProgress,
        readingCompletions: totalReadingProgress,
        videoCompletions: totalVideoProgress,
      },
      topCompletedLessons: topCompletedLessons.map((l) => ({
        id: l.id,
        title: l.title,
        moduleTitle: l.module.title,
        completions: l._count.readingProgress,
      })),
      modules: modules.map((m) => ({
        id: m.id,
        title: m.title,
        partTitle: m.part.title,
        lessonCount: m._count.lessons,
      })),
    };
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    return null;
  }
}

export async function getAdminLessons(search = "", take = 50) {
  try {
    const lessons = await prisma.lesson.findMany({
      where: search.trim()
        ? {
            OR: [
              { title: { contains: search.trim(), mode: "insensitive" } },
              { slug: { contains: search.trim(), mode: "insensitive" } },
            ],
          }
        : undefined,
      include: {
        module: {
          include: {
            part: true,
          },
        },
        topic: true,
        videoMetadata: true,
      },
      orderBy: [{ moduleId: "asc" }, { order: "asc" }],
      take,
    });

    return lessons.map((l) => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      description: l.description,
      partTitle: l.module.part.title,
      moduleTitle: l.module.title,
      topicTitle: l.topic.title,
      isPublished: l.isPublished,
      isFreePreview: l.isFreePreview,
      readingTimeMinutes: l.readingTimeMinutes,
      videoUrl: l.videoMetadata?.videoUrl || null,
      updatedAt: l.updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching admin lessons:", error);
    return [];
  }
}

export async function togglePublishLesson(lessonId: string) {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) return { success: false, error: "Lesson not found" };

    const updated = await prisma.lesson.update({
      where: { id: lessonId },
      data: { isPublished: !lesson.isPublished },
    });

    revalidatePath("/admin/lessons");
    revalidatePath(`/learn/system-design/${lesson.slug}`);
    return { success: true, isPublished: updated.isPublished };
  } catch (error) {
    console.error("Error toggling publish:", error);
    return { success: false };
  }
}

export async function toggleFreePreview(lessonId: string) {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) return { success: false, error: "Lesson not found" };

    const updated = await prisma.lesson.update({
      where: { id: lessonId },
      data: { isFreePreview: !lesson.isFreePreview },
    });

    revalidatePath("/admin/lessons");
    revalidatePath(`/learn/system-design/${lesson.slug}`);
    return { success: true, isFreePreview: updated.isFreePreview };
  } catch (error) {
    console.error("Error toggling free preview:", error);
    return { success: false };
  }
}

export async function updateLessonContent(
  lessonId: string,
  data: {
    title: string;
    description: string;
    content: string;
    videoUrl?: string;
    isPublished?: boolean;
    isFreePreview?: boolean;
  }
) {
  try {
    const updated = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        isPublished: data.isPublished ?? true,
        isFreePreview: data.isFreePreview ?? false,
      },
    });

    if (data.videoUrl) {
      await prisma.videoMetadata.upsert({
        where: { lessonId },
        update: { videoUrl: data.videoUrl },
        create: {
          lessonId,
          videoUrl: data.videoUrl,
          provider: "YOUTUBE",
        },
      });
    }

    revalidatePath("/admin/lessons");
    revalidatePath(`/learn/system-design/${updated.slug}`);
    return { success: true, slug: updated.slug };
  } catch (error) {
    console.error("Error updating lesson content:", error);
    return { success: false };
  }
}
