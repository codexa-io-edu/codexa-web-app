# ⚙️ CODEXA.io — Phase 4: Application Architecture

---

## Overview

This phase defines the **technical skeleton** of CODEXA.io:
- How the Next.js app is structured
- How search works
- Where the app is deployed
- How the full-stack pieces connect

Every major decision is presented with **2–3 options** with trade-offs clearly explained.

---

## Decision 1 — Search Implementation

> **Requirement:** Fast, instant global search across Modules, Topics, Lessons, Headings, and Keywords. `⌘K` spotlight-style UI. Results grouped by category.

---

### Option A — PostgreSQL Full-Text Search (pg_trgm + tsvector)

**Overview:** Use PostgreSQL's built-in full-text search with `pg_trgm` extension and `tsvector` columns. Search queries run directly against the database via Prisma raw queries.

| Factor | Rating | Notes |
|---|---|---|
| **Speed** | ⭐⭐⭐ | Fast for < 50k records; requires careful indexing |
| **Relevance** | ⭐⭐⭐ | Good with ranking; no ML-based typo tolerance |
| **Setup Complexity** | ⭐⭐⭐⭐⭐ | Zero new services — just SQL |
| **Cost** | 🟢 Free | Uses existing PostgreSQL instance |
| **Scalability** | ⭐⭐⭐ | Scales to ~500k records before needing optimization |
| **Typo Tolerance** | ⭐⭐ | `pg_trgm` handles fuzzy matching; not as smart as Algolia |
| **Maintenance** | 🟢 Low | No extra service to manage |

✅ **Advantages:** Zero cost, zero extra infra, works with existing Prisma setup, content always in sync  
❌ **Disadvantages:** Less intelligent relevance ranking, harder to tune, adds DB load

---

### Option B — Meilisearch (Self-hosted or Meilisearch Cloud)

**Overview:** An open-source, blazing-fast search engine purpose-built for developer experience. Self-host on Railway/Fly.io or use Meilisearch Cloud.

| Factor | Rating | Notes |
|---|---|---|
| **Speed** | ⭐⭐⭐⭐⭐ | Sub-50ms even for complex queries |
| **Relevance** | ⭐⭐⭐⭐⭐ | Typo tolerance, synonyms, custom ranking |
| **Setup Complexity** | ⭐⭐⭐ | Separate service; need to sync content on save |
| **Cost** | 🟡 Low-Medium | Self-hosted: ~\$5–10/mo; Cloud: Free tier → \$30/mo |
| **Scalability** | ⭐⭐⭐⭐⭐ | Handles millions of documents |
| **Typo Tolerance** | ⭐⭐⭐⭐⭐ | Built-in, out of the box |
| **Maintenance** | 🟡 Medium | Must keep search index in sync with DB |

✅ **Advantages:** Exceptional UX, typo tolerance, faceting, instant results, easy API  
❌ **Disadvantages:** Extra service to deploy and maintain, index sync complexity, small cost

---

### Option C — Algolia

**Overview:** Market-leading hosted search-as-a-service. Used by Stripe Docs, Vercel Docs, Tailwind CSS.

| Factor | Rating | Notes |
|---|---|---|
| **Speed** | ⭐⭐⭐⭐⭐ | Global CDN, ~10ms response times |
| **Relevance** | ⭐⭐⭐⭐⭐ | Best-in-class AI ranking |
| **Setup Complexity** | ⭐⭐⭐⭐ | Easiest to integrate; great Next.js SDK |
| **Cost** | 🔴 High | Free: 10k searches/mo; \$120+/mo after |
| **Scalability** | ⭐⭐⭐⭐⭐ | Infinite — it's fully managed |
| **Typo Tolerance** | ⭐⭐⭐⭐⭐ | Best available |
| **Maintenance** | 🟢 Very Low | Fully managed, zero ops |

✅ **Advantages:** Best quality, zero infrastructure work, excellent docs/SDKs  
❌ **Disadvantages:** Expensive at scale, cost unpredictable with growth, vendor lock-in

