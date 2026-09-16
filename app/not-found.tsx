import Link from "next/link";
import { Terminal, Home, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-cx-orange/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[450px] h-[300px] bg-cx-purple/10 rounded-full blur-[130px] pointer-events-none" />

      {/* 404 Status Badge */}
      <div className="relative z-10 text-center max-w-lg mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-cx-orange mb-6 shadow-sm">
          <Terminal className="w-3.5 h-3.5" />
          <span>HTTP 404: NODE_NOT_FOUND</span>
        </div>

        <h1 className="text-7xl sm:text-8xl font-extrabold tracking-tight font-mono text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600 mb-4">
          404
        </h1>

        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
          Architecture Route Not Found
        </h2>

        <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
          The requested system node, lesson, or resource does not exist in the CODEXA registry or may have been reorganized.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-white text-sm font-medium transition-all shadow-sm"
          >
            <Home className="w-4 h-4 text-zinc-400" />
            Home
          </Link>

          <Link
            href="/courses/system-design"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cx-orange to-[#FF8533] text-white text-sm font-semibold hover:opacity-95 shadow-lg shadow-cx-orange/25 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            Browse Curriculum
          </Link>
        </div>

        {/* Helpful Tip */}
        <div className="mt-12 pt-6 border-t border-zinc-800/80 text-xs text-zinc-500 flex items-center justify-center gap-2">
          <span>Press</span>
          <kbd className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[11px]">
            ⌘K
          </kbd>
          <span>anywhere on CODEXA to open Global Search</span>
        </div>
      </div>
    </div>
  );
}
