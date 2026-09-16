import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { ContinueLearning } from "@/components/dashboard/ContinueLearning";
import { CourseProgressRing } from "@/components/dashboard/CourseProgressRing";
import { BookmarkList } from "@/components/dashboard/BookmarkList";
import { getStudentDashboardData } from "@/lib/dashboard";
import {
  Flame,
  BookOpen,
  Bookmark,
  Award,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { SignInButton } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Student Dashboard | CODEXA.io",
  description: "Track your System Design curriculum progress, resume watching, and access bookmarked architectures.",
};

export default async function DashboardPage() {
  const dashboardData = await getStudentDashboardData();

  // If unauthenticated, show a sign-in gateway
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="max-w-md p-8 rounded-3xl bg-dark-card border border-dark-border2 shadow-2xl space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-cx-purple/15 text-cx-purple flex items-center justify-center mx-auto border border-cx-purple/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Student Dashboard</h2>
              <p className="text-sm text-slate-400">
                Sign in to view your real-time learning progress, continue where you left off, and manage your bookmarks.
              </p>
            </div>
            <SignInButton mode="modal">
              <button className="cx-gradient-btn w-full py-3 rounded-xl text-white font-semibold text-sm shadow-lg shadow-cx-purple/20">
                Sign In to Dashboard
              </button>
            </SignInButton>
          </div>
        </main>
      </div>
    );
  }

  const { user, stats, continueLearning, recentBookmarks } = dashboardData;

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Welcome Hero Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-dark-card via-dark-surface to-dark-card border border-dark-border2 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cx-orange via-cx-purple to-cx-blue flex items-center justify-center text-white font-mono font-bold text-xl shadow-lg shadow-cx-purple/20 shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Welcome back, {user.name}
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cx-purple/20 text-cx-purple border border-cx-purple/30">
                  STUDENT
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Architectural track: <strong className="text-slate-200">System Design (HLD &amp; LLD)</strong>
              </p>
            </div>
          </div>

          {/* Active streak */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-dark-bg/80 border border-dark-border shrink-0 self-start sm:self-auto">
            <div className="w-8 h-8 rounded-xl bg-cx-orange/15 text-cx-orange flex items-center justify-center">
              <Flame className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500 block font-semibold">
                Streak
              </span>
              <span className="text-sm font-bold text-white font-mono">
                {stats.currentStreak} Day
              </span>
            </div>
          </div>
        </div>

        {/* Top KPI Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-dark-card border border-dark-border2 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Completed</span>
              <Award className="w-4 h-4 text-cx-purple" />
            </div>
            <div className="text-2xl font-extrabold text-white font-mono">
              {stats.totalLessonsCompleted}
              <span className="text-xs text-slate-500 font-normal"> / {stats.totalCourseLessons}</span>
            </div>
            <p className="text-[11px] text-slate-400">Architectural modules</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-dark-card border border-dark-border2 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Reading Track</span>
              <BookOpen className="w-4 h-4 text-cx-blue" />
            </div>
            <div className="text-2xl font-extrabold text-white font-mono">
              {stats.overallReadingPercent}%
            </div>
            <p className="text-[11px] text-slate-400">Notes &amp; blueprints</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-dark-card border border-dark-border2 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Video Track</span>
              <Sparkles className="w-4 h-4 text-cx-orange" />
            </div>
            <div className="text-2xl font-extrabold text-white font-mono">
              {stats.overallVideoPercent}%
            </div>
            <p className="text-[11px] text-slate-400">Streamed explanations</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-dark-card border border-dark-border2 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Bookmarks</span>
              <Bookmark className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-white font-mono">
              {stats.totalBookmarks}
            </div>
            <p className="text-[11px] text-slate-400">Saved lessons</p>
          </div>
        </div>

        {/* Continue Learning Section */}
        {continueLearning && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Resume Learning
            </h2>
            <ContinueLearning lesson={continueLearning} />
          </div>
        )}

        {/* Progress Breakdown */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Overall Curriculum Breakdown
          </h2>
          <CourseProgressRing
            readingPercent={stats.overallReadingPercent}
            videoPercent={stats.overallVideoPercent}
            totalCompleted={stats.totalLessonsCompleted}
            totalLessons={stats.totalCourseLessons}
          />
        </div>

        {/* Recent Bookmarks Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Saved Lessons ({recentBookmarks.length})
            </h2>
            <Link
              href="/courses/system-design"
              className="text-xs text-cx-purple hover:underline font-semibold flex items-center gap-1"
            >
              <span>Explore full syllabus</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <BookmarkList bookmarks={recentBookmarks} />
        </div>
      </main>

      <footer className="border-t border-dark-border py-8 text-center text-xs text-slate-500 mt-16">
        <p>© 2026 CODEXA.io — Master System Design &amp; Distributed Architecture.</p>
      </footer>
    </div>
  );
}
