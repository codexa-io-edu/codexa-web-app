import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserBookmarks } from "@/actions/bookmarks";
import { Bookmark, ArrowLeft, BookOpen, Clock, ChevronRight } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Bookmarks | CODEXA.io",
  description: "Review all your saved lessons and notes on CODEXA.io.",
};

export default async function BookmarksPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard/bookmarks");
  }

  const bookmarks = await getUserBookmarks();

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 pb-20 pt-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cx-orange/10 border border-cx-orange/20 flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-cx-orange fill-cx-orange/20" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Saved Lessons
                </h1>
                <p className="text-sm text-zinc-400 mt-1">
                  {bookmarks.length === 0
                    ? "No bookmarked lessons yet"
                    : `${bookmarks.length} lesson${bookmarks.length === 1 ? "" : "s"} bookmarked for quick revision`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bookmarks Grid / Empty State */}
        {bookmarks.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-12 text-center max-w-lg mx-auto">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-500">
              <Bookmark className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No bookmarks saved yet</h3>
            <p className="text-sm text-zinc-400 mb-6">
              When reading any lesson, click the bookmark icon on the right sidebar or header to save key lessons here for quick interview revision.
            </p>
            <Link
              href="/courses/system-design"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cx-orange to-[#FF8533] text-white font-medium text-sm hover:opacity-95 shadow-lg shadow-cx-orange/20 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              Explore Curriculum
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookmarks.map((bm) => (
              <Link
                key={bm.id}
                href={`/learn/system-design/${bm.lessonSlug}`}
                className="group p-5 bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-2xl transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono text-cx-orange uppercase tracking-wider bg-cx-orange/10 px-2 py-0.5 rounded border border-cx-orange/20">
                      {bm.moduleTitle}
                    </span>
                    {bm.readingMinutes && (
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {bm.readingMinutes} min
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-zinc-200 group-hover:text-white transition-colors">
                    {bm.lessonTitle}
                  </h3>
                  {bm.description && (
                    <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                      {bm.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400 group-hover:text-zinc-200">
                  <span className="font-mono text-[11px]">Saved {new Date(bm.createdAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1 text-cx-orange group-hover:translate-x-0.5 transition-transform">
                    <span>Open Lesson</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
