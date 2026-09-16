import { prisma } from "./prisma";
import { CourseNavigationData } from "@/types/course";
import { TOCHeading } from "@/components/layout/TableOfContents";

export async function getCourseNavigation(courseSlug = "system-design"): Promise<CourseNavigationData | null> {
  try {
    const course = await prisma.course.findUnique({
      where: { slug: courseSlug },
      include: {
        parts: {
          orderBy: { order: "asc" },
          include: {
            modules: {
              orderBy: { order: "asc" },
              include: {
                topics: {
                  orderBy: { order: "asc" },
                  include: {
                    lessons: {
                      orderBy: { order: "asc" },
                      select: {
                        id: true,
                        slug: true,
                        title: true,
                        order: true,
                        isFreePreview: true,
                        readingTimeMinutes: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!course) return null;

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      parts: course.parts.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        order: p.order,
        modules: p.modules.map((m) => ({
          id: m.id,
          slug: m.slug,
          title: m.title,
          order: m.order,
          topics: m.topics.map((t) => ({
            id: t.id,
            slug: t.slug,
            title: t.title,
            order: t.order,
            lessons: t.lessons.map((l) => ({
              id: l.id,
              slug: l.slug,
              title: l.title,
              order: l.order,
              isFreePreview: l.isFreePreview,
              readingTimeMinutes: l.readingTimeMinutes,
            })),
          })),
        })),
      })),
    };
  } catch (error) {
    console.error("Error fetching course navigation:", error);
    return null;
  }
}

// Helper to extract H2 and H3 headings for the Table of Contents
export function extractHeadings(content: string): TOCHeading[] {
  const headings: TOCHeading[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      const text = h2Match[1].replace(/[*_`]/g, "").trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      headings.push({ id, text, level: 2 });
      continue;
    }

    const h3Match = line.match(/^###\s+(.+)$/);
    if (h3Match) {
      const text = h3Match[1].replace(/[*_`]/g, "").trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      headings.push({ id, text, level: 3 });
    }
  }

  return headings;
}

export interface LessonDetailResult {
  lesson: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    content: string | null;
    isFreePreview: boolean;
    readingTimeMinutes: number | null;
    defaultMode: "READING" | "VIDEO";
  };
  video: {
    videoUrl: string;
    provider: "YOUTUBE" | "BUNNY";
    title: string | null;
    durationSeconds: number | null;
  } | null;
  hierarchy: {
    courseTitle: string;
    courseSlug: string;
    partTitle: string;
    partSlug: string;
    moduleTitle: string;
    moduleSlug: string;
    topicTitle: string;
    topicSlug: string;
  };
  navigation: {
    prevLesson: { slug: string; title: string } | null;
    nextLesson: { slug: string; title: string } | null;
  };
  headings: TOCHeading[];
}

export async function getLessonDetail(
  courseSlug: string,
  lessonSlug: string
): Promise<LessonDetailResult | null> {
  try {
    const course = await prisma.course.findUnique({
      where: { slug: courseSlug },
      include: {
        parts: {
          orderBy: { order: "asc" },
          include: {
            modules: {
              orderBy: { order: "asc" },
              include: {
                topics: {
                  orderBy: { order: "asc" },
                  include: {
                    lessons: {
                      orderBy: { order: "asc" },
                      include: {
                        videoMetadata: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!course) return null;

    // Linear list of all lessons in course order to find current, prev, and next
    const allOrderedLessons: {
      lesson: (typeof course.parts)[0]["modules"][0]["topics"][0]["lessons"][0];
      part: (typeof course.parts)[0];
      module: (typeof course.parts)[0]["modules"][0];
      topic: (typeof course.parts)[0]["modules"][0]["topics"][0];
    }[] = [];

    for (const part of course.parts) {
      for (const mod of part.modules) {
        for (const topic of mod.topics) {
          for (const lesson of topic.lessons) {
            allOrderedLessons.push({ lesson, part, module: mod, topic });
          }
        }
      }
    }

    const currentIndex = allOrderedLessons.findIndex((item) => item.lesson.slug === lessonSlug);
    if (currentIndex === -1) return null;

    const currentItem = allOrderedLessons[currentIndex];
    const prevItem = currentIndex > 0 ? allOrderedLessons[currentIndex - 1] : null;
    const nextItem = currentIndex < allOrderedLessons.length - 1 ? allOrderedLessons[currentIndex + 1] : null;

    const rawContent = currentItem.lesson.content || "";
    const headings = extractHeadings(rawContent);

    return {
      lesson: {
        id: currentItem.lesson.id,
        slug: currentItem.lesson.slug,
        title: currentItem.lesson.title,
        description: currentItem.lesson.description,
        content: rawContent,
        isFreePreview: currentItem.lesson.isFreePreview,
        readingTimeMinutes: currentItem.lesson.readingTimeMinutes,
        defaultMode: currentItem.lesson.defaultMode,
      },
      video: currentItem.lesson.videoMetadata
        ? {
            videoUrl: currentItem.lesson.videoMetadata.videoUrl,
            provider: currentItem.lesson.videoMetadata.provider,
            title: currentItem.lesson.videoMetadata.title,
            durationSeconds: currentItem.lesson.videoMetadata.durationSeconds,
          }
        : null,
      hierarchy: {
        courseTitle: course.title,
        courseSlug: course.slug,
        partTitle: currentItem.part.title,
        partSlug: currentItem.part.slug,
        moduleTitle: currentItem.module.title,
        moduleSlug: currentItem.module.slug,
        topicTitle: currentItem.topic.title,
        topicSlug: currentItem.topic.slug,
      },
      navigation: {
        prevLesson: prevItem ? { slug: prevItem.lesson.slug, title: prevItem.lesson.title } : null,
        nextLesson: nextItem ? { slug: nextItem.lesson.slug, title: nextItem.lesson.title } : null,
      },
      headings,
    };
  } catch (error) {
    console.error("Error fetching lesson detail:", error);
    return null;
  }
}
