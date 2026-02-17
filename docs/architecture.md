# MyDeadProjects — Technical Architecture

## Architecture Decision Record (ADR)

**Decision:** Self-hosted Next.js on Hetzner VPS with Coolify PaaS, Supabase for DB/Auth, Cloudflare for edge (R2 + Workers).

**Context:** Need a stack that costs ~$4/mo at rest but survives viral traffic spikes without bankruptcy. Must support fast AI-assisted development and instant deploys.

**Alternatives considered:**
- Vercel + Supabase: $0 start but $70-150/mo at viral scale (bandwidth overage)
- Firebase full stack: NoSQL awkward for relational social data, hard vendor lock-in
- Fly.io + Neon: Good auto-scale but complex multi-vendor setup

**Decision drivers:**
1. Hetzner CX23 includes 20TB traffic (handles viral spikes at fixed cost)
2. Coolify gives PaaS experience (git push deploy) on own VPS
3. Supabase free tier covers MVP (50K MAU auth, 500MB DB, real-time)
4. Cloudflare R2 has $0 egress (critical for image-heavy viral sharing)

---

## System Diagram

```
                    ┌─────────────────────────────────────┐
                    │         Cloudflare (DNS + CDN)       │
                    │  ┌─────────────┐  ┌───────────────┐ │
                    │  │   R2 Bucket  │  │    Workers    │ │
                    │  │  (images,    │  │  (OG image    │ │
                    │  │  screenshots,│  │   generation) │ │
                    │  │  badges)     │  │               │ │
                    │  └─────────────┘  └───────────────┘ │
                    └──────────┬──────────────────────────┘
                               │
                    ┌──────────▼──────────────────────────┐
                    │     Hetzner CX23 (EUR 3.49/mo)      │
                    │     2 vCPU · 4GB RAM · 40GB NVMe    │
                    │     20TB traffic included            │
                    │                                      │
                    │  ┌──────────────────────────────┐   │
                    │  │         Coolify (PaaS)        │   │
                    │  │  ┌────────────────────────┐  │   │
                    │  │  │   Next.js App (SSR)     │  │   │
                    │  │  │   - App Router          │  │   │
                    │  │  │   - Server Actions      │  │   │
                    │  │  │   - API Routes          │  │   │
                    │  │  └────────────────────────┘  │   │
                    │  │  ┌────────────────────────┐  │   │
                    │  │  │   Redis (Valkey)        │  │   │
                    │  │  │   - Session cache       │  │   │
                    │  │  │   - Rate limiting       │  │   │
                    │  │  │   - Flower dedup        │  │   │
                    │  │  └────────────────────────┘  │   │
                    │  └──────────────────────────────┘   │
                    └──────────┬──────────────────────────┘
                               │
                    ┌──────────▼──────────────────────────┐
                    │      Supabase Cloud (managed)        │
                    │  ┌──────────┐ ┌────────┐ ┌───────┐  │
                    │  │ Postgres │ │  Auth   │ │ Real- │  │
                    │  │   DB     │ │ GitHub  │ │ time  │  │
                    │  │          │ │ OAuth   │ │       │  │
                    │  └──────────┘ └────────┘ └───────┘  │
                    └─────────────────────────────────────┘
```

---

## Stack Details

### Application Layer

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Framework** | Next.js 15 (App Router) | SSR for SEO/OG tags, Server Actions for mutations, most AI-friendly framework |
| **Language** | TypeScript | Type safety, AI code generation quality |
| **ORM** | Drizzle ORM | Type-safe, lightweight, excellent Postgres/Supabase support, edge-compatible |
| **CSS** | Tailwind CSS | Fast UI development with AI, consistent with existing design tokens |
| **Hosting** | Hetzner CX23 + Coolify | EUR 3.49/mo, 20TB traffic, git push deploy |

### Data Layer

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Database** | Supabase Postgres | Free: 50K MAU, 500MB. Pro: $25/mo, 8GB, 100K MAU. Built-in real-time. |
| **Auth** | Supabase Auth | Integrated with DB (RLS), GitHub OAuth built-in, 50K MAU free |
| **Cache** | Redis (Valkey) on Coolify | Rate limiting, session cache, flower dedup. Runs on same VPS for free. |
| **ORM** | Drizzle + Supabase client | Drizzle for queries, Supabase client for auth/real-time subscriptions |

### Edge / CDN Layer

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **CDN/DNS** | Cloudflare (free plan) | Global CDN, DDoS protection, DNS management |
| **Image Storage** | Cloudflare R2 | $0 egress, 10GB free, perfect for OG images and screenshots |
| **OG Generation** | Cloudflare Workers (workers-og) | 100K req/day free, Satori+resvg at the edge, cached to R2 |
| **Badge SVG** | Cloudflare Workers | Lightweight SVG generation, cached at edge |

