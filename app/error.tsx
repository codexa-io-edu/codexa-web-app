"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected client/SSR errors for monitoring
    console.error("Application error captured by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Red ambient warning glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-red-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-lg mx-auto">
        <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-red-400 mb-4">
          <span>500: UNHANDLED_SYSTEM_FAULT</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Something went wrong
        </h1>

        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
          An unexpected error occurred while executing this operation. The incident has been recorded.
        </p>

        {error.digest && (
          <p className="text-xs font-mono text-zinc-500 mb-6 bg-zinc-900/60 py-1.5 px-3 rounded border border-zinc-800/80 inline-block">
            Digest ID: {error.digest}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cx-orange to-[#FF8533] text-white text-sm font-semibold hover:opacity-95 shadow-lg shadow-cx-orange/25 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-white text-sm font-medium transition-all"
          >
            <Home className="w-4 h-4 text-zinc-400" />
            CODEXA Home
          </Link>
        </div>
      </div>
    </div>
  );
}
