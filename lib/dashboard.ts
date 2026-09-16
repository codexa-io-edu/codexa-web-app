import { auth } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export interface StudentDashboardData {
  user: {
    name: string;
    email: string;
    imageUrl?: string | null;
  };
  stats: {
    totalLessonsCompleted: number;
    totalCourseLessons: number;
    overallReadingPercent: number;
    overallVideoPercent: number;
    totalBookmarks: number;
    currentStreak: number;
  };
  continueLearning: {
    lessonSlug: string;
    lessonTitle: string;
    moduleTitle: string;
    courseSlug: string;
    readingPercent: number;
    videoPercent: number;
    lastAccessedAt: Date;
  } | null;
  recentBookmarks: {
    id: string;
    lessonId: string;
    lessonSlug: string;
    lessonTitle: string;
    moduleTitle: string;
    partTitle: string;
    readingMinutes: number | null;
    createdAt: Date;
  }[];
}

export async function getStudentDashboardData(): Promise<StudentDashboardData | null> {
  const { userId } = auth();
  if (!userId) return null;

  try {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        readingProgress: {
          orderBy: { lastViewedAt: "desc" },
          include: {
            lesson: {
              include: {
                module: {
                  include: {
                    part: true,
                  },
                },
                course: true,
              },
            },
          },
        },
        videoProgress: {
          orderBy: { lastWatchedAt: "desc" },
          include: {
            lesson: {
              include: {
                module: true,
                course: true,
              },
            },
          },
        },
        bookmarks: {
          orderBy: { createdAt: "desc" },
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
        },
      },
    });

    const totalCourseLessons = await prisma.lesson.count();

    // Defaults if user record hasn't synced progress yet
    const userName = dbUser?.name || "Software Engineer";
    const userEmail = dbUser?.email || "";
    const userImage = dbUser?.imageUrl;

    const completedReading = dbUser?.readingProgress.filter((p) => p.isCompleted).length || 0;
    const completedVideo = dbUser?.videoProgress.filter((p) => p.isCompleted).length || 0;

    const overallReadingPercent = totalCourseLessons > 0
      ? Math.round((completedReading / totalCourseLessons) * 100)
      : 0;

    const overallVideoPercent = totalCourseLessons > 0
      ? Math.round((completedVideo / totalCourseLessons) * 100)
      : 0;

    // Determine continue learning card from latest viewed reading or video
    let continueLearning = null;
    const latestReading = dbUser?.readingProgress[0];
    const latestVideo = dbUser?.videoProgress[0];

    if (latestReading && (!latestVideo || latestReading.lastViewedAt >= latestVideo.lastWatchedAt)) {
      const matchVideo = dbUser?.videoProgress.find((vp) => vp.lessonId === latestReading.lessonId);
      continueLearning = {
        lessonSlug: latestReading.lesson.slug,
        lessonTitle: latestReading.lesson.title,
        moduleTitle: latestReading.lesson.module.title,
        courseSlug: latestReading.lesson.course.slug,
        readingPercent: latestReading.scrollPercent,
        videoPercent: matchVideo?.percentWatched || 0,
        lastAccessedAt: latestReading.lastViewedAt,
      };
    } else if (latestVideo) {
      const matchReading = dbUser?.readingProgress.find((rp) => rp.lessonId === latestVideo.lessonId);
      continueLearning = {
        lessonSlug: latestVideo.lesson.slug,
        lessonTitle: latestVideo.lesson.title,
        moduleTitle: latestVideo.lesson.module.title,
        courseSlug: latestVideo.lesson.course.slug,
        readingPercent: matchReading?.scrollPercent || 0,
        videoPercent: latestVideo.percentWatched,
        lastAccessedAt: latestVideo.lastWatchedAt,
      };
    } else {
      // If brand new user with 0 progress, point to the first lesson of the course
      const firstLesson = await prisma.lesson.findFirst({
        where: { slug: "what-is-system-design" },
        include: { module: true, course: true },
      });

      if (firstLesson) {
        continueLearning = {
          lessonSlug: firstLesson.slug,
          lessonTitle: firstLesson.title,
          moduleTitle: firstLesson.module.title,
          courseSlug: firstLesson.course.slug,
          readingPercent: 0,
          videoPercent: 0,
          lastAccessedAt: new Date(),
        };
      }
    }

    const recentBookmarks = (dbUser?.bookmarks || []).slice(0, 6).map((b) => ({
      id: b.id,
      lessonId: b.lessonId,
      lessonSlug: b.lesson.slug,
      lessonTitle: b.lesson.title,
      moduleTitle: b.lesson.module.title,
      partTitle: b.lesson.module.part.title,
      readingMinutes: b.lesson.readingTimeMinutes,
      createdAt: b.createdAt,
    }));

    return {
      user: {
        name: userName,
        email: userEmail,
        imageUrl: userImage,
      },
      stats: {
        totalLessonsCompleted: Math.max(completedReading, completedVideo),
        totalCourseLessons,
        overallReadingPercent,
        overallVideoPercent,
        totalBookmarks: dbUser?.bookmarks.length || 0,
        currentStreak: 1, // Default active streak
      },
      continueLearning,
      recentBookmarks,
    };
  } catch (error) {
    console.error("Failed to fetch student dashboard data:", error);
    return null;
  }
}
