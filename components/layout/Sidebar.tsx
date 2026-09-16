"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  BookOpen,
  Video,
} from "lucide-react";
import { CourseNavigationData } from "@/types/course";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";

interface SidebarProps {
  navigation: CourseNavigationData;
  courseSlug?: string;
  activeLessonSlug?: string;
  completedLessonIds?: string[];
  readingProgressPercent?: number;
  videoProgressPercent?: number;
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  navigation,
  courseSlug = "system-design",
  activeLessonSlug,
  completedLessonIds = [],
  readingProgressPercent = 0,
  videoProgressPercent = 0,
  isOpenOnMobile = false,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  // Find active lesson from slug or pathname
  const currentSlug = useMemo(() => {
    if (activeLessonSlug) return activeLessonSlug;
    const parts = pathname.split("/");
    return parts[parts.length - 1];
  }, [activeLessonSlug, pathname]);

  // Set of completed lesson IDs for O(1) lookup
  const completedSet = useMemo(() => new Set(completedLessonIds), [completedLessonIds]);

  // Initial expansion state: find which Part, Module, Topic contains the current lesson
  const activeAncestors = useMemo(() => {
    let partId: string | null = null;
    let moduleId: string | null = null;
    let topicId: string | null = null;

    for (const part of navigation.parts) {
      for (const mod of part.modules) {
        for (const topic of mod.topics) {
          for (const lesson of topic.lessons) {
            if (lesson.slug === currentSlug) {
              partId = part.id;
              moduleId = mod.id;
              topicId = topic.id;
              break;
            }
          }
        }
      }
    }
    return { partId, moduleId, topicId };
  }, [navigation, currentSlug]);

  const [expandedParts, setExpandedParts] = useState<Record<string, boolean>>({});
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  // Auto-expand ancestors when active lesson changes or on load
  useEffect(() => {
    if (activeAncestors.partId) {
      setExpandedParts((prev) => ({ ...prev, [activeAncestors.partId!]: true }));
    } else if (navigation.parts.length > 0) {
      // Default expand the first part
      setExpandedParts((prev) => ({ ...prev, [navigation.parts[0].id]: true }));
    }

    if (activeAncestors.moduleId) {
      setExpandedModules((prev) => ({ ...prev, [activeAncestors.moduleId!]: true }));
    }

    if (activeAncestors.topicId) {
      setExpandedTopics((prev) => ({ ...prev, [activeAncestors.topicId!]: true }));
    }
  }, [activeAncestors, navigation.parts]);

