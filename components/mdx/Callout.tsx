import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Target,
  Key,
  Lightbulb,
  FileText,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CalloutType =
  | "best-practice"
  | "common-mistake"
  | "interview-note"
  | "key-takeaway"
  | "tip"
  | "summary"
  | "info"
  | "warning";

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const calloutConfigs: Record<
  CalloutType,
  {
    borderClass: string;
    bgClass: string;
    titleColor: string;
    icon: React.ReactNode;
    defaultTitle: string;
  }
> = {
  "best-practice": {
    borderClass: "border-l-4 border-l-emerald-500 border-dark-border2",
    bgClass: "bg-emerald-500/[0.08]",
    titleColor: "text-emerald-400",
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    defaultTitle: "Best Practice",
  },
  "common-mistake": {
    borderClass: "border-l-4 border-l-red-500 border-dark-border2",
    bgClass: "bg-red-500/[0.08]",
    titleColor: "text-red-400",
    icon: <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />,
    defaultTitle: "Common Mistake",
  },
  "interview-note": {
    borderClass: "border-l-4 border-l-cx-purple border-dark-border2",
    bgClass: "bg-cx-purple/[0.10]",
    titleColor: "text-purple-300",
    icon: <Target className="w-4 h-4 text-cx-purple shrink-0" />,
    defaultTitle: "Interview Tip & Deep Dive",
  },
  "key-takeaway": {
    borderClass: "border-l-4 border-l-amber-500 border-dark-border2",
    bgClass: "bg-amber-500/[0.08]",
    titleColor: "text-amber-400",
    icon: <Key className="w-4 h-4 text-amber-400 shrink-0" />,
    defaultTitle: "Key Takeaway",
  },
  tip: {
    borderClass: "border-l-4 border-l-blue-500 border-dark-border2",
    bgClass: "bg-blue-500/[0.08]",
    titleColor: "text-blue-400",
    icon: <Lightbulb className="w-4 h-4 text-blue-400 shrink-0" />,
    defaultTitle: "Pro Tip",
  },
  summary: {
    borderClass: "border-l-4 border-l-slate-400 border-dark-border2",
    bgClass: "bg-slate-500/[0.08]",
    titleColor: "text-slate-300",
    icon: <FileText className="w-4 h-4 text-slate-400 shrink-0" />,
    defaultTitle: "Summary",
  },
  info: {
    borderClass: "border-l-4 border-l-blue-400 border-dark-border2",
    bgClass: "bg-blue-500/[0.08]",
    titleColor: "text-blue-300",
    icon: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
    defaultTitle: "Note",
  },
  warning: {
    borderClass: "border-l-4 border-l-amber-500 border-dark-border2",
    bgClass: "bg-amber-500/[0.08]",
    titleColor: "text-amber-400",
    icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
    defaultTitle: "Warning",
  },
};

export function Callout({ type = "info", title, children, className }: CalloutProps) {
  const config = calloutConfigs[type] || calloutConfigs.info;
  const displayTitle = title || config.defaultTitle;

  return (
    <div
      className={cn(
        "my-5 rounded-r-xl border p-4 shadow-sm transition-colors",
        config.borderClass,
        config.bgClass,
        className
      )}
    >
      <div className="flex items-center gap-2 mb-2 font-semibold text-sm">
        {config.icon}
        <span className={config.titleColor}>{displayTitle}</span>
      </div>
      <div className="text-sm text-slate-300 leading-relaxed space-y-2 [&>p]:my-1.5 [&>ul]:my-2 [&>ul]:list-disc [&>ul]:pl-5">
        {children}
      </div>
    </div>
  );
}

// Dedicated exported variants for direct MDX tag usage
export const BestPractice = (props: Omit<CalloutProps, "type">) => (
  <Callout type="best-practice" {...props} />
);

export const CommonMistake = (props: Omit<CalloutProps, "type">) => (
  <Callout type="common-mistake" {...props} />
);

export const InterviewNote = (props: Omit<CalloutProps, "type">) => (
  <Callout type="interview-note" {...props} />
);

export const KeyTakeaway = (props: Omit<CalloutProps, "type">) => (
  <Callout type="key-takeaway" {...props} />
);

export const Tip = (props: Omit<CalloutProps, "type">) => (
  <Callout type="tip" {...props} />
);

export const Summary = (props: Omit<CalloutProps, "type">) => (
  <Callout type="summary" {...props} />
);
