# 🗄️ CODEXA.io — Phase 5: Database Design

---

## ✅ Phase 4 Decisions Locked In

| Decision | Choice |
|---|---|
| Freemium gate | First lesson of **each module** is free |
| Default mode | **Reading** mode |
| Lesson ordering | **Drag & drop** (numeric `order` field) |
| Content import | **Automated seed script** from your MD files |
| Search | PostgreSQL Full-Text Search (`pg_trgm` + `tsvector`) |
| Deployment | Vercel + Neon PostgreSQL |
| Folder structure | Next.js App Router, feature-collocated |

---

## Entity Relationship Overview

```
User
 ├── ReadingProgress  (one per lesson)
 ├── VideoProgress    (one per lesson)
 ├── Bookmark         (many lessons)
 ├── Enrollment       (one per course)
 └── Subscription     (future: Stripe)

Course
 └── Part
      └── Module
           └── Topic
                └── Lesson
                     ├── VideoMetadata (one)
                     └── LessonAsset   (many: images, SVGs)
```

---

## Table Count: 13 Tables

| # | Table | Purpose |
|---|---|---|
| 1 | `User` | Auth identity + preferences (linked to Clerk) |
| 2 | `Course` | Top-level course (System Design, future DSA, Java…) |
| 3 | `Part` | Course sub-division (Introduction, HLD, LLD) |
| 4 | `Module` | Topic grouping (e.g., "Consistency vs Availability") |
| 5 | `Topic` | Sub-grouping (e.g., "Data Consistency Models") |
| 6 | `Lesson` | Individual lesson with MDX content |
| 7 | `VideoMetadata` | Video URL, provider, duration, thumbnail |
| 8 | `LessonAsset` | Images & SVGs stored in Cloudflare R2 |
| 9 | `ReadingProgress` | Scroll % + completion per user per lesson |
| 10 | `VideoProgress` | Watch seconds + completion per user per lesson |
| 11 | `Bookmark` | User-saved lessons |
| 12 | `Enrollment` | User ↔ Course access (free now, paid later) |
| 13 | `Subscription` | Stripe subscription (future monetization) |

---

## Full Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Required for Neon (pooled vs direct)
}

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

enum Role {
  STUDENT
  ADMIN
}

enum LearningMode {
  READING
  VIDEO
}

enum VideoProvider {
  YOUTUBE   // Placeholder during development
  BUNNY     // Production: Bunny.net HLS
}

enum AssetType {
  IMAGE
  SVG
  DIAGRAM
}

enum EnrollmentStatus {
  ACTIVE
  EXPIRED
  CANCELLED
}

enum SubscriptionPlan {
  FREE
  PRO
}

enum SubscriptionStatus {
  ACTIVE
  CANCELLED
  PAST_DUE
  TRIALING
}

// ─────────────────────────────────────────────
// USER
// ─────────────────────────────────────────────

model User {
  id            String       @id @default(cuid())
  clerkId       String       @unique  // Clerk's user ID — primary auth reference
  email         String       @unique
  name          String?
  imageUrl      String?
  role          Role         @default(STUDENT)
  defaultMode   LearningMode @default(READING)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  // Relations
  readingProgress  ReadingProgress[]
  videoProgress    VideoProgress[]
  bookmarks        Bookmark[]
  enrollments      Enrollment[]
  subscription     Subscription?

  @@index([clerkId])
  @@index([email])
  @@map("users")
}

// ─────────────────────────────────────────────
// COURSE HIERARCHY
// ─────────────────────────────────────────────

model Course {
  id           String   @id @default(cuid())
  slug         String   @unique  // "system-design", "dsa", "java"
  title        String            // "System Design"
  description  String?
  thumbnailUrl String?
  isPaid       Boolean  @default(false)   // true when monetization launches
  price        Decimal? @db.Decimal(10,2) // e.g., 49.99 (null = free)
  isPublished  Boolean  @default(false)
  order        Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relations
  parts       Part[]
  modules     Module[]   // Denormalized FK for faster queries
  topics      Topic[]    // Denormalized FK for faster queries
  lessons     Lesson[]   // Denormalized FK for faster queries
  enrollments Enrollment[]

  @@map("courses")
}

