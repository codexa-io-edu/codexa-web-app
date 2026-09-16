import { notFound } from "next/navigation";
import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getCourseNavigation, getLessonDetail } from "@/lib/course";
import { LessonView } from "@/components/lesson/LessonView";
import { MDXRenderer } from "@/components/mdx/MDXRenderer";

interface PageProps {
  params: {
    courseSlug: string;
    lessonSlug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const lessonData = await getLessonDetail(params.courseSlug, params.lessonSlug);
  if (!lessonData) {
    return { title: "Lesson Not Found | CODEXA.io" };
  }

  const title = `${lessonData.lesson.title} — ${lessonData.hierarchy.moduleTitle} | CODEXA.io`;
  const description =
    lessonData.lesson.description ||
    `Master ${lessonData.lesson.title} with production-grade architectural blueprints on CODEXA.io.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      siteName: "CODEXA.io",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function LessonPage({ params }: PageProps) {
  const [navigation, lessonData] = await Promise.all([
    getCourseNavigation(params.courseSlug),
    getLessonDetail(params.courseSlug, params.lessonSlug),
  ]);

  if (!navigation || !lessonData) {
    notFound();
  }

  // Freemium Access Check
  let isGated = false;
  if (!lessonData.lesson.isFreePreview) {
    try {
      const { userId } = auth();
      if (!userId) {
        isGated = true;
      }
    } catch {
      // If auth throws (e.g. placeholder keys in dev), allow free preview
      isGated = false;
    }
  }

  return (
    <LessonView
      lessonData={lessonData}
      navigation={navigation}
      isGated={isGated}
    >
      <MDXRenderer source={lessonData.lesson.content || ""} />
    </LessonView>
  );
}