---

### 🏆 Search Recommendation: **Option A — PostgreSQL Full-Text Search** (for now)

**Why:** CODEXA.io is launching with one course (~200 lessons). PostgreSQL FTS with `pg_trgm` and `tsvector` indexed columns will be **completely sufficient** at this scale. It adds zero cost, zero infra, and zero sync complexity.

**Migration path:** When the platform grows to 3+ courses (~600+ lessons) and if search quality becomes a complaint, migrate to **Meilisearch** (not Algolia — too expensive). The search API layer will be abstracted so swapping the engine requires changing only one service file.

**Trade-off accepted:** Slightly less intelligent typo tolerance vs. Algolia/Meilisearch. Acceptable for a v1 launch targeting developers who tend to search precisely.

---

## Decision 2 — Deployment Architecture

> **Requirement:** Deploy a Next.js 14 App Router app, PostgreSQL database, Cloudflare R2 assets, Clerk auth — reliably, with low cost at launch and growth potential.

---

### Option A — Vercel + Neon PostgreSQL ⭐ (Recommended)

**Overview:** Deploy Next.js on Vercel (purpose-built for it). Use Neon — a serverless PostgreSQL that scales to zero (no idle cost).

```
┌─────────────────────────────────────────────────────────┐
│  User Browser                                           │
│       │                                                 │
│       ▼                                                 │
│  Vercel Edge Network (CDN + Serverless Functions)       │
│  → Next.js App Router (SSR/SSG/RSC)                    │
│  → Server Actions / API Routes                         │
│       │                    │                            │
│       ▼                    ▼                            │
│  Neon PostgreSQL     Cloudflare R2                      │
│  (Serverless DB)     (Images, SVGs)                     │
│       │                                                 │
│  Clerk Auth (external SaaS)                             │
│  Bunny.net (Video CDN, external)                        │
└─────────────────────────────────────────────────────────┘
```

| Factor | Rating | Notes |
|---|---|---|
| **DX / Ease of Deploy** | ⭐⭐⭐⭐⭐ | `git push` → live. Zero config for Next.js |
| **Cost (launch)** | 🟢 ~\$20/mo | Vercel Pro \$20 + Neon free tier |
| **Cost (10k users)** | 🟡 ~\$50–80/mo | Vercel Pro + Neon Scale |
| **Performance** | ⭐⭐⭐⭐⭐ | Global edge, 100+ PoPs, built-in CDN |
| **Scalability** | ⭐⭐⭐⭐⭐ | Auto-scales, no manual intervention |
| **Ops Overhead** | 🟢 Minimal | Fully managed, zero DevOps |
| **Next.js Compatibility** | ⭐⭐⭐⭐⭐ | Made by the same team (Vercel) |

---

### Option B — Vercel + Railway PostgreSQL

**Overview:** Next.js on Vercel + traditional (always-on) PostgreSQL on Railway.

| Factor | Rating | Notes |
|---|---|---|
| **DX** | ⭐⭐⭐⭐⭐ | Excellent — both have great UIs |
| **Cost (launch)** | 🟡 ~\$25–30/mo | Vercel Pro \$20 + Railway \$5–10 |
| **Cost (10k users)** | 🟡 ~\$55–90/mo | Railway scales with usage |
| **DB Connections** | ⭐⭐⭐⭐ | Standard PG connections (needs PgBouncer at scale) |
| **Ops Overhead** | 🟢 Low | Both managed, but more config than Neon |

---

### Option C — AWS (ECS Fargate + RDS Aurora)

**Overview:** Full AWS stack — App on ECS Fargate (containers), Aurora Serverless PostgreSQL, CloudFront CDN.