model Part {
  id          String   @id @default(cuid())
  courseId    String
  slug        String               // "introduction", "hld", "lld"
  title       String               // "Introduction", "High Level Design"
  description String?
  order       Int      @default(0) // Drag & drop position
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  course  Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  modules Module[]

  @@unique([courseId, slug])
  @@index([courseId, order])
  @@map("parts")
}

model Module {
  id          String   @id @default(cuid())
  courseId    String                // Denormalized for faster queries
  partId      String
  slug        String                // "consistency-vs-availability"
  title       String                // "Consistency vs Availability"
  description String?
  order       Int      @default(0)  // Drag & drop position within Part
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  course  Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  part    Part     @relation(fields: [partId], references: [id], onDelete: Cascade)
  topics  Topic[]

  @@unique([partId, slug])
  @@index([courseId, order])
  @@index([partId, order])
  @@map("modules")
}

model Topic {
  id              String   @id @default(cuid())
  courseId        String                // Denormalized
  moduleId        String
  slug            String                // "data-consistency-models"
  title           String                // "Data Consistency Models"
  description     String?
  overviewContent String?  @db.Text    // MDX of topic overview (e.g., data-consistency-models.md)
  order           Int      @default(0)
  isPublished     Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  course   Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  module   Module   @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  lessons  Lesson[]

  @@unique([moduleId, slug])
  @@index([courseId, order])
  @@index([moduleId, order])
  @@map("topics")
}

model Lesson {
  id                 String       @id @default(cuid())
  courseId           String                  // Denormalized
  moduleId           String                  // Denormalized
  topicId            String
  slug               String                  // "strong-consistency"
  title              String                  // "Strong Consistency"
  description        String?                 // Subtitle / tagline
  content            String?      @db.Text   // MDX content (full lesson)
  isFreePreview      Boolean      @default(false) // First lesson of each module = true
  isPublished        Boolean      @default(false)
  order              Int          @default(0)
  defaultMode        LearningMode @default(READING)
  readingTimeMinutes Int?                    // Estimated read time
  searchVector       Unsupported("tsvector")? // PostgreSQL FTS index
  createdAt          DateTime     @default(now())
  updatedAt          DateTime     @updatedAt

  // Relations
  course          Course          @relation(fields: [courseId], references: [id], onDelete: Cascade)
  module          Module          @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  topic           Topic           @relation(fields: [topicId], references: [id], onDelete: Cascade)
  videoMetadata   VideoMetadata?
  assets          LessonAsset[]
  readingProgress ReadingProgress[]
  videoProgress   VideoProgress[]
  bookmarks       Bookmark[]

  @@unique([topicId, slug])
  @@index([courseId, order])
  @@index([moduleId, order])
  @@index([topicId, order])
  @@index([isFreePreview])
  @@index([isPublished])
  // FTS index applied via raw SQL migration (see below)
  @@map("lessons")
}

// ─────────────────────────────────────────────
// VIDEO METADATA
// ─────────────────────────────────────────────

model VideoMetadata {
  id               String        @id @default(cuid())
  lessonId         String        @unique
  provider         VideoProvider @default(YOUTUBE)
  videoUrl         String        // YouTube URL now; Bunny.net URL later
  thumbnailUrl     String?
  durationSeconds  Int?          // Duration in seconds
  title            String?       // Optional override title
  description      String?       @db.Text
  bunnyVideoId     String?       // Bunny.net video ID (populated when migrating)
  bunnyLibraryId   String?       // Bunny.net library ID
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt

  // Relations
  lesson Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@map("video_metadata")
}

// ─────────────────────────────────────────────
// LESSON ASSETS (Images, SVGs stored in R2)
// ─────────────────────────────────────────────

model LessonAsset {
  id        String    @id @default(cuid())
  lessonId  String
  type      AssetType
  filename  String              // Original filename e.g. "strong-consistency-timeline.svg"
  r2Key     String    @unique   // R2 object key e.g. "lessons/strong-consistency/timeline.svg"
  url       String              // Public CDN URL
  alt       String?             // Alt text for accessibility
  sizeBytes Int?
  createdAt DateTime  @default(now())

  // Relations
  lesson Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@index([lessonId])
  @@map("lesson_assets")
}

// ─────────────────────────────────────────────
// PROGRESS TRACKING
// ─────────────────────────────────────────────

