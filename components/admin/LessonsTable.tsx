"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ExternalLink, Edit, Lock, Globe } from "lucide-react";
import { togglePublishLesson, toggleFreePreview } from "@/actions/admin";
import { cn } from "@/lib/utils";

export interface AdminLessonItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  partTitle: string;
  moduleTitle: string;
  topicTitle: string;
  isPublished: boolean;
  isFreePreview: boolean;
  readingTimeMinutes: number | null;
  videoUrl: string | null;
  updatedAt: Date;
}

interface LessonsTableProps {
  initialLessons: AdminLessonItem[];
}

export function LessonsTable({ initialLessons }: LessonsTableProps) {
  const [lessons, setLessons] = useState<AdminLessonItem[]>(initialLessons);
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredLessons = lessons.filter(
    (l) =>
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.moduleTitle.toLowerCase().includes(search.toLowerCase()) ||
      l.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleTogglePublish = async (id: string) => {
    setLoadingId(id);
    const res = await togglePublishLesson(id);
    if (res.success) {
      setLessons((prev) =>
        prev.map((l) => (l.id === id ? { ...l, isPublished: res.isPublished! } : l))
      );
    }
    setLoadingId(null);
  };

  const handleToggleFreePreview = async (id: string) => {
    setLoadingId(id);
    const res = await toggleFreePreview(id);
    if (res.success) {
      setLessons((prev) =>
        prev.map((l) => (l.id === id ? { ...l, isFreePreview: res.isFreePreview! } : l))
      );
    }
    setLoadingId(null);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-dark-card border border-dark-border2 shadow-sm">
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by title, module, or slug..."
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
          />
        </div>
        <span className="text-xs font-mono text-slate-400">
          Showing {filteredLessons.length} of {lessons.length} lessons
        </span>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-dark-card border border-dark-border2 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 divide-y divide-dark-border">
            <thead className="bg-dark-nav/90 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="px-4 py-3">Lesson Title</th>
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Access</th>
                <th className="px-4 py-3 text-center">Video</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/60">
              {filteredLessons.map((l) => {
                const isLoading = loadingId === l.id;

                return (
                  <tr key={l.id} className="hover:bg-dark-surface/50 transition-colors">
                    {/* Title */}
                    <td className="px-4 py-3 max-w-[260px]">
                      <div className="font-bold text-white truncate">{l.title}</div>
                      <div className="text-[10px] font-mono text-slate-500 truncate">{l.slug}</div>
                    </td>

                    {/* Module & Part */}
                    <td className="px-4 py-3 max-w-[200px]">
                      <div className="text-slate-200 truncate">{l.moduleTitle}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">{l.partTitle}</div>
                    </td>

                    {/* Status Toggle */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleTogglePublish(l.id)}
                        disabled={isLoading}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all",
                          l.isPublished
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                            : "bg-slate-500/15 text-slate-400 border border-slate-500/30 hover:bg-slate-500/25"
                        )}
                      >
                        {l.isPublished ? "Published" : "Draft"}
                      </button>
                    </td>

                    {/* Access (Free / Pro) Toggle */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleFreePreview(l.id)}
                        disabled={isLoading}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 mx-auto",
                          l.isFreePreview
                            ? "bg-cx-orange/15 text-cx-orange border border-cx-orange/30 hover:bg-cx-orange/25"
                            : "bg-purple-500/15 text-purple-400 border border-purple-500/30 hover:bg-purple-500/25"
                        )}
                      >
                        {l.isFreePreview ? (
                          <>
                            <Globe className="w-3 h-3" />
                            <span>Free Preview</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" />
                            <span>Registered</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Video Attachment */}
                    <td className="px-4 py-3 text-center font-mono">
                      {l.videoUrl ? (
                        <span className="text-cx-success text-[11px] font-semibold">Attached</span>
                      ) : (
                        <span className="text-slate-600 text-[11px]">None</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/lessons/${l.id}/edit`}
                          className="p-1.5 rounded-lg bg-dark-surface hover:bg-dark-border text-slate-300 hover:text-white transition-colors"
                          title="Edit Lesson Content"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/learn/system-design/${l.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-dark-surface hover:bg-dark-border text-slate-300 hover:text-white transition-colors"
                          title="View Live Lesson"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
