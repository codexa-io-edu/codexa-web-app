import Link from "next/link";
import { ArrowRight, BookOpen, Video, PlayCircle } from "lucide-react";

interface ContinueLearningProps {
  lesson: {
    lessonSlug: string;
    lessonTitle: string;
    moduleTitle: string;
    courseSlug: string;
    readingPercent: number;
    videoPercent: number;
  };
}

export function ContinueLearning({ lesson }: ContinueLearningProps) {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-dark-card via-dark-surface/80 to-dark-card border border-dark-border2 shadow-xl relative overflow-hidden group">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cx-purple/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cx-purple/15 transition-all" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cx-purple px-2 py-0.5 rounded bg-cx-purple/15 border border-cx-purple/30">
              {lesson.moduleTitle}
            </span>
            <span className="text-xs text-slate-400">Jump back in</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug group-hover:text-slate-100">
            {lesson.lessonTitle}
          </h3>

          {/* Dual Progress Bars */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-mono">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-cx-purple" /> Reading
                </span>
                <span className="text-slate-200 font-semibold">{lesson.readingPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-dark-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cx-purple to-cx-blue rounded-full transition-all"
                  style={{ width: `${lesson.readingPercent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-mono">
                <span className="flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-cx-orange" /> Video
                </span>
                <span className="text-slate-200 font-semibold">{lesson.videoPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-dark-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cx-orange to-cx-purple rounded-full transition-all"
                  style={{ width: `${lesson.videoPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Link
          href={`/learn/${lesson.courseSlug}/${lesson.lessonSlug}`}
          className="cx-gradient-btn inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm shadow-lg shadow-cx-purple/25 shrink-0 hover:scale-102 transition-transform"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Resume Lesson</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