model ReadingProgress {
  id            String    @id @default(cuid())
  userId        String
  lessonId      String
  scrollPercent Int       @default(0)  // 0–100
  isCompleted   Boolean   @default(false)
  completedAt   DateTime?
  lastViewedAt  DateTime  @default(now())
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([userId, lessonId])
  @@index([userId])
  @@index([lessonId])
  @@map("reading_progress")
}

model VideoProgress {
  id              String    @id @default(cuid())
  userId          String
  lessonId        String
  watchedSeconds  Int       @default(0)   // Last playback position
  durationSeconds Int       @default(0)   // Video duration
  percentWatched  Int       @default(0)   // 0–100 (computed on save)
  isCompleted     Boolean   @default(false)
  completedAt     DateTime?
  lastWatchedAt   DateTime  @default(now())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([userId, lessonId])
  @@index([userId])
  @@index([lessonId])
  @@map("video_progress")
}

// ─────────────────────────────────────────────
// BOOKMARKS
// ─────────────────────────────────────────────

model Bookmark {
  id        String   @id @default(cuid())
  userId    String
  lessonId  String
  createdAt DateTime @default(now())

  // Relations
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([userId, lessonId])
  @@index([userId])
  @@map("bookmarks")
}

// ─────────────────────────────────────────────
// ENROLLMENT (Course access control)
// ─────────────────────────────────────────────

model Enrollment {
  id         String           @id @default(cuid())
  userId     String
  courseId   String
  status     EnrollmentStatus @default(ACTIVE)
  enrolledAt DateTime         @default(now())
  expiresAt  DateTime?        // null = lifetime; set when plan expires
  createdAt  DateTime         @default(now())
  updatedAt  DateTime         @updatedAt

  // Relations
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@unique([userId, courseId])
  @@index([userId])
  @@index([courseId])
  @@map("enrollments")
}

// ─────────────────────────────────────────────
// SUBSCRIPTION (Future Stripe monetization)
// ─────────────────────────────────────────────

model Subscription {
  id                   String             @id @default(cuid())
  userId               String             @unique
  plan                 SubscriptionPlan   @default(FREE)
  status               SubscriptionStatus @default(ACTIVE)
  stripeCustomerId     String?            @unique
  stripeSubscriptionId String?            @unique
  stripePriceId        String?
  currentPeriodStart   DateTime?
  currentPeriodEnd     DateTime?
  cancelAtPeriodEnd    Boolean            @default(false)
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([stripeCustomerId])
  @@map("subscriptions")
}
```

---

## PostgreSQL Full-Text Search Setup

After running `prisma migrate`, apply these SQL additions for search:

```sql
-- Enable trigram extension for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add GIN index on search vector (auto-updated trigger)
CREATE INDEX lessons_search_idx ON lessons USING GIN (search_vector);

-- Trigger to auto-update search_vector on insert/update
CREATE OR REPLACE FUNCTION lessons_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lessons_search_vector_trigger
BEFORE INSERT OR UPDATE ON lessons
FOR EACH ROW EXECUTE FUNCTION lessons_search_vector_update();

