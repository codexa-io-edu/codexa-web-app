"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  language?: string;
  children: string;
  filename?: string;
}

export function CodeBlock({ language = "text", children, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const codeString = typeof children === "string" ? children.trim() : String(children).trim();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const displayLanguage = language.replace(/^language-/, "").toUpperCase();

  return (
    <div className="relative my-5 rounded-xl overflow-hidden border border-dark-border2 bg-[#1E1E1E] shadow-xl group">
      {/* Code Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-dark-card border-b border-dark-border text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
          {filename ? (
            <span className="text-slate-300 font-medium ml-2">{filename}</span>
          ) : (
            <span className="text-slate-400 font-bold ml-2 text-[11px] tracking-wider text-cx-purple">
              {displayLanguage}
            </span>
          )}
        </div>

        <button
          onClick={handleCopy}
          aria-label="Copy code snippet"
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-dark-surface hover:bg-dark-border text-slate-300 hover:text-white transition-all text-[11px] font-sans"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-cx-success" />
              <span className="text-cx-success font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Syntax Highlight */}
      <div className="text-[13px] font-mono leading-relaxed overflow-x-auto">
        <SyntaxHighlighter
          language={language.replace(/^language-/, "").toLowerCase()}
          style={vscDarkPlus}
          showLineNumbers={codeString.split("\n").length > 3}
          customStyle={{
            margin: 0,
            padding: "1rem 1.25rem",
            background: "transparent",
            fontSize: "13px",
            lineHeight: "1.6",
          }}
          lineNumberStyle={{
            minWidth: "2.5em",
            paddingRight: "1em",
            color: "#525266",
            userSelect: "none",
          }}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
