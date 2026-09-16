import { NextRequest, NextResponse } from "next/server";
import { searchContent } from "@/lib/search";

export const dynamic = "force-dynamic";

// In-memory sliding window rate limiter for search endpoint
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 searches per minute per IP
const ipRequestMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = ipRequestMap.get(ip);

  if (!record || now > record.resetAt) {
    ipRequestMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  record.count += 1;
  return false;
}

// Clean up stale IP records periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    ipRequestMap.forEach((record, ip) => {
      if (now > record.resetAt) {
        ipRequestMap.delete(ip);
      }
    });
  }, 5 * 60 * 1000);
}

export async function GET(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        {
          error: "Too many search requests. Please slow down.",
          code: "RATE_LIMITED",
        },
        { status: 429 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const rawQ = searchParams.get("q") || "";

    // Input sanitization: Trim and truncate max 100 chars
    const q = rawQ.trim().slice(0, 100);

    if (!q || q.length < 2) {
      return NextResponse.json({
        data: {
          query: q,
          results: { lessons: [], topics: [], modules: [] },
          total: 0,
        },
      });
    }

    const results = await searchContent(q);

    return NextResponse.json(
      {
        data: {
          query: q,
          results: {
            lessons: results.lessons,
            topics: results.topics,
            modules: results.modules,
          },
          total: results.total,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: "Search index temporarily unavailable", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