-- Trigram index for partial match / autocomplete
CREATE INDEX lessons_title_trgm_idx ON lessons USING GIN (title gin_trgm_ops);
```

**Search query pattern (via Prisma raw):**
```typescript
// lib/search.ts
const results = await prisma.$queryRaw`
  SELECT
    l.id, l.slug, l.title, l.description,
    m.title as module_title,
    t.title as topic_title,
    ts_rank(l.search_vector, query) AS rank
  FROM lessons l
  JOIN topics t ON t.id = l.topic_id
  JOIN modules m ON m.id = l.module_id,
  plainto_tsquery('english', ${searchTerm}) query
  WHERE l.search_vector @@ query
    AND l.is_published = true
  ORDER BY rank DESC
  LIMIT 20
`
```

---

## Key Design Decisions

### 1. Denormalized `courseId` + `moduleId` on Lesson
Every lesson carries `courseId`, `moduleId`, and `topicId`. This allows fetching all lessons for a course/module in **one query** without multi-level joins — critical for sidebar rendering performance.

### 2. `isFreePreview` on Lesson
The first lesson of each module has `isFreePreview = true`. The seed script sets this automatically. Admins can override per-lesson in the Admin Panel.

### 3. `searchVector` as unsupported type
Prisma doesn't natively support `tsvector`, so we declare it as `Unsupported("tsvector")` and manage updates via a PostgreSQL trigger. This keeps Prisma as the primary ORM while leveraging native PG FTS.

### 4. Separate `ReadingProgress` and `VideoProgress`
Two independent tables for dual-mode tracking. Completion is tracked separately per mode — a lesson can be "reading: 100%" and "video: 0%" independently.

### 5. `Enrollment` table (freemium + future paid)
Every user who signs up gets auto-enrolled in the course with `status: ACTIVE`. When paid courses launch, `expiresAt` is set and checked on each lesson request. No schema migration needed — just start populating the field.

### 6. `VideoMetadata.provider` enum
Currently `YOUTUBE` for all lessons. When Bunny.net videos are ready, update individual records to `BUNNY` and set `bunnyVideoId`. The video player checks `provider` to decide whether to render a YouTube iframe or Bunny.net HLS player. **Zero code changes needed** — just a data update.

### 7. `Part` table between `Course` and `Module`
Unique to System Design's structure (Introduction / HLD / LLD). Future courses (DSA, Java) may have different part structures or no parts at all — Parts are optional groupings, not required.

---

## Database Indexes Summary

| Table | Index | Purpose |
|---|---|---|
| `users` | `clerkId`, `email` | Auth lookups |
| `lessons` | `courseId, order` | Ordered lesson list |
| `lessons` | `topicId, order` | Sidebar rendering |
| `lessons` | `isFreePreview` | Freemium gate check |
| `lessons` | `search_vector` GIN | FTS queries |
| `lessons` | `title` GIN trgm | Autocomplete |
| `reading_progress` | `userId, lessonId` UNIQUE | Progress upsert |
| `video_progress` | `userId, lessonId` UNIQUE | Progress upsert |
| `bookmarks` | `userId` | Dashboard bookmarks |
| `enrollments` | `userId, courseId` UNIQUE | Access check |
| `subscriptions` | `stripeCustomerId` | Webhook handling |

---

## Content Import Mapping

Your folder structure → Database mapping:

| Folder | DB Table | Field |
|---|---|---|
| `modules/Introduction/` | `Part` | `slug: "introduction"` |
| `modules/HLD/` | `Part` | `slug: "hld"` |
| `modules/LLD/` | `Part` | `slug: "lld"` |
| `Consistency vs Availability/` | `Module` | `slug: "consistency-vs-availability"` |
| `data-consistency-models/` | `Topic` | `slug: "data-consistency-models"` |
| `data-consistency-models.md` | `Topic` | `overviewContent` (MDX text) |
| `strong-consistency/` | `Lesson` folder | — |
| `strong-consistency.md` | `Lesson` | `content` (MDX text) |
| `strong-consistency-timeline.svg` | `LessonAsset` + R2 | `url` (R2 CDN URL) |
| `behavioral-overview.svg` | `LessonAsset` + R2 | (linked to topic overview lesson) |

**First lesson of each module = `isFreePreview: true`:**
- `what-is-system-design` → free (first of Introduction)
- `fundamentals` → free (first of HLD)
- First lesson of each HLD module → free
- First lesson of each LLD module → free

---

## Phase 5 Summary

| Table | Records at Launch (est.) |
|---|---|
| `Course` | 1 |
| `Part` | 3 |
| `Module` | ~15 |
| `Topic` | ~40 |
| `Lesson` | ~210 |
| `LessonAsset` | ~100 |
| `VideoMetadata` | ~210 (YouTube URLs) |

---

> [!IMPORTANT]
> **Awaiting your approval before proceeding to Phase 6 — REST API Design.**
> Please review the schema, especially:
> 1. The Part → Module → Topic → Lesson hierarchy — does it match your content structure?
> 2. `isFreePreview` on the first lesson of each module — correct?
> 3. Separate `ReadingProgress` and `VideoProgress` tables — makes sense?
> 4. `VideoMetadata.provider` enum for YouTube → Bunny.net swap — clear?

---
*Awaiting your review and approval to proceed to Phase 6 — REST API Design.*
