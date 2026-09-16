import React, { ComponentPropsWithoutRef } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { CodeBlock } from "./CodeBlock";
import {
  Callout,
  BestPractice,
  CommonMistake,
  InterviewNote,
  KeyTakeaway,
  Tip,
  Summary,
} from "./Callout";

const mdxComponents = {
  // Custom Callout components
  Callout,
  BestPractice,
  CommonMistake,
  InterviewNote,
  KeyTakeaway,
  Tip,
  Summary,

  // Code blocks & inline code
  pre: ({ children }: ComponentPropsWithoutRef<"pre">) => {
    if (React.isValidElement(children) && children.type === "code") {
      const codeProps = children.props as { className?: string; children?: React.ReactNode };
      const className = codeProps.className || "";
      const match = /language-(\w+)/.exec(className);
      const language = match ? match[1] : "text";
      return <CodeBlock language={language}>{String(codeProps.children || "")}</CodeBlock>;
    }
    return <pre className="my-4 overflow-x-auto p-4 rounded-xl bg-dark-card text-slate-200">{children}</pre>;
  },

  code: ({ className, children, ...props }: ComponentPropsWithoutRef<"code">) => {
    const match = /language-(\w+)/.exec(className || "");
    if (match) {
      return <CodeBlock language={match[1]}>{String(children)}</CodeBlock>;
    }
    return (
      <code
        className="px-1.5 py-0.5 rounded bg-dark-card/90 text-purple-300 border border-dark-border font-mono text-[0.85em]"
        {...props}
      >
        {children}
      </code>
    );
  },

  // Diagrams & Images
  img: ({ src, alt, ...props }: ComponentPropsWithoutRef<"img">) => {
    return (
      <figure className="my-6 rounded-xl overflow-hidden border border-dark-border2 bg-dark-card/70 p-3 sm:p-5 text-center shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt || "Architectural Diagram"}
          className="mx-auto max-h-[520px] w-auto object-contain rounded-lg transition-transform hover:scale-[1.01]"
          loading="lazy"
          {...props}
        />
        {alt && (
          <figcaption className="mt-3 text-xs text-slate-400 font-mono italic tracking-wide">
            {alt}
          </figcaption>
        )}
      </figure>
    );
  },

  // Responsive Tables
  table: ({ children }: ComponentPropsWithoutRef<"table">) => (
    <div className="overflow-x-auto my-6 rounded-xl border border-dark-border2 bg-dark-card/40 shadow-sm">
      <table className="w-full text-left text-xs sm:text-sm text-slate-300 divide-y divide-dark-border">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: ComponentPropsWithoutRef<"thead">) => (
    <thead className="bg-dark-card/80 text-slate-200 font-semibold uppercase text-[11px] tracking-wider">
      {children}
    </thead>
  ),
  th: ({ children }: ComponentPropsWithoutRef<"th">) => <th className="px-4 py-3">{children}</th>,
  td: ({ children }: ComponentPropsWithoutRef<"td">) => (
    <td className="px-4 py-3 border-t border-dark-border/60 text-slate-300 leading-relaxed">
      {children}
    </td>
  ),

  // Blockquotes
  blockquote: ({ children }: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className="my-5 border-l-4 border-l-cx-purple/60 pl-4 py-1 text-slate-300 italic bg-dark-card/30 rounded-r-lg">
      {children}
    </blockquote>
  ),

  // Styled Headings with anchor targets
  h1: ({ children, id }: ComponentPropsWithoutRef<"h1">) => (
    <h1 id={id} className="text-2xl sm:text-3xl font-extrabold text-white mt-10 mb-4 tracking-tight scroll-mt-20">
      {children}
    </h1>
  ),
  h2: ({ children, id }: ComponentPropsWithoutRef<"h2">) => (
    <h2
      id={id}
      className="text-xl sm:text-2xl font-bold text-slate-100 mt-8 mb-3 tracking-tight border-b border-dark-border/60 pb-2 scroll-mt-20 flex items-center justify-between"
    >
      <span>{children}</span>
    </h2>
  ),
  h3: ({ children, id }: ComponentPropsWithoutRef<"h3">) => (
    <h3 id={id} className="text-base sm:text-lg font-bold text-slate-200 mt-6 mb-2 tracking-tight scroll-mt-20">
      {children}
    </h3>
  ),

  // Paragraphs & Lists
  p: ({ children }: ComponentPropsWithoutRef<"p">) => (
    <p className="my-3 text-slate-300 leading-relaxed text-sm sm:text-base">{children}</p>
  ),
  ul: ({ children }: ComponentPropsWithoutRef<"ul">) => (
    <ul className="my-3 list-disc pl-6 space-y-1.5 text-slate-300 text-sm sm:text-base">{children}</ul>
  ),
  ol: ({ children }: ComponentPropsWithoutRef<"ol">) => (
    <ol className="my-3 list-decimal pl-6 space-y-1.5 text-slate-300 text-sm sm:text-base">{children}</ol>
  ),
  li: ({ children }: ComponentPropsWithoutRef<"li">) => (
    <li className="leading-relaxed">{children}</li>
  ),
  hr: () => <hr className="my-8 border-dark-border2" />,
};

interface MDXRendererProps {
  source: string;
}

export async function MDXRenderer({ source }: MDXRendererProps) {
  try {
    return (
      <div className="prose prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-cx-purple hover:prose-a:text-purple-300">
        <MDXRemote
          source={source}
          components={mdxComponents}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }]],
            },
          }}
        />
      </div>
    );
  } catch (err) {
    console.error("MDX rendering error:", err);
    return (
      <div className="p-4 rounded-xl bg-dark-card border border-dark-border text-slate-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">
        {source}
      </div>
    );
  }
}
