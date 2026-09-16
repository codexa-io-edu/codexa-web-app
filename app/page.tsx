import Image from "next/image";
import Link from "next/link";
import { BookOpen, Layers, Compass, ArrowRight, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 h-14 bg-dark-nav/90 backdrop-blur-md border-b border-dark-border px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="CODEXA Logo"
                width={32}
                height={32}
                className="object-contain w-full h-full"
                priority
              />
            </div>
            <span className="font-bold text-lg tracking-tight font-mono cx-gradient-text">
              codexa.io
            </span>
          </Link>
          <span className="hidden sm:inline-block text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cx-purple/10 text-cx-purple border border-cx-purple/20 ml-2">
            System Design
          </span>
        </div>

        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link
            href="/courses"
            className="text-slate-400 hover:text-white transition-colors"
          >
            Curriculum
          </Link>
          <div className="h-4 w-px bg-dark-border" />
          <Link
            href="/sign-in"
            className="text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/courses"
            className="cx-gradient-btn px-4 py-1.5 rounded-lg text-white font-medium text-xs shadow-lg shadow-cx-purple/20 flex items-center gap-1.5"
          >
            Start Learning <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cx-purple/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-cx-orange/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/3 w-[300px] h-[300px] bg-cx-blue/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dark-card border border-dark-border text-xs font-medium text-slate-300 mb-6">
            <span className="w-2 h-2 rounded-full bg-cx-orange animate-pulse" />
            <span>FROM</span>
            <span className="text-cx-purple font-mono font-bold">CODER</span>
            <span>TO</span>
            <span className="text-cx-orange font-mono font-bold">ENGINEER</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight sm:leading-none mb-6">
            Master System Design with <br />
            <span className="cx-gradient-text">Precision &amp; Clarity</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The documentation-first learning platform built for software engineers.
            Deep-dive into High-Level Design (HLD) and Low-Level Design (LLD) with dual-mode reading and video streaming.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
            <Link
              href="/courses"
              className="cx-gradient-btn px-6 py-3 rounded-xl text-white font-semibold text-sm shadow-xl shadow-cx-purple/25 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Explore Course Curriculum <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="px-5 py-3 rounded-xl bg-dark-card border border-dark-border text-slate-300 text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cx-orange" />
              <span>100% Free Module Previews</span>
            </div>
          </div>

          {/* 3 Core Architecture Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl text-left">
            <div className="p-6 rounded-2xl bg-dark-card border border-dark-border hover:border-cx-purple/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-cx-purple/10 border border-cx-purple/20 flex items-center justify-center text-cx-purple mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Dual Learning Mode</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Toggle seamlessly between comprehensive MDX documentation and streaming video explanations with separate progress tracking.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-dark-card border border-dark-border hover:border-cx-orange/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-cx-orange/10 border border-cx-orange/20 flex items-center justify-center text-cx-orange mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">3-Part Structure</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Curated path spanning Foundations, High-Level Distributed Architecture, and Object-Oriented Low-Level Design patterns.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-dark-card border border-dark-border hover:border-cx-blue/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-cx-blue/10 border border-cx-blue/20 flex items-center justify-center text-cx-blue mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">W3Schools Style Nav</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Persistent sticky tree sidebar with expandable modules, instant scroll tracking, and command-palette global search.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-border py-8 px-6 text-center text-xs text-slate-500">
        <p>© 2026 CODEXA.io — Production-Ready Educational Platform Architecture.</p>
      </footer>
    </div>
  );
}
