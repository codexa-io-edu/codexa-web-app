import { BookOpen, Video } from "lucide-react";

interface CourseProgressRingProps {
  readingPercent: number;
  videoPercent: number;
  totalCompleted: number;
  totalLessons: number;
}

export function CourseProgressRing({
  readingPercent,
  videoPercent,
  totalCompleted,
  totalLessons,
}: CourseProgressRingProps) {
  const size = 140;
  const strokeWidth = 10;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  // Outer ring: Reading
  const readingOffset = circumference - (readingPercent / 100) * circumference;

  // Inner ring: Video
  const innerRadius = radius - strokeWidth - 4;
  const innerCircumference = 2 * Math.PI * innerRadius;
  const videoOffset = innerCircumference - (videoPercent / 100) * innerCircumference;

  return (
    <div className="p-6 rounded-2xl bg-dark-card border border-dark-border2 shadow-sm flex flex-col items-center sm:flex-row sm:items-center justify-between gap-6">
      {/* SVG Dual Progress Rings */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Outer Circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#1E1E35"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Reading Progress Arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#8B5CF6"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={readingOffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />

          {/* Background Inner Circle */}
          <circle
            cx={center}
            cy={center}
            r={innerRadius}
            stroke="#1E1E35"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Video Progress Arc */}
          <circle
            cx={center}
            cy={center}
            r={innerRadius}
            stroke="#FF6B00"
            strokeWidth={strokeWidth}
            strokeDasharray={innerCircumference}
            strokeDashoffset={videoOffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-extrabold text-white font-mono leading-none">
            {totalCompleted}
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">
            /{totalLessons}
          </span>
        </div>
      </div>

      {/* Progress Breakdown Details */}
      <div className="flex-1 space-y-4 text-left">
        <div>
          <h4 className="text-sm font-bold text-white mb-1">
            Curriculum Progress
          </h4>
          <p className="text-xs text-slate-400">
            Track reading notes and video walkthrough completions independently.
          </p>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-lg bg-dark-surface/60 border border-dark-border">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cx-purple" />
              <span className="text-slate-300 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-cx-purple" /> Reading Mode
              </span>
            </div>
            <span className="font-mono font-bold text-white">{readingPercent}%</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-dark-surface/60 border border-dark-border">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cx-orange" />
              <span className="text-slate-300 flex items-center gap-1">
                <Video className="w-3.5 h-3.5 text-cx-orange" /> Video Mode
              </span>
            </div>
            <span className="font-mono font-bold text-white">{videoPercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
