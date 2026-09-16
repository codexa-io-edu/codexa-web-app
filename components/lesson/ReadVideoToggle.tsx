"use client";

import { BookOpen, Video, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type LearningMode = "READING" | "VIDEO";

interface ReadVideoToggleProps {
  mode: LearningMode;
  onModeChange: (newMode: LearningMode) => void;
  isReadingCompleted?: boolean;
  isVideoCompleted?: boolean;
  readingMinutes?: number | null;
  videoDurationSeconds?: number | null;
}

export function ReadVideoToggle({
  mode,
  onModeChange,
  isReadingCompleted = false,
  isVideoCompleted = false,
  readingMinutes,
  videoDurationSeconds,
}: ReadVideoToggleProps) {
  const formatVideoTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    return `${mins}m`;
  };

  return (
    <div className="inline-flex items-center p-1 rounded-xl bg-dark-card border border-dark-border2 shadow-md">
      {/* Reading Mode Button */}
      <button
        onClick={() => onModeChange("READING")}
        aria-pressed={mode === "READING"}
        className={cn(
          "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
          mode === "READING"
            ? "bg-gradient-to-r from-cx-purple to-cx-blue text-white shadow-md shadow-cx-purple/20"
            : "text-slate-400 hover:text-slate-200 hover:bg-dark-surface/60"
        )}
      >
        <BookOpen className="w-3.5 h-3.5" />
        <span>Reading Mode</span>
        {readingMinutes && (
          <span
            className={cn(
              "text-[10px] font-mono px-1.5 py-0.2 rounded",
              mode === "READING" ? "bg-white/20 text-white" : "bg-dark-surface text-slate-500"
            )}
          >
            {readingMinutes}m
          </span>
        )}
        {isReadingCompleted && (
          <CheckCircle2
            className={cn("w-3.5 h-3.5", mode === "READING" ? "text-white" : "text-cx-success")}
          />
        )}
      </button>

      {/* Video Mode Button */}
      <button
        onClick={() => onModeChange("VIDEO")}
        aria-pressed={mode === "VIDEO"}
        className={cn(
          "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
          mode === "VIDEO"
            ? "bg-gradient-to-r from-cx-orange to-cx-purple text-white shadow-md shadow-cx-orange/20"
            : "text-slate-400 hover:text-slate-200 hover:bg-dark-surface/60"
        )}
      >
        <Video className="w-3.5 h-3.5" />
        <span>Video Mode</span>
        {videoDurationSeconds && (
          <span
            className={cn(
              "text-[10px] font-mono px-1.5 py-0.2 rounded",
              mode === "VIDEO" ? "bg-white/20 text-white" : "bg-dark-surface text-slate-500"
            )}
          >
            {formatVideoTime(videoDurationSeconds)}
          </span>
        )}
        {isVideoCompleted && (
          <CheckCircle2
            className={cn("w-3.5 h-3.5", mode === "VIDEO" ? "text-white" : "text-cx-success")}
          />
        )}
      </button>
    </div>
  );
}
