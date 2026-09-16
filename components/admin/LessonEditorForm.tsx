"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ExternalLink, ArrowLeft, Loader2, Check } from "lucide-react";
import { updateLessonContent } from "@/actions/admin";

interface LessonEditorProps {
  lesson: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    content: string | null;
    isPublished: boolean;
    isFreePreview: boolean;
    videoUrl: string | null;
    moduleTitle: string;
    partTitle: string;
  };
}

export function LessonEditorForm({ lesson }: LessonEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState(lesson.description || "");
  const [content, setContent] = useState(lesson.content || "");
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl || "");
  const [isPublished, setIsPublished] = useState(lesson.isPublished);
  const [isFreePreview, setIsFreePreview] = useState(lesson.isFreePreview);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readingTimeEstimate = Math.max(1, Math.ceil(wordCount / 200));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    const res = await updateLessonContent(lesson.id, {
      title,
      description,
      content,
      videoUrl: videoUrl.trim() || undefined,
      isPublished,
      isFreePreview,
    });

    setIsSaving(false);
    if (res.success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-dark-card border border-dark-border2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-dark-surface hover:bg-dark-border text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase block">
              {lesson.partTitle} &bull; {lesson.moduleTitle}
            </span>
            <span className="text-sm font-bold text-white truncate max-w-sm block">
              Editing: {title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`/learn/system-design/${lesson.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl bg-dark-surface hover:bg-dark-border text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1.5 border border-dark-border"
          >
            <span>Preview Live</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="submit"
            disabled={isSaving}
            className="cx-gradient-btn px-5 py-2 rounded-xl text-white font-semibold text-xs shadow-lg shadow-cx-purple/20 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Meta Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title & Description */}
        <div className="p-6 rounded-2xl bg-dark-card border border-dark-border2 space-y-4">
          <h3 className="text-sm font-bold text-white tracking-tight">Lesson Metadata</h3>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Lesson Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl bg-dark-surface border border-dark-border text-white text-sm focus:border-cx-purple outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Tagline / Subtitle</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl bg-dark-surface border border-dark-border text-white text-sm focus:border-cx-purple outline-none resize-none"
            />
          </div>
        </div>

        {/* Video & Publishing Controls */}
        <div className="p-6 rounded-2xl bg-dark-card border border-dark-border2 space-y-4">
          <h3 className="text-sm font-bold text-white tracking-tight">Media &amp; Access Controls</h3>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Attached Video Stream URL</label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or Bunny.net URL"
              className="w-full px-3.5 py-2 rounded-xl bg-dark-surface border border-dark-border text-white text-sm font-mono focus:border-cx-purple outline-none"
            />
          </div>

          <div className="pt-2 grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-dark-surface border border-dark-border flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Published</span>
                <span className="text-[10px] text-slate-500">Visible to learners</span>
              </div>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 accent-cx-purple cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-xl bg-dark-surface border border-dark-border flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Free Preview</span>
                <span className="text-[10px] text-slate-500">Unauthenticated</span>
              </div>
              <input
                type="checkbox"
                checked={isFreePreview}
                onChange={(e) => setIsFreePreview(e.target.checked)}
                className="w-4 h-4 accent-cx-orange cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* MDX Markdown Editor */}
      <div className="p-6 rounded-2xl bg-dark-card border border-dark-border2 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-tight">Lesson MDX Markdown</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-surface text-slate-400">
              Supports CodeBlocks, SVG Diagrams &amp; 6 Custom Callouts
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span>{wordCount} words</span>
            <span>&bull;</span>
            <span>~{readingTimeEstimate} min read</span>
          </div>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={24}
          className="w-full p-4 rounded-xl bg-dark-bg border border-dark-border font-mono text-xs sm:text-sm text-slate-200 leading-relaxed focus:border-cx-purple outline-none resize-y"
          placeholder="# Enter your markdown and architectural blueprints here..."
        />
      </div>
    </form>
  );
}
