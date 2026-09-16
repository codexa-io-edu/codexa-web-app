import { prisma } from "./prisma";

export interface SearchResultItem {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  moduleTitle?: string;
  partTitle?: string;
  type: "lesson" | "topic" | "module";
  href: string;
}

export interface SearchResults {
  lessons: SearchResultItem[];
  topics: SearchResultItem[];
  modules: SearchResultItem[];
  total: number;
}

export async function searchContent(query: string, limit = 15): Promise<SearchResults> {
  const searchTerm = query.trim();
  if (!searchTerm || searchTerm.length < 2) {
    return { lessons: [], topics: [], modules: [], total: 0 };
  }

  try {
    // 1. Search Lessons
    const lessons = await prisma.lesson.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
          { content: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      include: {
        module: {
          include: {
            part: true,
          },
        },
      },
      take: limit,
      orderBy: { order: "asc" },
    });

    // 2. Search Modules
    const modules = await prisma.module.findMany({
      where: {
        title: { contains: searchTerm, mode: "insensitive" },
      },
      include: {
        part: true,
        topics: {
          include: {
            lessons: {
              take: 1,
              orderBy: { order: "asc" },
            },
          },
        },
      },
      take: 5,
    });

    // 3. Search Topics
    const topics = await prisma.topic.findMany({
      where: {
        title: { contains: searchTerm, mode: "insensitive" },
      },
      include: {
        module: true,
        lessons: {
          take: 1,
          orderBy: { order: "asc" },
        },
      },
      take: 5,
    });

    const lessonResults: SearchResultItem[] = lessons.map((l) => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      description: l.description,
      moduleTitle: l.module.title,
      partTitle: l.module.part.title,
      type: "lesson",
      href: `/learn/system-design/${l.slug}`,
    }));

    const moduleResults: SearchResultItem[] = modules.map((m) => {
      const firstLesson = m.topics[0]?.lessons[0];
      return {
        id: m.id,
        slug: m.slug,
        title: m.title,
        partTitle: m.part.title,
        type: "module",
        href: firstLesson ? `/learn/system-design/${firstLesson.slug}` : `/courses/system-design`,
      };
    });

    const topicResults: SearchResultItem[] = topics.map((t) => {
      const firstLesson = t.lessons[0];
      return {
        id: t.id,
        slug: t.slug,
        title: t.title,
        moduleTitle: t.module.title,
        type: "topic",
        href: firstLesson ? `/learn/system-design/${firstLesson.slug}` : `/courses/system-design`,
      };
    });

    return {
      lessons: lessonResults,
      topics: topicResults,
      modules: moduleResults,
      total: lessonResults.length + topicResults.length + moduleResults.length,
    };
  } catch (error) {
    console.error("Search query failed:", error);
    return { lessons: [], topics: [], modules: [], total: 0 };
  }
}
