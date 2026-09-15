# 🎨 CODEXA.io — Phase 3: Design System (APPROVED ✅)

---

## Brand Identity

| Element | Value |
|---|---|
| **Logo** | `<<C>>` hexagon icon + `codexa.io` wordmark |
| **Tagline** | FROM `CODER` (purple) TO `ENGINEER` (orange) |
| **Brand Feel** | Bold · Technical · Premium · Dark-first |
| **Design Philosophy** | Documentation-quality content + video platform warmth |

---

## Color System (Tailwind CSS Custom Tokens)

### Brand Gradient
```css
--cx-gradient: linear-gradient(90deg, #FF6B00 0%, #8B5CF6 55%, #3B82F6 100%);
```

### Core Palette

| Token | Hex | Usage |
|---|---|---|
| `--cx-orange` | `#FF6B00` | Primary CTA buttons, "ENGINEER" tagline |
| `--cx-purple` | `#8B5CF6` | Active states, links, progress, interview callouts |
| `--cx-blue` | `#3B82F6` | Secondary accents, info callouts, HLD tags |
| `--cx-gradient` | `#FF6B00 → #8B5CF6 → #3B82F6` | Logo, hero elements, progress bars, CTA buttons |

### Dark Mode Surfaces

| Token | Hex | Usage |
|---|---|---|
| `--dark-bg` | `#080810` | Page background |
| `--dark-nav` | `#0A0A12` | Navbar |
| `--dark-sidebar` | `#0D0D18` | Left sidebar |
| `--dark-card` | `#13131F` | Cards, panels |
| `--dark-surface` | `#18182A` | Elevated elements |
| `--dark-border` | `#1E1E35` | Dividers, card borders |
| `--dark-border2` | `#2A2A45` | Input borders, secondary dividers |

### Light Mode Surfaces

| Token | Hex | Usage |
|---|---|---|
| `--light-bg` | `#F8FAFC` | Page background |
| `--light-card` | `#FFFFFF` | Content area, cards |
| `--light-border` | `#E2E8F0` | Dividers |
| `--light-text` | `#0F172A` | Primary text |
| `--light-muted` | `#64748B` | Secondary text |

### Semantic Colors

| Token | Hex | Usage |
|---|---|---|
| `--success` | `#22C55E` | Completed lessons, Best Practice callouts |
| `--warning` | `#F59E0B` | In-progress, Key Takeaway callouts |
| `--danger` | `#EF4444` | Errors, Common Mistake callouts |
| `--info` | `#3B82F6` | Info, Tip callouts |

---

## Typography

| Role | Font | Size | Weight |
|---|---|---|---|
| **Display / Hero** | Inter | 36–48px | 900 |
| **Heading H1** | Inter | 28–32px | 800 |
| **Heading H2** | Inter | 22–24px | 700 |
| **Heading H3** | Inter | 17–18px | 600 |
| **Body** | Inter | 15px | 400, line-height 1.75 |
| **Caption / Label** | Inter | 11–13px | 500–600 |
| **Code (blocks)** | JetBrains Mono | 13px | 400 |
| **Code (inline)** | JetBrains Mono | 13px | 400 |

> **Google Fonts CDN:** `Inter:wght@400;500;600;700;800;900` + `JetBrains+Mono:wght@400;500`

---

## Callout Components (6 types)

| Component | Border Color | Background (dark) | Icon | Usage in MDX |
|---|---|---|---|---|
| `<BestPractice>` | `#22C55E` | `rgba(34,197,94,0.08)` | ✅ | Production recommendations |
| `<CommonMistake>` | `#EF4444` | `rgba(239,68,68,0.08)` | ⚠️ | Anti-patterns to avoid |
| `<InterviewNote>` | `#8B5CF6` | `rgba(139,92,246,0.1)` | 🎯 | Interview-specific points |
| `<KeyTakeaway>` | `#F59E0B` | `rgba(245,158,11,0.08)` | 🔑 | Chapter summaries |
| `<Tip>` | `#3B82F6` | `rgba(59,130,246,0.08)` | 💡 | Helpful advice |
| `<Summary>` | `#64748B` | `rgba(100,116,139,0.08)` | 📝 | End-of-lesson recap |

---

## Lesson Page Layout (Desktop)

