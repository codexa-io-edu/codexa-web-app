# 🎓 LearnCraft — Professional Learning Platform
### Phase 1: Product Requirements & Feature Specification

---

## Project Vision

Build a **world-class, production-ready professional learning platform** starting with a single course (System Design) but designed from day one to scale to multiple courses (DSA, Java, Spring Boot, etc.) without architectural redesign.

The platform should feel like a **premium documentation + video learning platform** — combining the best of W3Schools (navigation), ByteByteGo (visual diagrams), Educative (interactive reading), and Microsoft Learn (structure) — but with a **completely unique, modern, premium identity**.

---

## Tech Stack (Finalized)

| Layer | Technology | Justification |
|---|---|---|
| Frontend | Next.js 14+ (App Router) | SSR/SSG, file-based routing, React Server Components |
| Styling | Tailwind CSS | Utility-first, highly customizable, performant |
| State Management | React Context API | Lightweight, sufficient for this scale |
| Backend | Next.js Server Actions + API Routes | Unified codebase, no separate server needed initially |
| ORM | Prisma | Type-safe, excellent DX, great with PostgreSQL |
| Database | PostgreSQL | Relational, proven, excellent for structured course data |
| Authentication | Clerk | Auth-as-a-service: handles JWT, OAuth, sessions, email verification |
| Video Streaming | Bunny.net Stream | CDN-backed, cost-effective, HLS streaming |
| Search | To be decided in Phase 4 (options: Algolia, Meilisearch, Postgres Full-Text) |
| Deployment | To be decided in Phase 4 |

---

## User Roles

| Role | Description |
|---|---|
| **Guest** | Unauthenticated visitor — can browse course overview, see lesson previews |
| **Student** | Authenticated user — can access all lessons, track progress, bookmark |
| **Admin** | Platform administrator — full content management and analytics access |

---

## Feature Specification

### 🔐 Authentication (via Clerk)
- [x] Email/Password Signup & Login
- [x] Google OAuth Login
- [x] Forgot Password / Reset Password
- [x] Email Verification
- [x] Protected Routes (middleware-based)
- [x] Role-based Access Control (Student / Admin)
- [x] Session persistence across devices

---

### 📚 Course Structure

```
Platform
└── Course (e.g., System Design)
    ├── Part 1: Introduction
    │   ├── Module 1: Basics of System Design
    │   │   ├── Topic 1: What is System Design?
    │   │   │   ├── Lesson 1: Overview
    │   │   │   ├── Lesson 2: Key Concepts
    │   │   │   └── Lesson 3: Interview Tips
    │   │   └── Topic 2: Scalability
    │   └── Module 2: ...
    ├── Part 2: High Level Design (HLD)
    └── Part 3: Low Level Design (LLD)
```

**Database Hierarchy:**
`Course → Part → Module → Topic → Lesson`

> ⚠️ This 5-level hierarchy is designed to be **future-proof** — adding a new course (e.g., DSA) requires only inserting new Course/Module/Topic/Lesson records, zero schema changes.

---

### 📖 Dual Learning Mode (Core Feature)

Every lesson supports two independent modes:

#### Reading Mode
Content rendered as **MDX** with support for:
- Syntax-highlighted Code Blocks (with copy button)
- Mermaid Diagrams
- SVG Diagrams
- Tables
- Images (Next.js optimized)
- Custom callout components: `<Callout>`, `<BestPractice>`, `<CommonMistake>`, `<InterviewNote>`, `<Tip>`, `<Warning>`, `<KeyTakeaway>`
- Reading scroll-based progress tracking

#### Video Mode
Streamed via **Bunny.net** with:
- HLS video player (video.js or Plyr)
- Resume playback (stored per user, per lesson)
- Playback speed control (0.5x–2x)
- Captions / Subtitles support
- Fullscreen mode
- Keyboard shortcuts (space = play/pause, arrow = seek, f = fullscreen)
- Picture-in-Picture (PiP) where supported

#### Mode Switching
- Instant toggle between Reading ↔ Video without page reload
- Progress tracked **independently** per mode
- Visual indicators: `Reading: 75%` | `Video: 100%`

---

### 🔍 Global Search
- Searches: Modules, Topics, Lessons, Lesson Titles, Headings, Keywords
- Instant results (< 100ms feel) with grouped categories
- Keyboard shortcut: `Cmd/Ctrl + K`
- *Search technology to be decided in Phase 4 with options presented*

---

### 🧭 Lesson Page Layout

```
[ Breadcrumb: Course > Part > Module > Topic > Lesson ]

[ Sticky Left Sidebar ]          [ Main Content Area ]                    [ Right TOC ]
  - Course Progress                - Lesson Title                           - Table of Contents
  - Parts (collapsible)            - Reading / Video Toggle                 - Current Section Highlight
    - Modules (collapsible)        - MDX Content OR Video Player
      - Topics (collapsible)       - Copy Button on Code Blocks
        - Lessons (with ✓)         - Previous / Next Lesson
  - Completion indicators          - Bookmark | Share

```

---

### 🏠 Student Dashboard
- **Continue Learning** — resume from last lesson
- **Course Progress** — reading % and video % separately
- **Bookmarked Lessons** — quick access
- **Learning Statistics** — streak, time spent, lessons completed
- **My Courses** (future-ready for multiple courses)

---

### 👤 Student Profile
- Personal Information (name, avatar via Clerk)
- Password Change (via Clerk)
- Learning History
- Preferences (dark/light mode, default learning mode)

---

