import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { SearchProvider } from "@/context/SearchContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "CODEXA.io",
  description:
    "Master High-Level and Low-Level System Design with interactive documentation, dual-mode reading/video learning, and architecture diagrams.",
  keywords: [
    "System Design",
    "High Level Design",
    "Low Level Design",
    "HLD",
    "LLD",
    "Software Architecture",
    "Tech Interview",
    "Distributed Systems",
  ],
  authors: [{ name: "CODEXA Team" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // If Clerk publishable key is not yet set, render cleanly without throwing
  const isClerkConfigured =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("PLACEHOLDER");

  const content = (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-dark-bg text-slate-100 font-sans antialiased selection:bg-cx-purple/30 selection:text-white">
        <SearchProvider>{children}</SearchProvider>
      </body>
    </html>
  );

  if (isClerkConfigured) {
    return <ClerkProvider>{content}</ClerkProvider>;
  }

  return content;
}
