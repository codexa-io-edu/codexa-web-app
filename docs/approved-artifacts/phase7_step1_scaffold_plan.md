# 🏗️ Phase 7 — Step 7.1: Project Scaffold

> **This is a plan. No code has been written yet.**
> Approve this to begin execution.

---

## What Will Be Created

```
C:\Users\JAGADEESH M\.gemini\antigravity\scratch\codexa\
```

A production-ready Next.js 14 App Router project, fully configured.

---

## Commands That Will Run

```bash
# 1. Create Next.js 14 app
npx create-next-app@latest codexa \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"

# 2. Install all dependencies
cd codexa && npm install \
  @clerk/nextjs \
  @prisma/client \
  prisma \
  next-mdx-remote \
  @tailwindcss/typography \
  react-syntax-highlighter \
  @types/react-syntax-highlighter \
  mermaid \
  lucide-react \
  clsx \
  tailwind-merge \
  @aws-sdk/client-s3 \
  @aws-sdk/s3-request-presigner \
  @upstash/ratelimit \
  @upstash/redis \
  @hello-pangea/dnd \
  zod \
  date-fns \
  sharp \
  rehype-highlight \
  remark-gfm \
  rehype-slug \
  rehype-autolink-headings
```

---

## Complete `package.json` Dependencies

```json
{
  "dependencies": {
    "next": "14.2.x",
    "react": "^18",
    "react-dom": "^18",

    "@clerk/nextjs": "^5.x",

    "@prisma/client": "^5.x",

    "next-mdx-remote": "^5.x",
    "@tailwindcss/typography": "^0.5.x",
    "react-syntax-highlighter": "^15.x",
    "mermaid": "^11.x",
    "remark-gfm": "^4.x",
    "rehype-highlight": "^7.x",
    "rehype-slug": "^6.x",
    "rehype-autolink-headings": "^7.x",

    "lucide-react": "^0.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",

    "@aws-sdk/client-s3": "^3.x",
    "@aws-sdk/s3-request-presigner": "^3.x",

    "@upstash/ratelimit": "^2.x",
    "@upstash/redis": "^1.x",

    "@hello-pangea/dnd": "^16.x",
    "zod": "^3.x",
    "date-fns": "^3.x",
    "sharp": "^0.33.x"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@types/react-syntax-highlighter": "^15.x",
    "prisma": "^5.x",
    "tailwindcss": "^3.x",
    "postcss": "^8",
    "autoprefixer": "^10",
    "eslint": "^8",
    "eslint-config-next": "14.2.x"
  }
}
```

---

## Files That Will Be Created / Modified

### Configuration Files

#### `tailwind.config.ts` — CODEXA Brand Tokens
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // CODEXA Brand
        'cx-orange':  '#FF6B00',
        'cx-purple':  '#8B5CF6',
        'cx-blue':    '#3B82F6',

        // Dark surfaces
        'dark-bg':      '#080810',
        'dark-nav':     '#0A0A12',
        'dark-sidebar': '#0D0D18',
        'dark-card':    '#13131F',
        'dark-surface': '#18182A',
        'dark-border':  '#1E1E35',
        'dark-border2': '#2A2A45',

        // Semantic
        brand: {
          DEFAULT: '#8B5CF6',
          orange:  '#FF6B00',
          purple:  '#8B5CF6',
          blue:    '#3B82F6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      backgroundImage: {
        'cx-gradient': 'linear-gradient(90deg, #FF6B00 0%, #8B5CF6 55%, #3B82F6 100%)',
        'cx-gradient-btn': 'linear-gradient(135deg, #FF6B00 0%, #8B5CF6 100%)',
      },
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            maxWidth: '768px',
            color: theme('colors.slate.700'),
            'h1,h2,h3,h4': { color: theme('colors.slate.900'), fontWeight: '700' },
            code: {
              backgroundColor: theme('colors.slate.100'),
              borderRadius: '4px',
              padding: '2px 6px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.875em',
            },
            'code::before': { content: 'none' },
            'code::after':  { content: 'none' },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
