import Link from "next/link";
import { Bookmark, Clock, ArrowRight } from "lucide-react";

interface BookmarkItem {
  id: string;
  lessonId: string;
  lessonSlug: string;
  lessonTitle: string;
  moduleTitle: string;
  partTitle: string;
  readingMinutes: number | null;
  createdAt: Date;
}

interface BookmarkListProps {
  bookmarks: BookmarkItem[];
}

export function BookmarkList({ bookmarks }: BookmarkListProps) {
  if (bookmarks.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-dark-card border border-dark-border2 text-center">
        <div className="w-10 h-10 rounded-xl bg-dark-surface flex items-center justify-center mx-auto mb-3 text-slate-500">
          <Bookmark className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-slate-200 mb-1">No Bookmarks Saved</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
          Click the Bookmark button while studying any lesson to pin critical architectures here for quick revision.
        </p>
        <Link
          href="/courses/system-design"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-cx-purple hover:underline"
        >
          <span>Browse curriculum</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {bookmarks.map((b) => (
        <Link
          key={b.id}
          href={`/learn/system-design/${b.lessonSlug}`}
          className="p-4 rounded-xl bg-dark-card hover:bg-dark-surface/70 border border-dark-border2 hover:border-cx-purple/40 transition-all flex flex-col justify-between group shadow-sm"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cx-purple truncate">
                {b.moduleTitle}
              </span>
              {b.readingMinutes && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-slate-500 shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>{b.readingMinutes}m</span>
                </span>
              )}
            </div>

            <h4 className="text-sm font-bold text-white group-hover:text-slate-100 transition-colors line-clamp-2 leading-snug">
              {b.lessonTitle}
            </h4>
          </div>

          <div className="pt-3 mt-3 border-t border-dark-border/60 flex items-center justify-between text-xs text-slate-400">
            <span className="text-[11px] text-slate-500">
              {b.partTitle}
            </span>
            <span className="flex items-center gap-1 text-cx-purple font-medium group-hover:translate-x-0.5 transition-transform text-[11px]">
              Study <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