---

## Database Schema (Postgres via Drizzle)

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(20) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio VARCHAR(280),
  github_username VARCHAR(39),
  projects_count INT DEFAULT 0,
  flowers_received INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_username ON users(username);

-- Projects table (tombstones)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  start_date VARCHAR(7) NOT NULL,           -- YYYY or YYYY-MM
  end_date VARCHAR(7) NOT NULL,
  status VARCHAR(20) DEFAULT 'dead',        -- dead | zombie | buried | resurrectable
  cause_of_death VARCHAR(100) NOT NULL,
  epitaph VARCHAR(140) NOT NULL,
  description TEXT,
  website_url TEXT,
  repo_url TEXT,
  tech_stack TEXT[],                         -- array of tags
  flowers_count INT DEFAULT 0,
  og_image_url TEXT,                         -- cached R2 URL
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, slug)
);

CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_flowers ON projects(flowers_count DESC);
CREATE INDEX idx_projects_created ON projects(created_at DESC);

-- Flowers (reactions)
CREATE TABLE flowers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  visitor_hash VARCHAR(64) NOT NULL,        -- hashed IP or cookie
  flower_type VARCHAR(20) DEFAULT 'flower', -- flower | candle | rip | lol
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(project_id, visitor_hash)          -- one flower per visitor per project
);

CREATE INDEX idx_flowers_project ON flowers(project_id);

-- Causes of death (preset list)
CREATE TABLE causes_of_death (
  id SERIAL PRIMARY KEY,
  label VARCHAR(100) NOT NULL,
  emoji VARCHAR(10),
  sort_order INT DEFAULT 0
);

-- Row Level Security (Supabase)
-- Users: anyone can read, only owner can update
-- Projects: anyone can read, only owner can CRUD
-- Flowers: anyone can insert (rate limited), no update/delete
```

### Drizzle Schema (TypeScript)

```typescript
// db/schema.ts
import { pgTable, uuid, varchar, text, integer,
         timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 20 }).unique().notNull(),
  displayName: varchar('display_name', { length: 100 }),
  avatarUrl: text('avatar_url'),
  bio: varchar('bio', { length: 280 }),
  githubUsername: varchar('github_username', { length: 39 }),
  projectsCount: integer('projects_count').default(0),
  flowersReceived: integer('flowers_received').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  slug: varchar('slug', { length: 100 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  startDate: varchar('start_date', { length: 7 }).notNull(),
  endDate: varchar('end_date', { length: 7 }).notNull(),
  status: varchar('status', { length: 20 }).default('dead'),
  causeOfDeath: varchar('cause_of_death', { length: 100 }).notNull(),
  epitaph: varchar('epitaph', { length: 140 }).notNull(),
  description: text('description'),
  websiteUrl: text('website_url'),
  repoUrl: text('repo_url'),
  techStack: text('tech_stack').array(),
  flowersCount: integer('flowers_count').default(0),
  ogImageUrl: text('og_image_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  userSlugUnique: uniqueIndex('idx_projects_user_slug').on(table.userId, table.slug),
  userIdx: index('idx_projects_user').on(table.userId),
  flowersIdx: index('idx_projects_flowers').on(table.flowersCount),
}));

export const flowers = pgTable('flowers', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  visitorHash: varchar('visitor_hash', { length: 64 }).notNull(),
  flowerType: varchar('flower_type', { length: 20 }).default('flower'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  projectVisitorUnique: uniqueIndex('idx_flowers_unique').on(table.projectId, table.visitorHash),
  projectIdx: index('idx_flowers_project').on(table.projectId),
}));
```

---

## API Routes (Next.js App Router)

```
app/
├── (auth)/
│   ├── login/page.tsx              GET  — Auth screen
│   └── signup/
│       └── username/page.tsx       GET  — Username selection
├── (app)/
│   ├── dashboard/page.tsx          GET  — My graveyard (private)
│   ├── bury/page.tsx               GET  — Bury form
│   ├── bury/[id]/edit/page.tsx     GET  — Edit project
│   └── settings/page.tsx           GET  — Account settings
├── [username]/
│   ├── page.tsx                    GET  — Public graveyard
│   └── [slug]/page.tsx             GET  — Project detail
├── api/
│   ├── auth/
│   │   └── callback/route.ts       GET  — Supabase auth callback
│   ├── projects/
│   │   ├── route.ts                POST — Create project
│   │   └── [id]/
│   │       ├── route.ts            PATCH/DELETE — Update/delete project
│   │       └── flowers/route.ts    POST — Add flower (rate limited)
│   ├── username/
│   │   └── check/route.ts          GET  — Check username availability
│   └── og/
│       └── [projectId]/route.ts    GET  — Generate OG image (fallback)
├── layout.tsx                       Root layout
└── page.tsx                         Landing page (existing, migrated)
```

---

## OG Image Generation Pipeline

```
[User creates/edits project]
        │
        ▼