| Factor | Rating | Notes |
|---|---|---|
| **DX** | ⭐⭐ | Complex setup, IAM, VPC, ECS task definitions |
| **Cost (launch)** | 🔴 ~\$80–150/mo | Minimum viable AWS is expensive |
| **Cost (10k users)** | 🟡 Competitive | Becomes cost-effective at very high scale |
| **Scalability** | ⭐⭐⭐⭐⭐ | Unlimited |
| **Ops Overhead** | 🔴 High | Needs dedicated DevOps knowledge |
| **Recommendation** | ❌ Not now | Overkill for a startup pre-PMF |

---

### 🏆 Deployment Recommendation: **Option A — Vercel + Neon PostgreSQL**

**Why:** Vercel is purpose-built for Next.js — zero-config deployments, automatic preview URLs per PR, built-in analytics, edge functions, and global CDN. Neon's serverless PostgreSQL scales to zero during off-hours (saves cost at launch) and scales automatically under load. The entire stack costs **~\$20/month** to start.

**Growth plan:**
- Launch: Vercel Hobby/Pro + Neon Free
- 1k–10k users: Vercel Pro + Neon Launch (\$19/mo)
- 10k+ users: Evaluate Neon Scale or migrate to Railway/self-hosted PG

**Trade-off accepted:** Vercel vendor dependency. Mitigated by the fact that Next.js is open source and can be self-hosted on any Node.js server if needed.

---

## Decision 3 — Folder Structure

> Only one approach is presented here — the **Next.js 14 App Router** standard with feature-based organization. This is the industry consensus for large Next.js apps.

### 🏆 Recommended: Feature-Collocated App Router Structure

```
codexa/
├── app/                              # Next.js App Router
│   ├── (public)/                     # Public route group
│   │   ├── page.tsx                  # / Home / Landing
│   │   ├── courses/
│   │   │   └── page.tsx              # /courses — Course catalog
│   │   └── courses/[courseSlug]/
│   │       └── page.tsx              # /courses/system-design — Overview
│   │
│   ├── (auth)/                       # Auth route group (Clerk)
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   │
│   ├── (student)/                    # Protected student routes
│   │   ├── layout.tsx                # Student layout (auth guard)
│   │   ├── dashboard/page.tsx        # /dashboard
│   │   ├── dashboard/bookmarks/page.tsx
│   │   ├── profile/page.tsx          # /profile
│   │   └── learn/[courseSlug]/[lessonSlug]/
│   │       └── page.tsx              # /learn/system-design/strong-consistency
│   │
│   ├── (admin)/                      # Admin panel (role guard)
│   │   ├── layout.tsx
│   │   ├── admin/page.tsx            # /admin/dashboard
│   │   ├── admin/courses/page.tsx
│   │   ├── admin/courses/[courseId]/
│   │   │   ├── modules/page.tsx
│   │   │   ├── topics/page.tsx
│   │   │   └── lessons/
│   │   │       ├── page.tsx
│   │   │       └── [lessonId]/edit/page.tsx
│   │   └── admin/users/page.tsx
│   │
│   ├── api/                          # API Routes
│   │   ├── courses/route.ts
│   │   ├── lessons/route.ts
│   │   ├── progress/route.ts
│   │   ├── bookmarks/route.ts
│   │   ├── search/route.ts
│   │   └── admin/
│   │       ├── lessons/route.ts
│   │       └── upload/route.ts
│   │
│   ├── layout.tsx                    # Root layout (Clerk provider, fonts)
│   └── globals.css                   # Tailwind base + custom CSS vars
│
├── components/                       # Shared UI components
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx               # Lesson sidebar
│   │   ├── TableOfContents.tsx
│   │   └── Footer.tsx
│   │
│   ├── lesson/
│   │   ├── LessonHeader.tsx
│   │   ├── ReadVideoToggle.tsx
│   │   ├── VideoPlayer.tsx           # YouTube iframe → Bunny.net HLS
│   │   ├── DualProgressBar.tsx
│   │   └── PrevNextNav.tsx
│   │
│   ├── mdx/                          # MDX custom components
│   │   ├── CodeBlock.tsx             # Syntax highlight + copy
│   │   ├── Callout.tsx               # BestPractice, Tip, etc.
│   │   ├── MermaidDiagram.tsx
│   │   └── MDXRenderer.tsx           # Renders MDX string from DB
│   │
│   ├── search/
│   │   └── SearchModal.tsx           # ⌘K spotlight
│   │
│   ├── dashboard/
│   │   ├── ContinueLearning.tsx
│   │   ├── CourseProgressRing.tsx
│   │   └── BookmarkList.tsx
│   │
│   └── ui/                           # Primitives
│       ├── Button.tsx
│       ├── Badge.tsx
│       ├── Card.tsx
│       ├── Progress.tsx
│       ├── Skeleton.tsx
│       ├── Modal.tsx
│       └── Toast.tsx
│
├── lib/                              # Utilities & services
│   ├── prisma.ts                     # Prisma client singleton
│   ├── auth.ts                       # Clerk server helpers
│   ├── search.ts                     # Search service (abstracted)
│   ├── r2.ts                         # Cloudflare R2 client
│   ├── mdx.ts                        # MDX compile/serialize
│   └── utils.ts                      # General helpers
│
├── actions/                          # Next.js Server Actions
│   ├── progress.ts                   # Save reading/video progress
│   ├── bookmarks.ts                  # Add/remove bookmarks
│   ├── lessons.ts                    # Admin: CRUD lessons
│   └── upload.ts                     # Admin: R2 upload
│
├── hooks/                            # Custom React hooks
│   ├── useProgress.ts
│   ├── useBookmark.ts
│   └── useSearch.ts
│
├── context/                          # React Context API
│   ├── ThemeContext.tsx              # Dark/light mode
│   └── CourseContext.tsx             # Current course/lesson state
│
├── types/                            # TypeScript types
│   ├── course.ts
│   ├── lesson.ts
│   └── progress.ts
│
├── prisma/
│   ├── schema.prisma                 # DB schema (Phase 5)
│   └── seed.ts                       # Course content seeder
│
├── content/                          # Local content import scripts
│   └── import.ts                     # One-time importer from your MD files
│
├── public/
│   └── logo.svg                      # CODEXA logo
│
├── middleware.ts                     # Clerk auth middleware (route protection)
├── next.config.js
├── tailwind.config.js
└── .env.local
```

