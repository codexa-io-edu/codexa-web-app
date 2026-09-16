"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, Menu, X, Bookmark, LayoutDashboard, Sparkles } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useSearch } from "@/context/SearchContext";

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onOpenSearch?: () => void;
}

export function Navbar({ onToggleSidebar, isSidebarOpen, onOpenSearch }: NavbarProps) {
  const { openSearch } = useSearch();
  const handleSearchClick = onOpenSearch || openSearch;
  return (
    <header className="sticky top-0 z-40 h-14 bg-dark-nav/95 backdrop-blur-md border-b border-dark-border px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left side: Logo & Mobile Toggle */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle curriculum sidebar"
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-card transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

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
          <span className="font-bold text-lg sm:text-xl md:text-2xl tracking-tight font-mono cx-gradient-text">
            codexa.io
          </span>
        </Link>

        {/* Tagline pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-dark-card border border-dark-border text-[11px] font-medium text-slate-400 ml-2">
          <span>FROM</span>
          <span className="text-cx-purple font-mono font-bold">CODER</span>
          <span>TO</span>
          <span className="text-cx-orange font-mono font-bold">ENGINEER</span>
        </div>
      </div>

      {/* Center: Search trigger */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={handleSearchClick}
          className="w-full h-9 px-3.5 rounded-lg bg-dark-card border border-dark-border2 hover:border-cx-purple/50 text-slate-400 hover:text-slate-200 text-xs flex items-center justify-between transition-all group shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-cx-purple transition-colors" />
            <span>Search modules, topics, architecture patterns...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-dark-surface border border-dark-border text-[10px] font-mono text-slate-400">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right side: Navigation & Auth */}
      <div className="flex items-center gap-3">
        {/* Mobile Search button */}
        <button
          onClick={handleSearchClick}
          aria-label="Search"
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-dark-card"
        >
          <Search className="w-4 h-4" />
        </button>

        <Link
          href="/courses/system-design"
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-dark-card transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-cx-orange" />
          <span>Curriculum</span>
        </Link>

        {/* Auth State via Clerk */}
        <SignedIn>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-dark-card transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-cx-purple" />
            <span className="hidden md:inline">Dashboard</span>
          </Link>
          <Link
            href="/dashboard/bookmarks"
            aria-label="Bookmarks"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-dark-card rounded-md transition-colors"
          >
            <Bookmark className="w-4 h-4" />
          </Link>
          <div className="h-4 w-px bg-dark-border mx-1" />
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-8 h-8 rounded-full ring-2 ring-cx-purple/30",
              },
            }}
          />
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <button className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-dark-card transition-colors">
              Sign In
            </button>
          </SignInButton>
          <SignInButton mode="modal">
            <button className="cx-gradient-btn px-3.5 py-1.5 rounded-lg text-white font-semibold text-xs shadow-md shadow-cx-purple/20">
              Get Started Free
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </header>
  );
}
