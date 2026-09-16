import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { LessonsTable } from "@/components/admin/LessonsTable";
import { getAdminLessons } from "@/actions/admin";
import { ChevronLeft, Layers, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Curriculum Content Management | CODEXA.io Admin",
};

export default async function AdminLessonsPage() {
  const lessons = await getAdminLessons("", 200);

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Navigation Breadcrumb back to admin */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Analytics Dashboard</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-cx-purple font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Authorization Active</span>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Layers className="w-7 h-7 text-cx-purple" />
              <span>Curriculum Content Management</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Publish, unpublish, modify freemium access, or edit MDX text and video URLs across all 140 curriculum lessons.
            </p>
          </div>
        </div>

        {/* Interactive Lessons Table */}
        <LessonsTable initialLessons={lessons} />
      </main>

      <footer className="border-t border-dark-border py-8 text-center text-xs text-slate-500 mt-16">
        <p>© 2026 CODEXA.io — Admin Content Governance.</p>
      </footer>
    </div>
  );
}
