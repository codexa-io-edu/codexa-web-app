"use client";

import { useEffect, useState } from "react";
import { Bookmark, Share2, Check, AlignLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TOCHeading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: TOCHeading[];
  lessonTitle?: string;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

export function TableOfContents({
  headings,
  lessonTitle,
  isBookmarked = false,
  onToggleBookmark,
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "0% 0% -65% 0%",
        threshold: 0.1,
      }
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: lessonTitle || "CODEXA Lesson",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2000);
      }
    } catch {
      // Ignored if cancelled
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <aside className="hidden xl:block w-56 sticky top-20 shrink-0 select-none max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
      <div className="space-y-4">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
          <AlignLeft className="w-3.5 h-3.5 text-cx-purple" />
          <span>On This Page</span>
        </div>

        {/* Heading Links */}
        <nav className="space-y-1 text-xs border-l border-dark-border2 pl-3">
          {headings.map((heading) => {
            const isActive = activeId === heading.id;

            return (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                className={cn(
                  "block py-1 leading-snug transition-all truncate",
                  heading.level === 3 ? "pl-3 text-[11px]" : "",
                  isActive
                    ? "text-cx-purple font-semibold -ml-[13px] border-l-2 border-cx-purple pl-2.5"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                {heading.text}
              </a>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-dark-border space-y-2">
          {onToggleBookmark && (
            <button
              onClick={onToggleBookmark}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                isBookmarked
                  ? "bg-cx-purple/15 text-cx-purple border-cx-purple/40"
                  : "bg-dark-card border-dark-border text-slate-400 hover:text-white hover:border-slate-600"
              )}
            >
              <Bookmark className={cn("w-3.5 h-3.5", isBookmarked ? "fill-current" : "")} />
              <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
            </button>
          )}

          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-dark-card border border-dark-border text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-cx-success" />
                <span className="text-cx-success">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Lesson</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
