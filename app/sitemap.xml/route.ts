import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://codexa.io";

  try {
    const lessons = await prisma.lesson.findMany({
      where: { isPublished: true },
      select: {
        slug: true,
        updatedAt: true,
        course: {
          select: {
            slug: true,
          },
        },
      },
    });

    const urls = [
      `  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,
      `  <url>
    <loc>${baseUrl}/courses/system-design</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`,
      ...lessons.map(
        (l) => `  <url>
    <loc>${baseUrl}/learn/${l.course.slug}/${l.slug}</loc>
    <lastmod>${l.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
      ),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}
