# 🔌 CODEXA.io — Phase 6: REST API Design

---

## Architecture Decision: Server Actions vs API Routes

Before the endpoint list, a key Next.js 14 architectural split:

| Type | Used For | Why |
|---|---|---|
| **Next.js Server Actions** | Mutations (progress save, bookmark toggle, admin CRUD) | No network round-trip, built-in CSRF protection, callable directly from Server/Client Components |
| **API Routes** (`/api/*`) | Data reads, external-facing endpoints, search, webhooks | Cacheable, RESTful, callable by external tools |

This is the **industry best practice** for Next.js 14 App Router apps — not everything needs to be an API route.

---

## API Overview

| Group | Prefix | Auth | Count |
|---|---|---|---|
| Course | `/api/courses` | Public | 3 |
| Lesson | `/api/learn` | Public + Freemium | 2 |
| Search | `/api/search` | Public | 1 |
| Progress | Server Actions | 🔐 Student | 4 |
| Bookmark | Server Actions + API | 🔐 Student | 4 |
| Dashboard | `/api/dashboard` | 🔐 Student | 1 |
| Admin Content | `/api/admin` | 👑 Admin | 14 |
| Admin Upload | `/api/admin/upload` | 👑 Admin | 2 |
| Admin Analytics | `/api/admin/analytics` | 👑 Admin | 1 |
| Webhooks | `/api/webhooks` | Signed | 2 |
| **Total** | | | **~34 endpoints + Server Actions** |

---

## Authentication & Authorization

All protected endpoints use **Clerk middleware**. The `middleware.ts` file protects routes globally:

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/courses(.*)',
  '/api/courses(.*)',
  '/api/search(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

const isAdminRoute = createRouteMatcher(['/admin(.*)', '/api/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    const { userId, sessionClaims } = await auth()
    if (!userId || sessionClaims?.role !== 'ADMIN') {
      return Response.redirect(new URL('/', req.url), 403)
    }
  }
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})
```

### Standard Response Envelope

All API routes return a consistent shape:

```typescript
// Success
{ "data": { ... }, "meta": { ... } }