---

## Full-Stack Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CODEXA.io Architecture                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Browser                                                       │
│   ├── React Server Components (SSR — SEO, fast FCP)            │
│   ├── Client Components (interactivity — toggles, search)       │
│   └── Clerk Frontend SDK (auth state, session)                  │
│                                                                 │
│   Next.js App (Vercel)                                          │
│   ├── App Router pages (SSR/SSG/ISR per route)                  │
│   ├── Server Actions (progress, bookmarks — no API round-trip)  │
│   ├── API Routes (search, admin upload)                         │
│   └── Middleware (Clerk — protects /learn, /dashboard, /admin)  │
│                                                                 │
│   Data Layer                                                    │
│   ├── Prisma ORM → Neon PostgreSQL                              │
│   ├── Cloudflare R2 → Images, SVGs (presigned URLs)             │
│   └── Bunny.net → Video streaming (URL only in DB)              │
│                                                                 │
│   External Services                                             │
│   ├── Clerk — Authentication (JWT, OAuth, sessions)             │
│   ├── Bunny.net — HLS video (no video stored in app)            │
│   └── (Future) Stripe — Subscriptions / Payments               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Rendering Strategy (per route type)

| Route | Strategy | Reason |
|---|---|---|
| `/` Home | **SSG** | Static, rebuild on content change |
| `/courses` | **SSG + ISR** | Rarely changes, cache 1hr |
| `/courses/[slug]` | **SSG + ISR** | Course overview, cache 1hr |
| `/learn/[course]/[lesson]` | **SSR** | Personalized (auth, progress) |
| `/dashboard` | **SSR** | User-specific data |
| `/admin/**` | **SSR** | Dynamic, always fresh |
| `/api/search` | **Edge Function** | Fast, low latency |
| `/api/progress` | **Serverless** | Server Action preferred |

