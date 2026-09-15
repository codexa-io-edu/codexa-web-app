# 🎓 CODEXA.io — Phase 2: Information Architecture & User Flows

---

## ✅ Phase 1 Decisions (Locked In)

| Decision | Outcome |
|---|---|
| Platform Name | **CODEXA.io** |
| Guest Access | **Freemium** — first N lessons free, login required after |
| Monetization | **Planned** — initially free, paid subscriptions later (DB schema future-ready) |
| MDX Storage | **PostgreSQL** — stored as `text` column; simple, fast for CRUD, no extra infra |
| Image / SVG / Asset Storage | **Cloudflare R2** — S3-compatible, low-cost, fast CDN delivery |
| Video (Now) | **YouTube embeds** (dummy System Design videos) — swappable to Bunny.net |
| Video (Later) | **Bunny.net HLS** — only URL/metadata stored in DB, video streamed from CDN |

> **MDX in PostgreSQL rationale:** MDX lesson content is structured text (typically < 50KB per lesson). Storing it in PostgreSQL keeps reads/writes simple, enables full-text search natively, and avoids the complexity of file storage for text. If content ever needs versioning or grows beyond 1MB per lesson, we can migrate to R2 incrementally.

---

## 1. Sitemap & Page Hierarchy

```
CODEXA.io
├── / (Home / Landing Page)
├── /courses (Course Catalog)
│   └── /courses/system-design (Course Overview Page)
│       └── /learn/system-design/[lessonSlug] (Lesson Page)  ← Core experience
│
├── /auth
│   ├── /auth/sign-in
│   ├── /auth/sign-up
│   ├── /auth/forgot-password
│   └── /auth/verify-email
│
├── /dashboard (Student Dashboard) 🔐
│   ├── /dashboard/progress
│   ├── /dashboard/bookmarks
│   └── /dashboard/history
│
├── /profile (Student Profile) 🔐
│   ├── /profile/settings
│   └── /profile/preferences
│
├── /search (Global Search Results Page)
│
├── /admin (Admin Panel) 🔐👑
│   ├── /admin/dashboard (Analytics)
│   ├── /admin/courses
│   │   └── /admin/courses/[courseId]
│   │       ├── /admin/courses/[courseId]/modules
│   │       ├── /admin/courses/[courseId]/topics
│   │       └── /admin/courses/[courseId]/lessons
│   │           └── /admin/courses/[courseId]/lessons/[lessonId]/edit
│   └── /admin/users
│
└── Static Pages
    ├── /about
    ├── /privacy
    └── /terms
```

---

## 2. Access Control Matrix

| Page / Feature | Guest | Student | Admin |
|---|:---:|:---:|:---:|
| Home / Landing | ✅ | ✅ | ✅ |
| Course Catalog | ✅ | ✅ | ✅ |
| Course Overview | ✅ | ✅ | ✅ |
| First N Lessons (Freemium) | ✅ | ✅ | ✅ |
| All Lessons | ❌ (redirect to sign-up) | ✅ | ✅ |
| Progress Tracking | ❌ | ✅ | ✅ |
| Bookmarks | ❌ | ✅ | ✅ |
| Dashboard | ❌ | ✅ | ✅ |
| Profile | ❌ | ✅ | ✅ |
| Admin Panel | ❌ | ❌ | ✅ |
| Global Search | ✅ (results visible) | ✅ | ✅ |

> **Freemium gate:** First **5 lessons** of the course are freely accessible. Attempting to open lesson 6+ triggers a non-intrusive sign-up prompt/modal.

---

## 3. Navigation Architecture

### Primary Navbar (All Pages)
```
[CODEXA Logo]   [Courses]  [Search 🔍]                [Sign In] [Get Started]
                                                    (or avatar + dashboard if logged in)
```

### Lesson Page Layout (Desktop — 3 column)
```
┌──────────────────────────────────────────────────────────────────┐
│  Navbar                                                          │
├───────────────┬──────────────────────────────┬───────────────────┤
│ LEFT SIDEBAR  │      MAIN CONTENT AREA       │   RIGHT SIDEBAR   │
│ (sticky)      │                              │   (sticky)        │
│               │  Breadcrumb                  │                   │
│ Course Title  │  Lesson Title                │  Table of         │
│ Progress Bar  │                              │  Contents         │
│               │  [Read] [Video] Toggle       │                   │
│ ▾ Part 1      │                              │  • Section 1      │
│   ▾ Module 1  │  ─── Content ───            │  • Section 2 ←    │
│     ▾ Topic 1 │                              │  • Section 3      │
│       Lesson1✓│  [Prev Lesson] [Next Lesson] │                   │
│       Lesson2→│                              │  [Bookmark]       │
│       Lesson3 │                              │  [Share]          │
│   Module 2    │                              │                   │
│ ▾ Part 2      │                              │                   │
└───────────────┴──────────────────────────────┴───────────────────┘
```