export default config
```

#### `app/globals.css` — CSS Variables + Fonts
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Light mode defaults */
    --background: #F8FAFC;
    --foreground: #0F172A;
    --card: #FFFFFF;
    --card-border: #E2E8F0;
    --muted: #64748B;
    --sidebar-bg: #0D0D18;   /* sidebar always dark */
    --nav-bg: #0A0A12;       /* navbar always dark */
  }
  .dark {
    --background: #080810;
    --foreground: #F1F5F9;
    --card: #13131F;
    --card-border: #1E1E35;
    --muted: #94A3B8;
  }
}

/* CODEXA gradient utility */
.cx-gradient-text {
  background: linear-gradient(90deg, #FF6B00 0%, #8B5CF6 55%, #3B82F6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.cx-gradient-bg {
  background: linear-gradient(90deg, #FF6B00 0%, #8B5CF6 55%, #3B82F6 100%);
}
.cx-gradient-btn {
  background: linear-gradient(135deg, #FF6B00 0%, #8B5CF6 100%);
}

/* Smooth scrollbar */
* { scrollbar-width: thin; scrollbar-color: #2A2A45 transparent; }
*::-webkit-scrollbar { width: 5px; height: 5px; }
*::-webkit-scrollbar-thumb { background: #2A2A45; border-radius: 99px; }
```

#### `middleware.ts` — Clerk Route Protection
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/courses(.*)',
  '/api/courses(.*)',
  '/api/search(.*)',
  '/api/learn/(.*)',   // freemium check done inside handler
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
])

const isAdminRoute = createRouteMatcher(['/admin(.*)', '/api/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    const { userId, sessionClaims } = await auth()
    if (!userId || (sessionClaims?.metadata as any)?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
  }
  if (!isPublicRoute(req)) await auth.protect()
})

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}
```

#### `lib/prisma.ts` — Prisma Singleton
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['query'] : [] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

#### `next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.r2.dev' },       // Cloudflare R2
      { protocol: 'https', hostname: 'assets.codexa.io' }, // Custom R2 domain
      { protocol: 'https', hostname: 'img.youtube.com' }, // YouTube thumbnails
      { protocol: 'https', hostname: '*.bunnycdn.com' }, // Bunny.net
      { protocol: 'https', hostname: 'img.clerk.com' },  // Clerk avatars
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}
module.exports = nextConfig
```

#### `.env.local` — Environment Variables Template
```bash
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://..."        # Pooled connection (Prisma)
DIRECT_URL="postgresql://..."          # Direct connection (migrations)

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"
CLERK_WEBHOOK_SECRET="whsec_..."

# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="codexa-assets"
NEXT_PUBLIC_R2_PUBLIC_URL="https://assets.codexa.io"

# Upstash Redis (Rate limiting)
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_FREEMIUM_LESSON_COUNT="1"   # First N lessons of each module = free
```

---

## Folder Structure Created

```
codexa/
├── app/
│   ├── (public)/
│   ├── (auth)/
│   ├── (student)/
│   ├── (admin)/
│   ├── api/
│   ├── layout.tsx          ← Root layout with Clerk + fonts
│   └── globals.css
├── components/
│   ├── layout/
│   ├── lesson/
│   ├── mdx/
│   ├── search/
│   ├── dashboard/
│   └── ui/
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── search.ts
│   ├── r2.ts
│   └── utils.ts
├── actions/
├── hooks/
├── context/
├── types/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── content/
│   └── import.ts           ← Content import script
├── middleware.ts
├── tailwind.config.ts
├── next.config.js
└── .env.local
```

---

## After Scaffold — Immediate Next Steps

Once scaffold is approved and created, Step 7.2 will:
1. Write the full `prisma/schema.prisma` (from Phase 5)
2. Run `prisma migrate dev` to create the DB tables on Neon
3. Build the content import script to seed your MD files

---

> [!IMPORTANT]
> **Ready to execute.** Approve this and I will run the commands and create all files above.
> The project will be created at:
> `C:\Users\JAGADEESH M\.gemini\antigravity\scratch\codexa\`