---

## Authentication Flow

```
User visits /learn/system-design/strong-consistency

Clerk middleware runs:
  ├── Is this lesson #1–5 (freemium)?
  │     YES → allow, no auth required
  │     NO  ↓
  ├── Is user authenticated?
  │     NO  → redirect to /sign-up?redirect_url=/learn/...
  │     YES → is role = STUDENT or ADMIN?
  │              YES → render lesson page
  │              NO  → 403 Forbidden
  └── Fetch user's progress for this lesson
```

---

## Content Import Strategy (Your MD Files → Database)

Your existing content folder structure maps directly to the DB:

```
/modules/Introduction/               → Part: "Introduction"
  what-is-system-design/             → Lesson (no subtopics)
    what-is-system-design.md         → content (MDX stored in DB)

/modules/HLD/                        → Part: "High Level Design"
  Consistency vs Availability/       → Module
    data-consistency-models/         → Topic
      data-consistency-models.md     → Topic overview lesson
      strong-consistency/            → Subtopic folder
        strong-consistency.md        → Lesson (MDX content)
        strong-consistency-timeline.svg → Asset → upload to R2

/modules/LLD/                        → Part: "Low Level Design"
  Design Patterns/                   → Module
    behavioral-design-patterns/      → Topic
      behavioral-design-patterns.md  → Topic overview lesson
      behavioral-overview.svg        → Asset → upload to R2
      chain-of-responsibility/       → Subtopic folder
        chain-of-responsibility.md   → Lesson
        chain-of-responsibility-structure.svg → Asset → R2
```

**Import script (`prisma/seed.ts`)** will:
1. Read your local folder structure
2. Parse each `.md` file
3. Upload `.svg` / `.png` files to Cloudflare R2
4. Replace local image paths with R2 URLs in MDX
5. Insert all records into PostgreSQL in the correct hierarchy

---

## Open Questions for Your Review

> [!IMPORTANT]
> Please review and answer these before I proceed to Phase 5 (Database Design).

### Q1 — Freemium Lesson Count
Exactly how many free lessons should a guest be able to access?
- (A) First **3 lessons** of the entire course
- (B) First **5 lessons** of the entire course
- (C) First lesson of **each module** (unlimited free previews, one per module)
- (D) Configurable per lesson (admin can mark individual lessons as "Free Preview")

*Option D is the most flexible but adds complexity — recommended if you plan to use free lessons as marketing.*

### Q2 — Default Learning Mode
When a student opens a lesson for the first time, what should be the default mode?
- (A) **Reading mode** (content first — like documentation)
- (B) **Video mode** (video first — like Udemy/YouTube)
- (C) **Remember last used** per student preference

### Q3 — Lesson Ordering (Admin)
How should lesson order be managed?
- (A) **Drag & drop** in Admin Panel (flexible, visual)
- (B) **Numeric `order` field** editable via form input
- (C) **Both** — drag & drop with numeric fallback

### Q4 — Content Import
Would you like me to build an **automated import script** that reads your existing folder structure (`C:\Users\JAGADEESH M\Documents\CourseContent\modules\`) and seeds the entire course into the PostgreSQL database automatically? This would save hours of manual Admin Panel data entry.

---

## Phase 4 Summary

| Decision | Recommendation | Status |
|---|---|---|
| Search | PostgreSQL Full-Text Search (pg_trgm) | 🟡 Pending approval |
| Deployment | Vercel + Neon PostgreSQL | 🟡 Pending approval |
| Folder Structure | Next.js App Router, feature-collocated | 🟡 Pending approval |
| Rendering strategy | SSG+ISR for public, SSR for student/admin | 🟡 Pending approval |
| Auth flow | Clerk middleware with freemium gate | 🟡 Pending approval |
| Content import | Automated seed script from your MD files | 🟡 Pending answer (Q4) |

---
*Awaiting your review and approval to proceed to Phase 5 — Database Design.*