// Error
{ "error": { "code": "LESSON_NOT_FOUND", "message": "Lesson not found", "status": 404 } }
```

---

## Group 1 — Course API (Public)

### `GET /api/courses`
List all published courses.

**Response:**
```json
{
  "data": [
    {
      "id": "clx...",
      "slug": "system-design",
      "title": "System Design",
      "description": "Master system design from HLD to LLD",
      "thumbnailUrl": "https://r2.codexa.io/courses/system-design/thumb.png",
      "isPaid": false,
      "totalLessons": 212,
      "totalModules": 15,
      "estimatedHours": 40
    }
  ]
}
```
**Cache:** `revalidate: 3600` (ISR — 1 hour)

---

### `GET /api/courses/:slug`
Full course structure for the sidebar and course overview page.

**Response:**
```json
{
  "data": {
    "id": "clx...",
    "slug": "system-design",
    "title": "System Design",
    "parts": [
      {
        "id": "clx...",
        "slug": "hld",
        "title": "High Level Design",
        "order": 2,
        "modules": [
          {
            "id": "clx...",
            "slug": "consistency-vs-availability",
            "title": "Consistency vs Availability",
            "order": 3,
            "topics": [
              {
                "id": "clx...",
                "slug": "data-consistency-models",
                "title": "Data Consistency Models",
                "order": 1,
                "lessons": [
                  {
                    "id": "clx...",
                    "slug": "strong-consistency",
                    "title": "Strong Consistency",
                    "isFreePreview": false,
                    "order": 1,
                    "readingTimeMinutes": 8
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```
**Cache:** `revalidate: 3600` (ISR — rebuilds when admin publishes content)
**Used by:** Sidebar, Course Overview page

---

### `GET /api/courses/:slug/progress` 🔐 Student
Returns the authenticated user's completion state for every lesson in the course. Merged with sidebar data client-side.

**Response:**
```json
{
  "data": {
    "courseId": "clx...",
    "overallPercent": 42,
    "lessonProgress": {
      "clx_lesson_1": { "readingPercent": 100, "videoPercent": 75, "isCompleted": true },
      "clx_lesson_2": { "readingPercent": 60, "videoPercent": 0, "isCompleted": false }
    }
  }
}
```
**Cache:** No cache (user-specific)

---

## Group 2 — Lesson API (Public / Freemium)

### `GET /api/learn/:courseSlug/:lessonSlug`
Fetch a single lesson's full content. Applies freemium gate.

**Auth Logic:**
```
1. Fetch lesson from DB
2. If lesson.isFreePreview === true → return content (no auth needed)
3. If lesson.isFreePreview === false:
   a. Check Clerk session → no session? Return 401 + { gate: "signup" }
   b. Check enrollment → not enrolled? Return 403 + { gate: "enroll" }
   c. Return full lesson content ✓
```

**Response (authenticated, full access):**
```json
{
  "data": {
    "lesson": {
      "id": "clx...",
      "slug": "strong-consistency",
      "title": "Strong Consistency",
      "description": "Every read returns the most recent write.",
      "content": "# Strong Consistency\n\n...(MDX string)...",
      "defaultMode": "READING",
      "readingTimeMinutes": 8,
      "isFreePreview": false,
      "isPublished": true,
      "topic": { "id": "clx...", "title": "Data Consistency Models", "slug": "data-consistency-models" },
      "module": { "id": "clx...", "title": "Consistency vs Availability", "slug": "consistency-vs-availability" },
      "part": { "id": "clx...", "title": "High Level Design", "slug": "hld" },
      "course": { "id": "clx...", "title": "System Design", "slug": "system-design" }
    },
    "video": {
      "provider": "YOUTUBE",
      "videoUrl": "https://youtube.com/watch?v=xyz",
      "thumbnailUrl": "https://img.youtube.com/vi/xyz/maxresdefault.jpg",
      "durationSeconds": 752
    },
    "assets": [
      {
        "filename": "strong-consistency-timeline.svg",
        "url": "https://r2.codexa.io/lessons/strong-consistency/timeline.svg",
        "type": "SVG",
        "alt": "Strong consistency timeline diagram"
      }
    ],
    "navigation": {
      "prev": { "slug": "data-consistency-overview", "title": "Data Consistency Models", "topicSlug": "data-consistency-models" },
      "next": { "slug": "eventual-consistency", "title": "Eventual Consistency", "topicSlug": "data-consistency-models" }
    },
    "userProgress": {
      "readingPercent": 60,
      "videoPercent": 35,
      "isReadingCompleted": false,
      "isVideoCompleted": false,
      "lastWatchedSeconds": 263
    }
  }
}
```

**Response (freemium gate — unauthenticated on non-free lesson):**
```json
{
  "error": {
    "code": "FREEMIUM_GATE",
    "message": "Sign up to continue learning",
    "status": 401,
    "gate": "signup"
  }
}
```
**Cache:** No cache (personalized per user)

---

### `GET /api/learn/:courseSlug/:lessonSlug/adjacent`
Lightweight prev/next navigation (used by PrevNextNav component).

**Response:**
```json
{
  "data": {
    "prev": { "slug": "eventual-consistency", "title": "Eventual Consistency" },
    "next": { "slug": "consistency-levels", "title": "Consistency Levels" }
  }
}
```

---

## Group 3 — Search API (Public)

### `GET /api/search?q=:query&courseId=:courseId`

**Query params:**
- `q` — search term (min 2 chars)
- `courseId` — optional, filter to a specific course

**Response:**
```json
{
  "data": {
    "query": "consistency",
    "results": {
      "lessons": [
        {
          "id": "clx...",
          "slug": "strong-consistency",
          "title": "Strong Consistency",
          "description": "Every read returns the most recent write.",
          "module": "Consistency vs Availability",
          "topic": "Data Consistency Models",
          "part": "HLD",
          "rank": 0.89
        }
      ],
      "topics": [
        {
          "slug": "data-consistency-models",
          "title": "Data Consistency Models",
          "module": "Consistency vs Availability"
        }
      ]
    },
    "total": 12,
    "took": "8ms"
  }
}
```
**Implementation:** PostgreSQL `tsvector @@ plainto_tsquery` with `ts_rank`
**Cache:** Edge cache 60s (same query = same results)
**Rate limit:** 30 requests/minute per IP

---

## Group 4 — Progress (Server Actions) 🔐 Student

Server Actions live in `actions/progress.ts`. No HTTP round-trip — called directly from React components.

### `saveReadingProgress(lessonId, scrollPercent)`
Called on scroll events (debounced 2s).

```typescript
// actions/progress.ts
'use server'
export async function saveReadingProgress(lessonId: string, scrollPercent: number) {
  const { userId } = await auth()
  await prisma.readingProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: {
      scrollPercent,
      isCompleted: scrollPercent >= 90,
      completedAt: scrollPercent >= 90 ? new Date() : undefined,
      lastViewedAt: new Date(),
    },
    create: { userId, lessonId, scrollPercent, isCompleted: scrollPercent >= 90 },
  })
}
```

### `saveVideoProgress(lessonId, watchedSeconds, durationSeconds)`
Called every 10 seconds during video playback.

```typescript
export async function saveVideoProgress(
  lessonId: string,
  watchedSeconds: number,
  durationSeconds: number
) {
  const percent = Math.round((watchedSeconds / durationSeconds) * 100)
  await prisma.videoProgress.upsert({ ... })
}
```

### `markLessonComplete(lessonId, mode: 'READING' | 'VIDEO')`
Explicit "Mark Complete" button.

### `getResumePosition(lessonId)`
Returns video `watchedSeconds` for resume playback.

---

## Group 5 — Bookmarks (Server Actions + API) 🔐 Student

### `GET /api/bookmarks` — List user's bookmarks
```json
{
  "data": [
    {
      "id": "clx...",
      "lessonId": "clx...",
      "lesson": {
        "slug": "strong-consistency",
        "title": "Strong Consistency",
        "module": "Consistency vs Availability",
        "part": "HLD"
      },
      "createdAt": "2024-09-15T18:30:00Z"
    }
  ]
}
```

### `toggleBookmark(lessonId)` — Server Action
Creates or deletes bookmark (upsert/delete pattern).

```typescript
// actions/bookmarks.ts
'use server'
export async function toggleBookmark(lessonId: string) {
  const { userId } = await auth()
  const existing = await prisma.bookmark.findUnique({
    where: { userId_lessonId: { userId, lessonId } }
  })
  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } })
    return { bookmarked: false }
  } else {
    await prisma.bookmark.create({ data: { userId, lessonId } })
    return { bookmarked: true }
  }
}
```

---

## Group 6 — Dashboard API 🔐 Student

### `GET /api/dashboard`
All data needed for the student dashboard in one request.

**Response:**
```json
{
  "data": {
    "continueLearning": {
      "lessonSlug": "eventual-consistency",
      "lessonTitle": "Eventual Consistency",
      "courseSlug": "system-design",
      "module": "Consistency vs Availability",
      "readingPercent": 60,
      "videoPercent": 35,
      "lastViewedAt": "2024-09-15T20:30:00Z"
    },
    "courseProgress": [
      {
        "courseSlug": "system-design",
        "courseTitle": "System Design",
        "totalLessons": 212,
        "completedLessons": 89,
        "readingPercent": 42,
        "videoPercent": 21
      }
    ],
    "stats": {
      "totalLessonsCompleted": 89,
      "totalReadingMinutes": 420,
      "bookmarkCount": 14,
      "currentStreak": 5
    },
    "recentBookmarks": [ /* last 5 bookmarks */ ]
  }
}
```
**Cache:** No cache (user-specific, real-time)

---

## Group 7 — Admin Content API 👑 Admin

All Admin APIs require `role: ADMIN` checked server-side.

### Courses
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/courses` | List all courses |
| `POST` | `/api/admin/courses` | Create course |
| `PATCH` | `/api/admin/courses/:id` | Update course |
| `DELETE` | `/api/admin/courses/:id` | Delete course |

### Parts, Modules, Topics
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/admin/parts` | Create part |
| `PATCH` | `/api/admin/parts/:id` | Update / reorder part |
| `POST` | `/api/admin/modules` | Create module |
| `PATCH` | `/api/admin/modules/:id` | Update / reorder |
| `PATCH` | `/api/admin/modules/reorder` | Drag & drop reorder (bulk) |
| `POST` | `/api/admin/topics` | Create topic |
| `PATCH` | `/api/admin/topics/:id` | Update / reorder |

### Lessons (most complex)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/lessons` | List with filters |
| `POST` | `/api/admin/lessons` | Create lesson |
| `GET` | `/api/admin/lessons/:id` | Get full lesson for editor |
| `PATCH` | `/api/admin/lessons/:id` | Update lesson content |
| `PATCH` | `/api/admin/lessons/:id/publish` | Toggle published |
| `DELETE` | `/api/admin/lessons/:id` | Delete lesson |
| `PATCH` | `/api/admin/lessons/reorder` | Drag & drop reorder (bulk) |

**Reorder request body (drag & drop):**
```json
{
  "items": [
    { "id": "clx_lesson_1", "order": 0 },
    { "id": "clx_lesson_3", "order": 1 },
    { "id": "clx_lesson_2", "order": 2 }
  ]
}
```

### Create/Update Lesson — Request Body
```json
{
  "topicId": "clx...",
  "slug": "strong-consistency",
  "title": "Strong Consistency",
  "description": "Every read returns the most recent write.",
  "content": "# Strong Consistency\n\n...(MDX string)...",
  "isFreePreview": false,
  "defaultMode": "READING",
  "readingTimeMinutes": 8,
  "video": {
    "provider": "YOUTUBE",
    "videoUrl": "https://youtube.com/watch?v=dQw4w9WgXcQ",
    "thumbnailUrl": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    "durationSeconds": 752
  }
}
```

---

## Group 8 — Admin Asset Upload 👑 Admin

### `POST /api/admin/upload/presign`
Generate a Cloudflare R2 presigned URL for client-side direct upload.

**Request:**
```json
{ "filename": "strong-consistency-timeline.svg", "contentType": "image/svg+xml", "lessonId": "clx..." }
```

**Response:**
```json
{
  "data": {
    "presignedUrl": "https://r2.codexa.io/upload?X-Amz-Signature=...",
    "r2Key": "lessons/strong-consistency/strong-consistency-timeline.svg",
    "publicUrl": "https://assets.codexa.io/lessons/strong-consistency/strong-consistency-timeline.svg"
  }
}
```

### `POST /api/admin/upload/confirm`
After successful R2 upload, save asset record to DB.

```json
{ "lessonId": "clx...", "r2Key": "...", "url": "...", "type": "SVG", "alt": "...", "filename": "..." }
```

---

## Group 9 — Admin Analytics 👑 Admin

### `GET /api/admin/analytics?period=30d`

**Response:**
```json
{
  "data": {
    "period": "30d",
    "users": {
      "total": 1420,
      "newThisPeriod": 234,
      "active": 680
    },
    "lessons": {
      "totalCompletions": 8930,
      "avgCompletionRate": 0.67,
      "topLessons": [
        { "title": "Strong Consistency", "completions": 412, "avgReadingPercent": 88 }
      ]
    },
    "modules": {
      "completionRates": [
        { "title": "Consistency vs Availability", "rate": 0.71 }
      ]
    },
    "progressDistribution": {
      "0-25": 312,
      "26-50": 489,
      "51-75": 380,
      "76-100": 239
    }
  }
}
```

---

## Group 10 — Webhooks

### `POST /api/webhooks/clerk`
Clerk user lifecycle events (user created, deleted, updated).

```typescript
// On user.created → create User record in our DB
// On user.deleted → soft-delete User record
// Verified via Clerk webhook secret (svix signature)
```

### `POST /api/webhooks/stripe` *(Future)*
Stripe subscription events (`customer.subscription.created`, `invoice.payment_failed`, etc.)

---

## Error Code Reference

| Code | HTTP | Meaning |
|---|---|---|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FREEMIUM_GATE` | 401 | Login required for this lesson |
| `FORBIDDEN` | 403 | Authenticated but insufficient role |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `VALIDATION_ERROR` | 422 | Invalid request body |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting Strategy

Using `@upstash/ratelimit` with Upstash Redis (free tier):

| Endpoint | Limit | Window |
|---|---|---|
| `GET /api/search` | 30 requests | 1 minute |
| `POST /api/admin/*` | 60 requests | 1 minute |
| `GET /api/learn/*` | 120 requests | 1 minute |
| Progress Server Actions | 20 saves | 1 minute per user |
| Webhook endpoints | IP-allowlisted | Clerk/Stripe IPs only |

---

## Phase 6 Summary

| Category | Implementation | Count |
|---|---|---|
| API Routes | Next.js Route Handlers | ~22 |
| Server Actions | `'use server'` functions | ~8 |
| Webhooks | Signed verification | 2 |
| **Total contracts** | | **~32** |

**Key design principles applied:**
- ✅ Public endpoints use ISR caching (performance)
- ✅ User endpoints have no cache (correctness)
- ✅ Mutations are Server Actions (no CSRF, no extra round-trip)
- ✅ Admin routes role-checked at middleware + handler level (defense in depth)
- ✅ Asset uploads use presigned URLs (no file data through our server)
- ✅ Consistent error envelope across all endpoints
- ✅ Search rate-limited to prevent abuse

---

> [!IMPORTANT]
> **Awaiting your approval to proceed to Phase 7 — Frontend Development.**
>
> Phase 7 will build the app **component by component**, starting with:
> 1. Project scaffold (Next.js 14 + Tailwind + Clerk setup)
> 2. Database setup (Prisma schema + Neon connection)
> 3. Content import script (your MD files → PostgreSQL + R2)
> 4. Then UI components one by one, each requiring your approval

---
*Awaiting approval to proceed to Phase 7 — Frontend Development.*