### 🔖 Bookmarks
- Bookmark any lesson from the lesson page
- View all bookmarks in Dashboard
- Bookmarks synced across devices

---

### 🌙 Dark Mode / Light Mode
- System preference detection
- Manual toggle in Navbar
- Preference persisted across sessions

---

### 🛠️ Admin Panel

#### Content Management
| Feature | Description |
|---|---|
| Manage Courses | Create / Edit / Delete courses |
| Manage Parts | Create / Edit / Delete parts within a course |
| Manage Modules | Create / Edit / Delete modules |
| Manage Topics | Create / Edit / Delete topics |
| Manage Lessons | Create / Edit / Delete lessons |
| MDX Editor | Rich markdown editor with live preview |
| Image Upload | Upload lesson images (stored in cloud storage) |
| Video Attach | Attach Bunny.net video URLs + metadata + thumbnails |
| SVG Manager | Upload and manage SVG diagrams |
| Mermaid Editor | Write and preview Mermaid diagrams |
| Lesson Preview | Preview lesson exactly as students see it |
| Publish/Unpublish | Draft ↔ Published status per lesson |
| Drag & Drop Reorder | Reorder modules, topics, lessons visually |

#### User Management
- View all registered users
- Assign roles (Student / Admin)
- Deactivate accounts

#### Analytics Dashboard
- Total registered users
- Active users (daily/weekly/monthly)
- Lesson completion rates
- Module completion rates
- Learning progress distribution (charts)
- Top lessons by views

---

### 📱 Responsive Design

| Breakpoint | Behavior |
|---|---|
| Mobile (< 768px) | Sidebar collapses to bottom sheet / hamburger menu |
| Tablet (768–1024px) | Sidebar can be toggled, condensed layout |
| Desktop (> 1024px) | Full 3-column layout (Sidebar + Content + TOC) |

---

### ⚡ Performance Requirements
- **LCP** < 2.5s (Largest Contentful Paint)
- **INP** < 200ms (Interaction to Next Paint)
- **CLS** < 0.1 (Cumulative Layout Shift)
- Images: Next.js `<Image>` with lazy loading + WebP
- Video: HLS adaptive streaming via Bunny.net CDN
- Code splitting: Automatic via Next.js App Router
- MDX: Pre-compiled at build time (static lessons) OR on-demand (dynamic admin-created)
- Route prefetching: `next/link` built-in prefetch

---

### 🔒 Security Requirements
- Auth: Clerk handles JWT, session tokens, OAuth
- API Routes: Clerk `auth()` middleware protection
- Admin Routes: Role-based middleware check
- Video Access: Signed Bunny.net URLs (time-limited)
- Rate Limiting: on API routes (e.g., `@upstash/ratelimit`)
- XSS: MDX sanitization, CSP headers
- CSRF: Handled by Clerk session tokens
- SQL Injection: Prisma parameterized queries (auto-protected)
- Environment Variables: All secrets in `.env.local`, never exposed to client

---

## Development Phases

| Phase | Description | Status |
|---|---|---|
| **Phase 1** | Product Requirements & Feature Specification | ✅ In Review |
| **Phase 2** | Information Architecture & User Flows | ⏳ Pending |
| **Phase 3** | UI/UX Design — Design System, Wireframes, Themes | ⏳ Pending |
| **Phase 4** | Application Architecture (Folder, API, Search, Deploy) | ⏳ Pending |
| **Phase 5** | Database Design (Prisma Schema) | ⏳ Pending |
| **Phase 6** | REST API Design | ⏳ Pending |
| **Phase 7** | Frontend Development (component by component, with approval) | ⏳ Pending |
| **Phase 8** | Backend Development | ⏳ Pending |
| **Phase 9** | Testing & QA | ⏳ Pending |
| **Phase 10** | Deployment & Production Readiness | ⏳ Pending |

---

## Open Questions for Your Review

> [!IMPORTANT]
> Please review these decisions before I proceed to Phase 2.

### Q1 — Platform Name
Do you have a name in mind for the platform, or should I suggest branding options in Phase 3?

### Q2 — Guest Access
Should unauthenticated visitors be able to:
- (A) View the course structure only (no lesson content)?
- (B) View the first few lessons freely, then require login (freemium)?
- (C) All content is free, login is only required for progress tracking?
- (D) All content requires login?

### Q3 — Monetization (Future)
Is there a plan to add paid courses / subscriptions in the future? This could influence the database schema design now.

### Q4 — MDX Storage
Admin-created lesson content needs to be stored. Two options:
- (A) Store MDX as text in PostgreSQL (simplest)
- (B) Store MDX as files in cloud storage (S3/Cloudflare R2) and reference by URL

*I'll present full options with trade-offs in Phase 4, but wanted to flag early.*

### Q5 — Image/Asset Storage
Where should lesson images and SVGs be stored?
- (A) Cloudflare R2 (cost-effective, S3-compatible)
- (B) AWS S3
- (C) Supabase Storage
- (D) Vercel Blob

*Again, full options will be presented in Phase 4.*

---

## Summary

This is a **large-scale, production-grade platform** with approximately:
- ~40–60 unique components
- ~15–20 pages/routes
- ~25–35 API endpoints
- ~12–15 database tables
- 10 development phases

The approach is **pragmatic** — start simple, architect for scale. The initial launch focuses on:
1. System Design course (full content)
2. Dual learning mode (read + video)
3. Auth + progress tracking
4. Admin panel for content management

Future courses can be added by non-technical admins through the Admin Panel.

---
*Awaiting your review and approval to proceed to Phase 2.*