### Lesson Page Layout (Mobile)
```
┌──────────────────────────┐
│  Navbar  [☰ Menu]        │
├──────────────────────────┤
│  Breadcrumb              │
│  Lesson Title            │
│  [Read] [Video] Toggle   │
│  ── Content ──          │
│  [Prev]        [Next]    │
├──────────────────────────┤
│  Bottom Tab Bar          │
│  [Contents] [Progress]   │
└──────────────────────────┘
```

---

## 4. User Journey Maps

### 4.1 — New Visitor / Onboarding Flow

```
Landing Page
    │
    ▼
Browsing Course Overview (free)
    │
    ├── Reads first 5 lessons freely ──────────────────────────┐
    │                                                           │
    ▼                                                           ▼
Tries to open Lesson 6                              Satisfied → Bookmark / Share
    │
    ▼
🔒 Freemium Gate (soft modal: "Sign up to continue")
    │
    ├── Sign Up with Email → Email Verification → Dashboard
    │
    └── Sign Up with Google → Dashboard (immediate)
```

---

### 4.2 — Returning Student Learning Flow

```
Sign In
    │
    ▼
Dashboard
    │
    ├── "Continue Learning" card → last lesson visited
    │
    └── Course Progress overview
            │
            ▼
        Lesson Page
            │
            ├── Reading Mode
            │     └── Scroll → auto-track reading progress (%)
            │         │
            │         └── 100% → mark lesson complete ✓
            │
            ├── Video Mode
            │     └── Watch → auto-track video progress (%)
            │         │
            │         └── 100% → mark video watched ✓
            │
            └── Switch modes freely (progress saved independently)
                    │
                    ▼
                [Next Lesson] → repeat
```

---

### 4.3 — Global Search Flow

```
User presses Cmd/Ctrl+K  (or clicks 🔍 in navbar)
    │
    ▼
Search Modal opens (spotlight-style)
    │
    ├── Type query → instant results grouped by:
    │     • Modules
    │     • Topics
    │     • Lessons
    │     • Headings
    │
    └── Click result → navigate directly to lesson (+ scroll to heading if heading match)
```

---

### 4.4 — Admin Content Creation Flow

```
Admin logs in → /admin/dashboard
    │
    ▼
Navigate to Courses → Select "System Design"
    │
    ▼
Select Module → Topic → Create New Lesson
    │
    ▼
Lesson Editor:
    ├── Fill title, slug, description
    ├── Write/paste MDX content (with live preview)
    ├── Upload images → stored in Cloudflare R2
    ├── Add SVG / Mermaid diagrams
    ├── Attach YouTube URL (now) / Bunny.net URL (later)
    ├── Set video metadata (title, duration, thumbnail)
    ├── Preview lesson (exactly as student sees it)
    └── Publish → Lesson is live
```

---

### 4.5 — Future Monetization Flow (Schema-Ready)

```
[Future] Course marked as "paid" in DB
    │
    ▼
Student without subscription tries to open paid lesson
    │
    ▼
Paywall Modal → "Subscribe to CODEXA Pro"
    │
    ▼
Stripe Checkout → Payment → Subscription record created
    │
    ▼
Student gets access to all paid content
```

> **Note:** Subscription tables will be added to the DB schema now (nullable/optional), so this flow can be implemented later without schema migrations.

---

## 5. Key Page Descriptions

| Page | Purpose | Key Components |
|---|---|---|
| **Home** | Landing, value proposition, CTA | Hero, Feature highlights, Course preview, Testimonials, CTA |
| **Course Overview** | Show course structure, tease content | Course info, Module list, Lesson count, Enroll/Start CTA |
| **Lesson Page** | Core learning experience | Sidebar, Content/Video, TOC, Progress, Nav |
| **Dashboard** | Student home base | Continue learning, Stats, Bookmarks |
| **Search** | Global content discovery | Instant search modal (Cmd+K) |
| **Admin Panel** | Content + user management | Tables, Forms, MDX editor, Analytics charts |

---

## 6. Content Seeding Plan (System Design Course)

For launch, the System Design course will be seeded with:

| Part | Modules | Approx. Topics |
|---|---|---|
| Part 1: Introduction | 2–3 modules | ~10 topics |
| Part 2: High Level Design (HLD) | 5–7 modules | ~25 topics |
| Part 3: Low Level Design (LLD) | 4–6 modules | ~20 topics |

> All lessons will use **real MDX text content** you provide.
> Video mode will use a **single dummy YouTube video** (e.g., a System Design interview overview video) embedded via iframe for all lessons during development. Each lesson's `videoUrl` field in the DB will store the YouTube URL for now, replaced with Bunny.net URLs when real videos are ready.

---

## ✅ Phase 2 Summary

- **14 unique routes** defined across public, student, and admin areas
- **Freemium gate** at lesson 6 (configurable in DB/env)
- **3-column desktop layout** confirmed for lesson page
- **5 user journeys** mapped end-to-end
- **Future monetization** accounted for in architecture
- **Video placeholder** strategy confirmed (YouTube → Bunny.net swap)

---

> **Next: Phase 3 — UI/UX Design**
> I will present: Color palette options, Typography choices, Component samples, Dark/Light mode previews, and overall visual identity of CODEXA.io — **before writing any code**.
> Awaiting your approval to proceed.
