import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { getAdminAnalytics } from "@/actions/admin";
import {
  Users,
  BookOpen,
  Layers,
  Award,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Analytics & Platform Overview | CODEXA.io",
};

export default async function AdminDashboardPage() {
  const data = await getAdminAnalytics();

  if (!data) {
    return (
      <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="p-8 rounded-2xl bg-dark-card border border-dark-border max-w-md">
            <ShieldAlert className="w-10 h-10 text-cx-orange mx-auto mb-3" />
            <h2 className="text-xl font-bold text-white mb-2">Admin Data Unavailable</h2>
            <p className="text-xs text-slate-400 mb-4">
              Unable to load platform analytics. Please verify database connection.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const { overview, modules, topCompletedLessons } = data;

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Admin Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-dark-card via-dark-surface to-dark-card border border-dark-border2 shadow-lg">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cx-orange/20 text-cx-orange border border-cx-orange/30">
                PLATFORM ADMIN
              </span>
              <span className="text-xs text-slate-500 font-mono">v1.0.0</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Platform Analytics &amp; Control Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              System Design Flagship Track &bull; Real-time engagement and syllabus metrics
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/lessons"
              className="cx-gradient-btn px-4 py-2.5 rounded-xl text-white font-semibold text-xs shadow-lg shadow-cx-purple/20 flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>Manage Curriculum</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-dark-card border border-dark-border2 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Registered Learners</span>
              <Users className="w-4 h-4 text-cx-purple" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {overview.totalUsers}
            </div>
            <p className="text-[11px] text-slate-400">Total accounts on platform</p>
          </div>

          <div className="p-5 rounded-2xl bg-dark-card border border-dark-border2 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Total Lessons Live</span>
              <BookOpen className="w-4 h-4 text-cx-blue" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {overview.totalLessons}
            </div>
            <p className="text-[11px] text-slate-400">MDX blueprints + videos</p>
          </div>

          <div className="p-5 rounded-2xl bg-dark-card border border-dark-border2 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Architectural Modules</span>
              <Layers className="w-4 h-4 text-cx-orange" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {overview.totalModules}
            </div>
            <p className="text-[11px] text-slate-400">Across 3 core parts</p>
          </div>

          <div className="p-5 rounded-2xl bg-dark-card border border-dark-border2 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Total Completions</span>
              <Award className="w-4 h-4 text-cx-success" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {overview.totalCompletions}
            </div>
            <p className="text-[11px] text-slate-400">
              Read: {overview.readingCompletions} &bull; Video: {overview.videoCompletions}
            </p>
          </div>
        </div>

        {/* 2-Column Split: Top Lessons & Module Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Module Breakdown (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white tracking-tight">
                Curriculum Modules ({modules.length})
              </h2>
              <Link
                href="/admin/lessons"
                className="text-xs text-cx-purple hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Edit lessons in table</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="rounded-2xl bg-dark-card border border-dark-border2 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 divide-y divide-dark-border">
                  <thead className="bg-dark-nav/80 text-slate-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Module Name</th>
                      <th className="px-4 py-3">Part</th>
                      <th className="px-4 py-3 text-right">Lessons</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border/60">
                    {modules.map((m) => (
                      <tr key={m.id} className="hover:bg-dark-surface/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-white">
                          {m.title}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-surface text-slate-300 border border-dark-border">
                            {m.partTitle}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-200">
                          {m.lessonCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Top Completed Lessons (1 col) */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white tracking-tight">
              Top Completed Lessons
            </h2>

            <div className="p-5 rounded-2xl bg-dark-card border border-dark-border2 space-y-3">
              {topCompletedLessons.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <Sparkles className="w-6 h-6 text-cx-purple mx-auto mb-2" />
                  <p>Students are currently exploring the 140 lessons.</p>
                </div>
              ) : (
                topCompletedLessons.map((lesson, idx) => (
                  <div
                    key={lesson.id}
                    className="p-3 rounded-xl bg-dark-surface/60 border border-dark-border flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] font-mono text-slate-500 block">
                        #{idx + 1} &bull; {lesson.moduleTitle}
                      </span>
                      <span className="font-semibold text-white truncate block">
                        {lesson.title}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-cx-purple px-2 py-0.5 rounded bg-cx-purple/10">
                      {lesson.completions} ✓
                    </span>
                  </div>
                ))
              )}

              <div className="pt-3 border-t border-dark-border">
                <Link
                  href="/courses/system-design"
                  target="_blank"
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-dark-surface hover:bg-dark-border text-xs text-slate-300 hover:text-white transition-colors border border-dark-border"
                >
                  <span>Preview Public Syllabus</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-dark-border py-8 text-center text-xs text-slate-500 mt-16">
        <p>© 2026 CODEXA.io — Admin Operations &amp; Curriculum Governance.</p>
      </footer>
    </div>
  );
}