  const togglePart = (id: string) => {
    setExpandedParts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleTopic = (id: string) => {
    setExpandedTopics((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-dark-sidebar border-r border-dark-border select-none">
      {/* Course Title & Progress Header */}
      <div className="p-4 border-b border-dark-border bg-dark-nav/50">
        <Link
          href={`/courses/${courseSlug}`}
          className="group block"
        >
          <span className="text-[10px] font-mono uppercase tracking-wider text-cx-purple font-semibold">
            Curriculum
          </span>
          <h2 className="text-sm font-bold text-white group-hover:text-cx-purple transition-colors truncate">
            {navigation.title}
          </h2>
        </Link>

        {/* Dual Progress Bars */}
        <div className="mt-3.5 space-y-2">
          <div>
            <div className="flex justify-between items-center text-[11px] mb-1">
              <span className="flex items-center gap-1 text-slate-400">
                <BookOpen className="w-3 h-3 text-cx-purple" /> Reading Progress
              </span>
              <span className="font-mono text-slate-300 font-semibold">{readingProgressPercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-dark-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cx-purple to-cx-blue rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, readingProgressPercent))}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-[11px] mb-1">
              <span className="flex items-center gap-1 text-slate-400">
                <Video className="w-3 h-3 text-cx-orange" /> Video Progress
              </span>
              <span className="font-mono text-slate-300 font-semibold">{videoProgressPercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-dark-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cx-orange to-cx-purple rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, videoProgressPercent))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tree */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-2">
        {navigation.parts.map((part) => {
          const isPartOpen = expandedParts[part.id] ?? true;

          return (
            <div key={part.id} className="space-y-1">
              {/* Part Heading */}
              <button
                onClick={() => togglePart(part.id)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-dark-card/60 transition-colors text-xs font-bold uppercase tracking-wider"
              >
                <span className="truncate">{part.title}</span>
                {isPartOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                )}
              </button>

              {/* Modules inside Part */}
              {isPartOpen && (
                <div className="space-y-1 pl-1">
                  {part.modules.map((mod) => {
                    const isModuleOpen = expandedModules[mod.id] ?? false;

                    return (
                      <div key={mod.id} className="space-y-0.5">
                        {/* Module Button */}
                        <button
                          onClick={() => toggleModule(mod.id)}
                          className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-dark-card text-xs font-semibold text-left transition-colors group"
                        >
                          <span className="truncate pr-1 group-hover:text-cx-purple transition-colors">
                            {mod.title}
                          </span>
                          {isModuleOpen ? (
                            <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />
                          )}
                        </button>

                        {/* Topics inside Module */}
                        {isModuleOpen && (
                          <div className="pl-2 space-y-1 border-l border-dark-border ml-2.5 my-1">
                            {mod.topics.map((topic) => {
                              const isTopicOpen = expandedTopics[topic.id] ?? true;

                              return (
                                <div key={topic.id} className="space-y-0.5">
                                  {/* Topic Button */}
                                  <button
                                    onClick={() => toggleTopic(topic.id)}
                                    className="w-full flex items-center justify-between px-2 py-1 rounded text-slate-400 hover:text-slate-200 text-[11px] font-medium text-left transition-colors"
                                  >
                                    <span className="truncate pr-1">{topic.title}</span>
                                    {isTopicOpen ? (
                                      <ChevronDown className="w-2.5 h-2.5 text-slate-600 shrink-0" />
                                    ) : (
                                      <ChevronRight className="w-2.5 h-2.5 text-slate-600 shrink-0" />
                                    )}
                                  </button>

                                  {/* Lessons inside Topic */}
                                  {isTopicOpen && (
                                    <div className="space-y-0.5 pl-1">
                                      {topic.lessons.map((lesson) => {
                                        const isActive = lesson.slug === currentSlug;
                                        const isCompleted = completedSet.has(lesson.id);

                                        return (
                                          <Link
                                            key={lesson.id}
                                            href={`/learn/${courseSlug}/${lesson.slug}`}
                                            onClick={onCloseMobile}
                                            className={cn(
                                              "flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-all group relative",
                                              isActive
                                                ? "bg-cx-purple/15 text-white font-semibold border border-cx-purple/30 shadow-sm"
                                                : "text-slate-400 hover:text-slate-200 hover:bg-dark-card"
                                            )}
                                          >
                                            <div className="flex items-center gap-2 min-w-0 pr-1">
                                              {isCompleted ? (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-cx-success shrink-0" />
                                              ) : isActive ? (
                                                <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                                                  <div className="w-2 h-2 rounded-full bg-cx-purple animate-pulse" />
                                                </div>
                                              ) : (
                                                <Circle className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 shrink-0" />
                                              )}
                                              <span className="truncate leading-snug">
                                                {lesson.title}
                                              </span>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                              {!isSignedIn && lesson.isFreePreview && (
                                                <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-cx-orange/15 text-cx-orange border border-cx-orange/25">
                                                  Free
                                                </span>
                                              )}
                                              {lesson.readingTimeMinutes && (
                                                <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                                                  {lesson.readingTimeMinutes}m
                                                </span>
                                              )}
                                            </div>
                                          </Link>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-72 h-[calc(100vh-3.5rem)] sticky top-14 shrink-0 overflow-hidden">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenOnMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-80 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
