"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  BookOpen,
  Layers,
  Compass,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { SearchResults, SearchResultItem } from "@/lib/search";
import { cn } from "@/lib/utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_SUGGESTIONS = [
  "Strong Consistency",
  "Eventual Consistency",
  "CAP Theorem",
  "Caching Strategies",
  "Load Balancing",
  "Design Patterns",
  "Rate Limiting",
];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults(null);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global shortcut listener: ⌘K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search query
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        if (json.data?.results) {
          setResults({
            lessons: json.data.results.lessons || [],
            topics: json.data.results.topics || [],
            modules: json.data.results.modules || [],
            total: json.data.total || 0,
          });
        }
      } catch (err) {
        console.error("Failed to fetch search results:", err);
      } finally {
        setIsLoading(false);
        setSelectedIndex(0);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query]);

  // Flatten results for keyboard navigation
  const flatItems: SearchResultItem[] = results
    ? [...results.lessons, ...results.topics, ...results.modules]
    : [];

  const handleSelect = useCallback(
    (item: SearchResultItem) => {
      onClose();
      router.push(item.href);
    },
    [onClose, router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (flatItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flatItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatItems[selectedIndex]) {
        handleSelect(flatItems[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        onKeyDown={handleKeyDown}
        className="relative w-full max-w-2xl rounded-2xl bg-dark-card border border-dark-border2 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-dark-border bg-dark-nav/60">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all lessons, topics, architecture patterns..."
            className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder:text-slate-500 outline-none"
          />
          {isLoading && <Loader2 className="w-4 h-4 text-cx-purple animate-spin shrink-0 mx-2" />}
          {query && !isLoading && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-slate-400 hover:text-white rounded-md mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 rounded bg-dark-surface border border-dark-border text-[10px] font-mono text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-dark-border/40 space-y-4">
          {/* If No query yet: Quick Suggestions */}
          {!query.trim() && (
            <div className="py-3">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-3">
                Suggested Searches
              </span>
              <div className="flex flex-wrap gap-2">
                {QUICK_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug}
                    onClick={() => setQuery(sug)}
                    className="px-3 py-1.5 rounded-lg bg-dark-surface hover:bg-dark-border text-xs text-slate-300 hover:text-white transition-colors border border-dark-border"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* If Query entered but no results found */}
          {query.trim().length >= 2 && !isLoading && results && results.total === 0 && (
            <div className="py-12 text-center text-slate-400 text-sm">
              <p className="font-semibold text-slate-300 mb-1">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-500">Try searching with a different architectural term or keyword.</p>
            </div>
          )}

          {/* Lessons Results */}
          {results && results.lessons.length > 0 && (
            <div className="pt-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cx-purple block mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3 h-3" /> Lessons ({results.lessons.length})
              </span>
              <div className="space-y-1">
                {results.lessons.map((lesson) => {
                  const itemIndex = flatItems.findIndex((i) => i.id === lesson.id && i.type === "lesson");
                  const isSelected = selectedIndex === itemIndex;

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => handleSelect(lesson)}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors group",
                        isSelected
                          ? "bg-cx-purple/15 border border-cx-purple/40 text-white"
                          : "hover:bg-dark-surface/60 text-slate-300"
                      )}
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-sm group-hover:text-white truncate">
                            {lesson.title}
                          </span>
                          {lesson.moduleTitle && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-dark-surface text-slate-400 border border-dark-border truncate hidden sm:inline-block">
                              {lesson.moduleTitle}
                            </span>
                          )}
                        </div>
                        {lesson.description && (
                          <p className="text-xs text-slate-400 line-clamp-1">
                            {lesson.description}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cx-purple shrink-0 transition-transform group-hover:translate-x-1" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Topics Results */}
          {results && results.topics.length > 0 && (
            <div className="pt-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cx-blue block mb-2 flex items-center gap-1.5">
                <Compass className="w-3 h-3" /> Topics ({results.topics.length})
              </span>
              <div className="space-y-1">
                {results.topics.map((topic) => {
                  const itemIndex = flatItems.findIndex((i) => i.id === topic.id && i.type === "topic");
                  const isSelected = selectedIndex === itemIndex;

                  return (
                    <div
                      key={topic.id}
                      onClick={() => handleSelect(topic)}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors text-xs font-medium",
                        isSelected ? "bg-cx-blue/15 text-blue-200" : "hover:bg-dark-surface/60 text-slate-300"
                      )}
                    >
                      <span className="truncate">{topic.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">
                        {topic.moduleTitle}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Modules Results */}
          {results && results.modules.length > 0 && (
            <div className="pt-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cx-orange block mb-2 flex items-center gap-1.5">
                <Layers className="w-3 h-3" /> Modules ({results.modules.length})
              </span>
              <div className="space-y-1">
                {results.modules.map((mod) => {
                  const itemIndex = flatItems.findIndex((i) => i.id === mod.id && i.type === "module");
                  const isSelected = selectedIndex === itemIndex;

                  return (
                    <div
                      key={mod.id}
                      onClick={() => handleSelect(mod)}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors text-xs font-medium",
                        isSelected ? "bg-cx-orange/15 text-orange-200" : "hover:bg-dark-surface/60 text-slate-300"
                      )}
                    >
                      <span className="truncate">{mod.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">
                        {mod.partTitle}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer keyboard tips */}
        <div className="px-4 py-2 bg-dark-nav border-t border-dark-border flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-3">
            <span><kbd className="text-slate-400">↑↓</kbd> to navigate</span>
            <span><kbd className="text-slate-400">↵</kbd> to select</span>
            <span><kbd className="text-slate-400">esc</kbd> to close</span>
          </div>
          <span className="text-cx-purple font-semibold">CODEXA Search</span>
        </div>
      </div>
    </div>
  );
}
