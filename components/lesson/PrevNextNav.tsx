import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdjacentLesson {
  slug: string;
  title: string;
}

interface PrevNextNavProps {
  courseSlug: string;
  prevLesson?: AdjacentLesson | null;
  nextLesson?: AdjacentLesson | null;
}

export function PrevNextNav({
  courseSlug,
  prevLesson,
  nextLesson,
}: PrevNextNavProps) {
  return (
    <div className="my-12 pt-8 border-t border-dark-border grid grid-cols-1 sm:grid-cols-2 gap-4">
      {prevLesson ? (
        <Link
          href={`/learn/${courseSlug}/${prevLesson.slug}`}
          className="group flex flex-col p-4 rounded-xl bg-dark-card border border-dark-border2 hover:border-cx-purple/50 transition-all text-left shadow-sm"
        >
          <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400 group-hover:text-cx-purple transition-colors mb-1">
            <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>PREVIOUS LESSON</span>
          </span>
          <span className="text-sm font-bold text-white group-hover:text-slate-100 transition-colors line-clamp-1">
            {prevLesson.title}
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}

      {nextLesson && (
        <Link
          href={`/learn/${courseSlug}/${nextLesson.slug}`}
          className="group flex flex-col p-4 rounded-xl bg-dark-card border border-dark-border2 hover:border-cx-orange/50 transition-all text-right sm:col-start-2 shadow-sm relative overflow-hidden"
        >
          <span className="flex items-center justify-end gap-1 text-[11px] font-mono text-slate-400 group-hover:text-cx-orange transition-colors mb-1">
            <span>NEXT LESSON</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </span>
          <span className="text-sm font-bold text-white group-hover:text-slate-100 transition-colors line-clamp-1">
            {nextLesson.title}
          </span>
        </Link>
      )}
    </div>
  );
}