[Next.js Server Action]
        │
        ├── Save to Supabase Postgres
        │
        ▼
[Trigger: Cloudflare Worker call]
        │
        ▼
[CF Worker: workers-og]
  ├── Fetch project data from Supabase (via API key)
  ├── Render Death Certificate (Satori → resvg → PNG)
  ├── Upload to R2 bucket: /og/{projectId}.png
  └── Return R2 public URL
        │
        ▼
[Update project.og_image_url in Postgres]
        │
        ▼
[OG meta tag on project page references R2 URL directly]
```

**Caching strategy:**
- OG image generated once per project (on create)
- Regenerated only on edit (epitaph/name/dates change)
- Served directly from R2 via Cloudflare CDN ($0 egress)
- TTL: infinite (URL includes version hash for cache busting)

---

## Authentication Flow

```
[User clicks "Continue with GitHub"]
        │
        ▼
[Supabase Auth → GitHub OAuth]
        │
        ▼
[GitHub authorizes → redirect to /api/auth/callback]
        │
        ▼
[Supabase creates session]
        │
        ├── New user? → /signup/username (choose username)
        └── Existing? → /dashboard
```

**Session management:**
- Supabase manages JWT tokens (httpOnly cookies)
- Server-side: `createServerClient()` from `@supabase/ssr`
- Client-side: `createBrowserClient()` for real-time subscriptions
- Redis: rate limiting + flower dedup (not for sessions)

---

## Deployment Pipeline

```
[Developer pushes to main]
        │
        ▼
[GitHub webhook → Coolify]
        │
        ▼
[Coolify builds Docker image]
  ├── npm install
  ├── next build
  └── Docker: node:22-alpine + standalone output
        │
        ▼
[Zero-downtime deploy on Hetzner VPS]
        │
        ▼
