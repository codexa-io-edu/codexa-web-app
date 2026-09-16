"use client";

import { useState } from "react";
import { Play, Sparkles, ExternalLink } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  provider?: "YOUTUBE" | "BUNNY";
  title?: string | null;
  durationSeconds?: number | null;
  onProgressUpdate?: (watchedSeconds: number) => void;
  initialResumeSeconds?: number;
}

export function VideoPlayer({
  videoUrl,
  provider = "YOUTUBE",
  title,
  durationSeconds,
  initialResumeSeconds = 0,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Helper to extract YouTube embed ID
  const getEmbedUrl = (url: string, resumeAt = 0) => {
    let videoId = "";
    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1]?.split("&")[0] || "";
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
    }

    if (!videoId) {
      // Fallback default system design video
      videoId = "F2FmTdLtv_A";
    }

    const startParam = resumeAt > 0 ? `&start=${resumeAt}` : "";
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1${startParam}`;
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="my-6 space-y-4">
      {/* 16:9 Aspect Ratio Video Box */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-dark-border2 shadow-2xl group">
        {!isPlaying ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0e0e1a] via-[#141424] to-[#0a0a14] p-6 text-center">
            {/* Background decorative glow */}
            <div className="absolute w-72 h-72 bg-cx-orange/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center max-w-lg">
              <button
                onClick={() => setIsPlaying(true)}
                aria-label="Play video lecture"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-cx-orange to-cx-purple text-white flex items-center justify-center shadow-xl shadow-cx-orange/25 hover:scale-105 transition-all mb-4 group/btn"
              >
                <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current translate-x-0.5 group-hover/btn:scale-110 transition-transform" />
              </button>

              <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 leading-snug">
                {title || "Architectural Video Walkthrough"}
              </h3>

              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                {durationSeconds && (
                  <span className="px-2 py-0.5 rounded bg-dark-card border border-dark-border">
                    Duration: {formatDuration(durationSeconds)}
                  </span>
                )}
                {initialResumeSeconds > 0 && (
                  <span className="px-2 py-0.5 rounded bg-cx-purple/20 text-cx-purple border border-cx-purple/30">
                    Resume at {formatDuration(initialResumeSeconds)}
                  </span>
                )}
                <span className="text-[11px] text-slate-500">
                  {provider === "BUNNY" ? "Bunny.net Stream" : "YouTube Stream"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <iframe
            src={getEmbedUrl(videoUrl, initialResumeSeconds)}
            title={title || "Lesson Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0"
          />
        )}
      </div>

      {/* Video Footer info */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cx-orange" />
          <span>Interactive Dual-Mode Streaming</span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-slate-200 transition-colors"
          >
            <span>Open in new tab</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
