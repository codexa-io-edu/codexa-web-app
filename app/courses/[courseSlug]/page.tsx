import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { Navbar } from "@/components/layout/Navbar";
import { getCourseNavigation } from "@/lib/course";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Sparkles,
  ChevronRight,
} from "lucide-react";

interface CoursePageProps {
  params: {
    courseSlug: string;
  };
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const navigation = await getCourseNavigation(params.courseSlug);
  if (!navigation) return { title: "Course Not Found | CODEXA.io" };

  const title = `${navigation.title} Masterclass | CODEXA.io`;
  const description =
    "Complete System Design curriculum covering Foundations, High-Level Architecture (HLD), and Low-Level Design (LLD) with production blueprints.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "CODEXA.io",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CourseOverviewPage({ params }: CoursePageProps) {
  const { userId } = auth();
  const navigation = await getCourseNavigation(params.courseSlug);

  if (!navigation) {
    notFound();
  }

  // Calculate total lessons and first lesson link
  let totalLessons = 0;
  let firstLessonSlug = "what-is-system-design";

  for (const part of navigation.parts) {
    for (const mod of part.modules) {
      for (const topic of mod.topics) {
        if (totalLessons === 0 && topic.lessons.length > 0) {
          firstLessonSlug = topic.lessons[0].slug;
        }
        totalLessons += topic.lessons.length;
      }
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-12">
        {/* Course Header Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-dark-card via-dark-surface to-dark-card border border-dark-border2 relative overflow-hidden shadow-2xl mb-12">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cx-purple/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cx-orange/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dark-card border border-dark-border text-xs font-semibold text-cx-purple mb-4">
              <Sparkles className="w-3.5 h-3.5 text-cx-orange" />
              <span>FLAGSHIP CURRICULUM</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
              {navigation.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8">
              Master High-Level Design (HLD) and Low-Level Design (LLD) with real-world architecture blueprints, interactive diagrams, and interview walkthroughs.
            </p>

            {/* Metrics pills */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300 mb-8">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-card border border-dark-border">
                <Layers className="w-3.5 h-3.5 text-cx-purple" />
                <span>3 Core Parts</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-card border border-dark-border">
                <BookOpen className="w-3.5 h-3.5 text-cx-blue" />
                <span>{totalLessons} In-Depth Lessons</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-card border border-dark-border">
                <Clock className="w-3.5 h-3.5 text-cx-orange" />
                <span>~40 Hours of Material</span>
              </span>
            </div>

            <Link
              href={`/learn/${navigation.slug}/${firstLessonSlug}`}
              className="cx-gradient-btn inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm shadow-xl shadow-cx-purple/25"
            >
              <span>Start Learning Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Detailed Curriculum Syllabus */}
        <div className="space-y-10">
          <div className="border-b border-dark-border pb-4 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Curriculum Roadmap
            </h2>
            <span className="text-xs font-mono text-slate-400">
              {totalLessons} lessons across {navigation.parts.length} parts
            </span>
          </div>

          <div className="space-y-8">
            {navigation.parts.map((part) => (
              <div
                key={part.id}
                className="rounded-2xl bg-dark-card/70 border border-dark-border2 overflow-hidden shadow-sm"
              >
                <div className="px-6 py-4 bg-dark-nav/60 border-b border-dark-border flex items-center justify-between">
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cx-purple" />
                    {part.title}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {part.modules.length} Modules
                  </span>
                </div>

                <div className="p-6 space-y-6">
                  {part.modules.map((mod) => (
                    <div key={mod.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-slate-200">
                          {mod.title}
                        </h4>
                        <span className="text-xs text-slate-500 font-mono">
                          {mod.topics.reduce((acc, t) => acc + t.lessons.length, 0)} lessons
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {mod.topics.map((topic) =>
                          topic.lessons.map((lesson) => (
                            <Link
                              key={lesson.id}
                              href={`/learn/${navigation.slug}/${lesson.slug}`}
                              className="flex items-center justify-between p-2.5 rounded-lg bg-dark-surface/40 hover:bg-dark-surface border border-dark-border/60 hover:border-cx-purple/40 text-xs transition-all group"
                            >
                              <div className="flex items-center gap-2 min-w-0 pr-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 group-hover:text-cx-purple transition-colors shrink-0" />
                                <span className="text-slate-300 group-hover:text-white truncate">
                                  {lesson.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {!userId && lesson.isFreePreview && (
                                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-cx-orange/15 text-cx-orange border border-cx-orange/20">
                                    Free
                                  </span>
                                )}
                                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5" />
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-dark-border py-8 text-center text-xs text-slate-500 mt-16">
        <p>© 2026 CODEXA.io — Master System Design &amp; Distributed Architecture.</p>
      </footer>
    </div>
  );
}