```
┌────────────────────────────────────────────────────────────────────────┐
│  NAVBAR (sticky, 56px, --dark-nav background)                          │
│  [⟨C⟩ codexa.io]  [Courses] [Blog]    [🔍 Search ⌘K]  [Sign in] [CTA]│
├────────────────────┬───────────────────────────────┬────────────────────┤
│  LEFT SIDEBAR      │   MAIN CONTENT (max-w-3xl)    │   RIGHT TOC        │
│  256px, sticky     │   white / --light-card        │   200px, sticky    │
│                    │                               │                    │
│  Course Title      │   Breadcrumb                  │   On This Page     │
│  ████░░░░ 42%      │   [📖 Read] [▶ Video] toggle  │   • Section 1      │
│                    │                               │   • Section 2  ←   │
│  ▾ Part 2: HLD     │   H1: Lesson Title            │   • Section 3      │
│    ▾ Module        │   subtitle / description      │                    │
│      ▾ Topic       │                               │   [🔖 Bookmark]    │
│        ✓ Lesson1   │   MDX Content / Video Player  │   [📤 Share]       │
│        → Lesson2   │                               │                    │
│        ○ Lesson3   │   Progress bars (read+video)  │                    │
│    ▸ Module 2      │                               │                    │
│                    │   [← Prev]        [Next →]    │                    │
├────────────────────┴───────────────────────────────┴────────────────────┤
│  (no footer on lesson page — sidebar takes full height)                │
└────────────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (< 768px)
```
┌──────────────────────────┐
│  Navbar  [☰]             │
├──────────────────────────┤
│  Breadcrumb              │
│  Lesson Title            │
│  [Read] [Video] toggle   │
│  ──── Content ────      │
│  [← Prev]   [Next →]    │
├──────────────────────────┤
│  Bottom sheet sidebar    │
│  (triggered by ☰ or     │
│  "Contents" tab)         │
└──────────────────────────┘
```

---

## Component Inventory

| Component | Type | Notes |
|---|---|---|
| `<Navbar>` | Layout | Sticky, 56px, search modal trigger |
| `<Sidebar>` | Layout | 256px, expandable tree, progress |
| `<TableOfContents>` | Layout | Right rail, 200px, scroll-spy |
| `<LessonHeader>` | Content | Breadcrumb + title + subtitle |
| `<ReadVideoToggle>` | UI | Gradient pill toggle |
| `<MDXRenderer>` | Content | All MDX components |
| `<VideoPlayer>` | Media | YouTube iframe now / Bunny.net HLS later |
| `<CodeBlock>` | Content | Syntax highlight + copy button |
| `<Callout>` | Content | 6 variants |
| `<DualProgressBar>` | UI | Read % + Video % independent |
| `<PrevNextNav>` | Navigation | Bottom lesson nav |
| `<SearchModal>` | UI | ⌘K spotlight-style |
| `<LessonCard>` | Course | Progress indicator + badge |
| `<CourseProgressRing>` | Dashboard | Circular progress |
| `<SkeletonLoader>` | Loading | Shimmer for all major layouts |
| `<Badge>` | UI | 7 variants |
| `<Button>` | UI | gradient, outline, ghost, danger |
| `<Breadcrumb>` | Navigation | Part › Module › Topic › Lesson |

---

## Spacing & Sizing

| Token | Value | Usage |
|---|---|---|
| Sidebar width | 256px (16rem) | Left nav |
| TOC width | 200px (12.5rem) | Right rail |
| Max content width | 768px (48rem) | Lesson prose area |
| Navbar height | 56px (3.5rem) | Sticky top |
| Border radius (card) | 14px | Panels, cards |
| Border radius (btn) | 9px | Buttons |
| Border radius (badge) | 99px | Pills |
| Base spacing unit | 4px | Tailwind `p-1` = 4px |

---

## Dark / Light Mode Strategy

- **Default mode:** Dark (matches brand logo, developer audience)
- **Toggle:** Available in Navbar and Profile preferences
- **Persistence:** `localStorage` + `Clerk` user preferences
- **Lesson content area:** Always Light (white background for maximum readability of long-form text and code)
- **Sidebar, Navbar, Admin Panel:** Always Dark

> This hybrid approach (dark chrome + light content) is used by GitHub, Linear, and VS Code — and is the industry standard for developer documentation platforms.

---

## Phase 3 Summary — All Decisions Locked ✅

- [x] Brand colors: CODEXA Gradient (Orange → Purple → Blue)
- [x] Typography: Inter + JetBrains Mono
- [x] Dark-first UI with light lesson content area
- [x] 6 callout component types defined
- [x] 3-column desktop lesson layout confirmed
- [x] All component inventory documented
- [x] Mobile layout strategy defined
- [x] Spacing tokens finalized

---

> **Next: Phase 4 — Application Architecture**
> Folder structure, search options, deployment options — all with 2–3 alternatives presented for approval.
