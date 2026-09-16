"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { TableOfContents } from "@/components/layout/TableOfContents";
import { ReadVideoToggle, LearningMode } from "@/components/lesson/ReadVideoToggle";
import { VideoPlayer } from "@/components/lesson/VideoPlayer";
import { PrevNextNav } from "@/components/lesson/PrevNextNav";
import { CourseNavigationData, BreadcrumbItem } from "@/types/course";
import { LessonDetailResult } from "@/lib/course";
import { Lock, Sparkles, ArrowRight, Bookmark } from "lucide-react";
import { SignInButton, useUser } from "@clerk/nextjs";
import { toggleBookmark } from "@/actions/bookmarks";

interface LessonViewProps {
  lessonData: LessonDetailResult;
  navigation: CourseNavigationData;
  isGated?: boolean;
  children?: React.ReactNode; // MDX content passed as pre-rendered RSC
}

export function LessonView({
  lessonData,
  navigation,
  isGated = false,
  children,
}: LessonViewProps) {
  const { isSignedIn } = useUser();
  const [mode, setMode] = useState<LearningMode>(lessonData.lesson.defaultMode || "READING");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const { lesson, video, hierarchy, navigation: adjNav, headings } = lessonData;

  const breadcrumbs: BreadcrumbItem[] = [
    { label: hierarchy.courseTitle, href: `/courses/${hierarchy.courseSlug}` },
    { label: hierarchy.partTitle },
    { label: hierarchy.moduleTitle },
    { label: hierarchy.topicTitle },
    { label: lesson.title },
  ];

  const handleBookmarkToggle = async () => {
    setIsBookmarked(!isBookmarked);
    try {
      await toggleBookmark(lesson.id);
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isSidebarOpen={isMobileSidebarOpen}
      />

      {/* Main 3-Column Layout */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Left Sidebar (Sticky tree) */}
        <Sidebar
          navigation={navigation}
          courseSlug={hierarchy.courseSlug}
          activeLessonSlug={lesson.slug}
          isOpenOnMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Center Main Content Area */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 lg:px-12 py-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            {/* Breadcrumb Navigation */}
            <Breadcrumb items={breadcrumbs} />

            {/* Lesson Header */}
            <div className="mt-4 mb-6 pb-6 border-b border-dark-border">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-cx-purple px-2 py-0.5 rounded bg-cx-purple/10 border border-cx-purple/20">
                    {hierarchy.moduleTitle}
                  </span>
                  {!isSignedIn && lesson.isFreePreview && (
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-cx-orange/15 text-cx-orange border border-cx-orange/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Free Preview
                    </span>
                  )}
                </div>

                {/* Dual Mode Toggle */}
                <ReadVideoToggle
                  mode={mode}
                  onModeChange={setMode}
                  readingMinutes={lesson.readingTimeMinutes}
                  videoDurationSeconds={video?.durationSeconds}
                />
              </div>

              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight flex-1">
                  {lesson.title}
                </h1>

                {/* Prominent Header Bookmark Button */}
                <button
                  onClick={handleBookmarkToggle}
                  aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this lesson"}
                  title={isBookmarked ? "Bookmarked (Click to remove)" : "Bookmark this lesson for revision"}
                  className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-medium shrink-0 transition-all ${
                    isBookmarked
                      ? "bg-cx-purple/20 border-cx-purple/50 text-cx-purple shadow-sm shadow-cx-purple/20"
                      : "bg-dark-card border-dark-border text-slate-400 hover:text-white hover:border-slate-600 hover:bg-dark-surface"
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-cx-purple text-cx-purple" : ""}`} />
                  <span className="hidden sm:inline">
                    {isBookmarked ? "Bookmarked" : "Bookmark"}
                  </span>
                </button>
              </div>

              {lesson.description && (
                <p className="mt-2 text-sm sm:text-base text-slate-400 leading-relaxed">
                  {lesson.description}
                </p>
              )}
            </div>

            {/* Freemium Gated Banner */}
            {isGated ? (
              <div className="my-10 p-8 rounded-2xl bg-gradient-to-br from-dark-card to-dark-surface border border-dark-border2 text-center relative overflow-hidden shadow-2xl">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-cx-purple/20 rounded-full blur-3xl pointer-events-none" />
                <div className="w-12 h-12 rounded-2xl bg-cx-purple/15 text-cx-purple flex items-center justify-center mx-auto mb-4 border border-cx-purple/30">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Create a Free Account to Continue
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
                  You have enjoyed the free preview lessons. Sign in or create a free CODEXA account to unlock the full System Design curriculum, code blueprints, and progress synchronization.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <SignInButton mode="modal">
                    <button className="cx-gradient-btn px-6 py-2.5 rounded-xl text-white font-semibold text-xs shadow-lg shadow-cx-purple/30 flex items-center gap-2">
                      <span>Sign In / Register</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </SignInButton>
                </div>
              </div>
            ) : (
              <>
                {/* Active Mode Render */}
                {mode === "READING" ? (
                  <div className="mt-6 font-sans antialiased text-slate-200">
                    {children}
                  </div>
                ) : (
                  <div className="mt-4">
                    {video ? (
                      <VideoPlayer
                        videoUrl={video.videoUrl}
                        provider={video.provider}
                        title={video.title || lesson.title}
                        durationSeconds={video.durationSeconds}
                      />
                    ) : (
                      <div className="p-8 rounded-xl bg-dark-card border border-dark-border text-center text-slate-400 text-sm">
                        No video is currently attached to this lesson. Switch to Reading Mode above.
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Prev / Next Nav */}
                <PrevNextNav
                  courseSlug={hierarchy.courseSlug}
                  prevLesson={adjNav.prevLesson}
                  nextLesson={adjNav.nextLesson}
                />
              </>
            )}
          </div>
        </main>

        {/* Right Table of Contents */}
        <TableOfContents
          headings={headings}
          lessonTitle={lesson.title}
          isBookmarked={isBookmarked}
          onToggleBookmark={handleBookmarkToggle}
        />
      </div>
    </div>
  );
}