[Coolify manages SSL (Let's Encrypt), reverse proxy (Traefik)]
```

**Coolify configuration:**
- Source: GitHub repository
- Build: Nixpacks (auto-detect Next.js) or Dockerfile
- Port: 3000
- Domain: mydeadprojects.com (via Cloudflare DNS)
- SSL: auto (Let's Encrypt via Traefik)
- Health check: /api/health
- Environment variables: managed in Coolify UI

---

## Cost Model

### At Rest (MVP, < 100 users)

| Service | Tier | Cost |
|---------|------|------|
| Hetzner CX23 | Shared | EUR 3.49/mo (~$3.80) |
| Supabase | Free | $0 |
| Cloudflare | Free | $0 |
| Cloudflare R2 | Free tier | $0 |
| Cloudflare Workers | Free tier | $0 |
| Domain | .com | ~$10/year |
| **Total** | | **~$4.60/mo** |

### Growth (1K-10K users, moderate traffic)

| Service | Tier | Cost |
|---------|------|------|
| Hetzner CX23 | Same | EUR 3.49/mo |
| Supabase | Free (still within limits) | $0 |
| Cloudflare | Free | $0 |
| R2 | ~5GB images | ~$0.08/mo |
| Workers | Within free tier | $0 |
| **Total** | | **~$4.60/mo** |

### Viral (100K users, millions of page views)

| Service | Tier | Cost |
|---------|------|------|
| Hetzner CX33 (upgrade) | 4 vCPU / 8GB | EUR 7.49/mo (~$8.15) |
| Supabase | Pro | $25/mo |
| Cloudflare | Free (still sufficient) | $0 |
| R2 | ~50GB images, 50M reads | ~$1.50/mo |
| Workers | Paid ($5/mo) | $5/mo |
| **Total** | | **~$40/mo** |

### Extreme Viral (1M users)

| Service | Tier | Cost |
|---------|------|------|
| Hetzner CX52 | 16 vCPU / 32GB | EUR 34.49/mo (~$37.50) |
| Supabase | Pro + compute add-on | ~$50/mo |
| Cloudflare | Pro ($20/mo) | $20/mo |
| R2 | ~200GB | ~$3/mo |
| Workers | Paid | $5/mo |
| **Total** | | **~$115/mo** |

---

## Scaling Strategy

### Phase 1 (MVP → 10K users): Single VPS

Everything runs on one Hetzner CX23:
- Next.js app (standalone mode)
- Redis (Valkey) container
- Supabase handles DB externally
- Cloudflare handles CDN + OG + images

### Phase 2 (10K → 100K users): Vertical scale

- Upgrade Hetzner VPS (CX23 → CX33 → CX52) — zero-downtime via Coolify
- Upgrade Supabase (Free → Pro)
- Add Cloudflare caching rules for public pages (/@username cached 60s)

### Phase 3 (100K+ users): Horizontal scale

- Add second Hetzner VPS (load balancer via Cloudflare)
- Or migrate to Hetzner dedicated server
- Supabase handles scaling internally
- Consider read replicas if needed

---

## Security

- **Auth:** Supabase Auth (industry-standard JWT, httpOnly cookies)
- **RLS:** Row-Level Security on all tables (Supabase native)
- **Rate limiting:** Redis-based (flowers: 1/project/24h, API: 100 req/min)
- **CORS:** Strict origin whitelist
- **CSP:** Content Security Policy headers
- **Input validation:** Zod schemas on all API inputs
- **SQL injection:** Prevented by Drizzle ORM (parameterized queries)
- **XSS:** React auto-escaping + CSP headers
- **Secrets:** Managed in Coolify environment variables (encrypted at rest)

---

## Monitoring (free tier)

| Tool | Purpose | Cost |
|------|---------|------|
| Coolify built-in | Container health, logs, resource usage | $0 |
| Cloudflare Analytics | Traffic, cache hit ratio, threats | $0 |
| Supabase Dashboard | DB size, query performance, auth metrics | $0 |
| UptimeRobot | Uptime monitoring, alerting | $0 (50 monitors) |
| Sentry | Error tracking (free: 5K events/mo) | $0 |

---

## File Structure (Next.js Project)

```
mydeadprojects/
├── public/                     # Static assets (landing page favicon, etc.)
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/             # Auth-related pages (login, signup)
│   │   ├── (app)/              # Authenticated pages (dashboard, bury, settings)
│   │   ├── [username]/         # Public graveyard + project detail
│   │   ├── api/                # API routes
│   │   ├── layout.tsx          # Root layout (fonts, theme, analytics)
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── ui/                 # Base UI components (Button, Input, Card...)
│   │   ├── tombstone-card.tsx  # Tombstone card component
│   │   ├── bury-form.tsx       # Project creation form
│   │   ├── graveyard-grid.tsx  # Grid of tombstones
│   │   ├── death-certificate.tsx # Certificate preview
│   │   ├── flower-button.tsx   # Flower reaction button
│   │   └── share-menu.tsx      # Share dropdown
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts       # Browser Supabase client
│   │   │   ├── server.ts       # Server Supabase client
│   │   │   └── middleware.ts   # Auth middleware
│   │   ├── db/
│   │   │   ├── schema.ts       # Drizzle schema
│   │   │   ├── index.ts        # Drizzle client
│   │   │   └── queries.ts      # Typed query helpers
│   │   ├── r2.ts               # Cloudflare R2 upload helper
│   │   ├── redis.ts            # Redis client
│   │   ├── og.ts               # OG image trigger helper
│   │   └── utils.ts            # Slugify, date formatting, etc.
│   ├── actions/                # Server Actions
│   │   ├── projects.ts         # Create, update, delete projects
│   │   ├── flowers.ts          # Add flower reaction
│   │   └── auth.ts             # Username claim, profile update
│   └── types/                  # TypeScript types
│       └── index.ts
├── workers/
│   └── og-generator/           # Cloudflare Worker for OG images
│       ├── src/index.ts
│       └── wrangler.toml
├── supabase/
│   ├── migrations/             # SQL migrations
│   └── seed.sql                # Seed data (causes of death)
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── Dockerfile                  # For Coolify deployment
```

---

## Key Technical Decisions Summary

| Decision | Choice | Key Reason |
|----------|--------|------------|
| Hosting | Hetzner + Coolify | EUR 3.49/mo, 20TB traffic, survives viral spikes |
| Database | Supabase Postgres | Free 50K MAU + auth + real-time, $25/mo at scale |
| Auth | Supabase Auth | Integrated with DB, GitHub OAuth, RLS |
| ORM | Drizzle | Type-safe, lightweight, edge-compatible |
| Framework | Next.js 15 (App Router) | SSR for SEO, Server Actions, AI-friendly |
| Image storage | Cloudflare R2 | $0 egress (critical for viral image sharing) |
| OG generation | Cloudflare Workers (workers-og) | 100K/day free, edge, cached to R2 |
| Cache | Redis (Valkey) on same VPS | Rate limiting, dedup — zero extra cost |
| CSS | Tailwind CSS | Fast AI-assisted UI development |
| Deploy | Coolify (git push) | PaaS experience on own server |
| CDN | Cloudflare (free) | Global CDN, DDoS protection, DNS |
| Monitoring | Coolify + UptimeRobot + Sentry | All free tiers |
