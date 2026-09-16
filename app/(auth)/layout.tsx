import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-cx-orange/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[300px] bg-cx-purple/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 text-center relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 group mb-3">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-lg shadow-cx-orange/20 transition-transform group-hover:scale-105 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="CODEXA Logo"
              width={44}
              height={44}
              className="object-contain w-full h-full"
              priority
            />
          </div>
          <span className="text-2xl font-bold tracking-wider font-mono cx-gradient-text">
            codexa.io
          </span>
        </Link>
        <p className="text-sm text-zinc-400 max-w-xs mx-auto">
          Production-grade system design & engineering mastery.
        </p>
      </div>

      {/* Auth Component Container */}
      <div className="relative z-10 w-full flex justify-center">
        {children}
      </div>

      {/* Footer link */}
      <div className="mt-8 text-center text-xs text-zinc-500 relative z-10">
        <Link href="/" className="hover:text-zinc-300 transition-colors">
          &larr; Back to CODEXA.io Home
        </Link>
      </div>
    </div>
  );
}
