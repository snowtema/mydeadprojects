# Phase 1 — MVP: UX Flow & Design Specification

## Design System (inherited from landing page)

### Colors
```
--bg:           #0a0a0a     (main background)
--bg-subtle:    #111111     (card hover, secondary surfaces)
--bg-card:      #141414     (cards, modals, inputs)
--border:       #1e1e1e     (default borders)
--border-hover: #2a2a2a     (hover state borders)
--text:         #e0e0e0     (primary text)
--text-dim:     #999999     (secondary text)
--text-muted:   #6a6a6a     (tertiary, captions)
--accent:       #aaaaaa     (focus states)
--green:        #5a9a5a     (success, alive)
--red:          #8a3a3a     (danger, dead)
```

### Typography
- Font: JetBrains Mono (monospace stack)
- Scale: clamp()-based fluid type
- Weights: 300 (light), 400 (regular), 500 (medium), 700 (bold)

### Components vocabulary
- Cards: bg-card + 1px border + 6px radius
- Buttons primary: white bg, black text, 6px radius
- Buttons secondary: bg-card + border, text-dim
- Inputs: bg-card + border, 12px 16px padding
- Noise overlay + scanlines (retained globally)

---

## Sitemap (Phase 1)

```
/                           Landing page (existing)
/login                      Auth screen (GitHub OAuth + email)
/signup                     Registration (username selection)
/dashboard                  My graveyard management (private)
/@{username}                Public graveyard profile
/@{username}/{project-slug} Individual project tombstone (public)
/bury                       Add new dead project form
/bury/{id}/edit             Edit existing project
/settings                   Account settings
```

---

## User Flows

### Flow 1: Registration & First Burial

```
[Landing Page]
    → CTA "Start Burying" / "Join Waitlist" changes to "Bury Your First Project"
    → [Auth Screen]
        → GitHub OAuth (primary — one click)
        → Email + password (secondary)
    → [Username Selection]
        → Input: "Choose your graveyard URL"
        → Preview: mydeadprojects.com/@username
        → Validation: availability check in real-time
    → [First Burial — Onboarding Wizard]
        → Step 1: "What's the name of your dead project?"
            → Text input, large, centered
            → Placeholder: "e.g., todo-app-v3"
        → Step 2: "When did it live?"
            → Two date pickers: Started / Abandoned
            → Shortcut buttons: "This year", "Last year", "I don't remember"
        → Step 3: "How did it die?" (Cause of Death)
            → Preset grid of causes (clickable cards):
              [ ] "Lost motivation"
              [ ] "Scope creep"
              [ ] "Already exists"
              [ ] "No users"
              [ ] "Co-founder left"
              [ ] "Shiny new idea"
              [ ] "Tech debt killed it"
              [ ] "Ran out of money"
              [ ] "Life happened"
              [ ] Other: [custom input]
        → Step 4: "Write an epitaph" (KEY MOMENT)
            → Textarea, 140 char limit
            → Character counter
            → Placeholder: "Rest in peace, dear code..."
            → Examples shown below (rotating):
              '"This time it'll be different"'
              '"Gone but not version-controlled"'
              '"It worked on my machine"'
        → Step 5: "Optional details"
            → Description (textarea, optional)
            → Website URL (optional)
            → Repo URL (optional)
            → Tech stack tags (autocomplete)
        → [Preview Death Certificate]
            → Full visual preview of the tombstone card
            → "Looks good? Bury it."
            → Button: "Bury It 🪦" (primary)
    → [Graveyard Created — Celebration Screen]
        → Animation: tombstone rising from ground
        → "Your graveyard is live!"
        → URL: mydeadprojects.com/@username
        → Share buttons: Twitter, LinkedIn, Copy Link
        → "Share your graveyard" / "Bury another project"
```

### Flow 2: Returning User — Add Project

```
[Dashboard]
    → "Bury New Project" button (always visible, top-right)
    → [Bury Form] (same as onboarding but without wizard — single page form)
        → All fields visible at once
        → Quick-add mode
    → [Preview] → [Confirm] → Tombstone added to graveyard
```

### Flow 3: Viewing Public Graveyard

```
[/@username]
    → Header: username, avatar, bio, stats
    → Stats bar: "X projects buried · joined [date] · Y flowers received"
    → Grid of tombstones (sorted by death date, newest first)
    → Each tombstone card:
        → Project name
        → Dates
        → Epitaph
        → Cause of death tag
        → Flowers count 🌸
        → Click → expands to full project view
    → Share button for entire graveyard
    → "Bury your own projects" CTA for visitors
```

### Flow 4: Sharing (Viral Loop)

```
[Any tombstone or graveyard page]
    → Share button → dropdown:
        → "Copy Link" (copies URL)
        → "Share on Twitter" (pre-filled text + OG card)
        → "Share on LinkedIn"
        → "Download Death Certificate" (PNG)
    → OG meta tags auto-generate preview card with:
        → Project name
        → Epitaph
        → Dates
        → Tombstone visual
        → MDP branding
```

---

## Screen Specifications

### Screen 1: Auth (/login)

```
┌─────────────────────────────────────────────┐
│                                             │
│                    🪦                        │
│           mydeadprojects                    │
│                                             │
│    ┌─────────────────────────────────┐      │
│    │  ⚡ Continue with GitHub         │      │
│    └─────────────────────────────────┘      │
│                                             │
│              ── or ──                       │
│                                             │
│    ┌─────────────────────────────────┐      │
│    │  Email                          │      │
│    └─────────────────────────────────┘      │
│    ┌─────────────────────────────────┐      │
│    │  Password                       │      │
│    └─────────────────────────────────┘      │
│    ┌─────────────────────────────────┐      │
│    │  Sign In                        │      │
│    └─────────────────────────────────┘      │
│                                             │
│    Don't have an account? Sign up           │
│                                             │
└─────────────────────────────────────────────┘
```

**Design notes:**
- GitHub OAuth = primary button (white bg, full width)
- Email/password = secondary path (muted)
- Centered, max-width 380px
- Logo + title at top
- Minimal — no distractions

### Screen 2: Username Selection (/signup/username)

```
┌─────────────────────────────────────────────┐
│                                             │
│         Choose your graveyard URL           │
│                                             │
│    mydeadprojects.com/@                     │
│    ┌─────────────────────────────────┐      │
│    │  username                       │      │
│    └─────────────────────────────────┘      │
│    ✓ Available                              │
│                                             │
│    ┌─────────────────────────────────┐      │
│    │  Claim My Graveyard             │      │
│    └─────────────────────────────────┘      │
│                                             │
└─────────────────────────────────────────────┘
```

**Design notes:**
- Real-time availability check (debounced 300ms)
- Green checkmark if available, red X if taken
- Username rules: lowercase, alphanumeric, hyphens, 3-20 chars
- Pre-fill from GitHub username if available

### Screen 3: Dashboard (/dashboard)

```
┌─────────────────────────────────────────────────────┐
│  🪦 mydeadprojects          @username    [Settings]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Your Graveyard                   [+ Bury Project]  │
│  ─────────────────────────────────────────────────  │
│  3 projects buried · 12 flowers · Share: [🔗][𝕏]   │
│                                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐│
│  │   ✝          │ │   ✝          │ │   ✝          ││
│  │ todo-app-v3  │ │ crypto-trk   │ │ dogs-dating  ││
│  │ 2023 — 2023  │ │ 2021 — 2021  │ │ 2024 — 2024  ││
│  │              │ │              │ │              ││
│  │ "This time   │ │ "Lost money  │ │ "Good boy.   ││
│  │  it'll be    │ │  before I    │ │  Bad idea."  ││
│  │  different"  │ │  lost code"  │ │              ││
│  │              │ │              │ │              ││
│  │ 🌸 5  [Edit] │ │ 🌸 3  [Edit] │ │ 🌸 4  [Edit] ││
│  └──────────────┘ └──────────────┘ └──────────────┘│
│                                                     │
│  ┌─ ─ ─ ─ ─ ─ ─ ─┐                                │
│  │  + Bury another │                                │
│  │    project      │                                │
│  └─ ─ ─ ─ ─ ─ ─ ─┘                                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Design notes:**
- Navbar: logo left, username + settings right
- Stats bar below title
- Tombstone cards in responsive grid (3 cols desktop, 2 tablet, 1 mobile)
- Each card has Edit button (owner view)
- Empty state card with dashed border: "+ Bury another project"
- Share buttons inline with stats

### Screen 4: Bury Form (/bury)

```
┌─────────────────────────────────────────────────────┐
│  🪦 mydeadprojects          @username               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Bury a Project                                     │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  Project Name *                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │  e.g., todo-app-v3                          │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  When did it live?                                  │
│  ┌──────────────────┐  ┌──────────────────┐         │
│  │  Started: 2023   │  │  Died: 2024      │         │
│  └──────────────────┘  └──────────────────┘         │
│  [This year] [Last year] [I don't remember]         │
│                                                     │
│  Cause of Death *                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Lost     │ │ Scope    │ │ Already  │            │
│  │ motiv.   │ │ creep    │ │ exists   │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ No users │ │ Shiny    │ │ Life     │            │
│  │          │ │ new idea │ │ happened │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│  ┌──────────────────────────────────────┐           │
│  │ Other: type your own...              │           │
│  └──────────────────────────────────────┘           │
│                                                     │
│  Epitaph *                         119/140          │
│  ┌─────────────────────────────────────────────┐    │
│  │  "Here lies my greatest ambition..."        │    │
│  └─────────────────────────────────────────────┘    │
│  💡 "Gone but not version-controlled"               │
│                                                     │
│  ▸ More details (optional)                          │
│    Description, Website, Repo, Tech stack           │
│                                                     │
│  ─── Preview ─────────────────────────────────────  │
│                                                     │
│       ┌──────────────────┐                          │
│       │       ✝          │                          │
│       │   todo-app-v3    │                          │
│       │   2023 — 2024    │                          │
│       │                  │                          │
│       │  "Here lies my   │                          │
│       │   greatest..."   │                          │
│       │                  │                          │
│       │  Lost motivation │                          │
│       └──────────────────┘                          │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │             🪦 Bury It                       │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Design notes:**
- Single scrollable page (NOT wizard for returning users)
- Live preview at the bottom updates as user types
- "More details" section collapsed by default (accordion)
- Epitaph has rotating placeholder examples
- Character counter for epitaph (turns red at 130+)
- Cause of death = selectable cards (one selection, highlight on pick)
- "Other" cause = inline text input that appears on selection

### Screen 5: Public Graveyard (/@username)

```
┌─────────────────────────────────────────────────────┐
│  🪦 mydeadprojects                    [Bury Yours]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│         ┌───┐                                       │
│         │ 🧑 │  @artem                               │
│         └───┘  "I build things that don't last"     │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │  5 buried  ·  23 🌸  ·  member since 2024   │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  [Share Graveyard 🔗]  [Copy Badge]                 │
│                                                     │
│  ─── The Graveyard ─────────────────────────────    │
│                                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐│
│  │   ✝          │ │   ✝          │ │   ✝          ││
│  │ todo-app-v3  │ │ crypto-trk   │ │ dogs-dating  ││
│  │ 2023 — 2023  │ │ 2021 — 2021  │ │ 2024 — 2024  ││
│  │              │ │              │ │              ││
│  │ "This time   │ │ "Lost money  │ │ "Good boy.   ││
│  │  it'll be    │ │  before I    │ │  Bad idea."  ││
│  │  different"  │ │  lost code"  │ │              ││
│  │              │ │              │ │              ││
│  │ Lost motiv.  │ │ No users    │ │ Bad idea     ││
│  │ 🌸 5         │ │ 🌸 3         │ │ 🌸 4         ││
│  └──────────────┘ └──────────────┘ └──────────────┘│
│                                                     │
│  ─── Don't just spectate. ──────────────────────    │
│  ┌─────────────────────────────────────────────┐    │
│  │       Bury your own dead projects →          │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Design notes:**
- Public page, no auth required to view
- User header: avatar (from GitHub or default gravestone), username, bio
- Stats bar: total buried, total flowers, join date
- Share buttons: share entire graveyard, copy embeddable badge
- Grid of tombstones (click to expand)
- CTA for visitors at bottom: "Bury your own dead projects"
- Tombstone cards are NOT editable in public view (no Edit button)

### Screen 6: Project Detail (/@username/project-slug)

```
┌─────────────────────────────────────────────────────┐
│  🪦 mydeadprojects          ← @artem's graveyard    │
├─────────────────────────────────────────────────────┤
│                                                     │
│               ┌──────────────────────┐              │
│               │                      │              │
│               │          ✝           │              │
│               │                      │              │
│               │     todo-app-v3      │              │
│               │                      │              │
│               │    Jan 2023 — Mar    │              │
│               │        2023          │              │
│               │                      │              │
│               │  "This time it'll    │              │
│               │    be different"     │              │
│               │                      │              │
│               └──────────────────────┘              │
│                                                     │
│  Cause of death: Lost motivation                    │
│  Lived for: 2 months                                │
│  Tech stack: React, Node.js, MongoDB                │
│                                                     │
│  Description                                        │
│  ─────────────                                      │
│  Yet another todo app. This time with AI-powered    │
│  task prioritization. Got as far as the login page. │
│                                                     │
│  🌸 5 flowers                                       │
│  [Leave Flowers 🌸]  [Share]  [Download Certificate]│
│                                                     │
│  ─── From @artem's graveyard ───────────────────    │
│  5 projects buried · View full graveyard →          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Design notes:**
- Large central tombstone (hero element)
- Full details below
- "Leave Flowers" button (works without auth — cookie-based rate limit)
- Share + Download Death Certificate buttons
- Link back to full graveyard
- OG meta tags for this page generate the Death Certificate image

---

## Death Certificate (OG Image) Specification

Generated server-side for each project. Optimized for social media preview.

```
┌─────────────────────────────────────────────┐
│                                             │
│  DEATH CERTIFICATE                          │
│  ═══════════════════════════════════════     │
│                                             │
│  Name:           todo-app-v3                │
│  Born:           January 2023               │
│  Died:           March 2023                 │
│  Cause of Death: Lost motivation            │
│                                             │
│  ─────────────────────────────────────      │
│                                             │
│  "This time it'll be different"             │
│                                             │
│  ─────────────────────────────────────      │
│                                             │
│  Buried by @artem                           │
│  mydeadprojects.com/@artem                  │
│                                             │
│  🪦 mydeadprojects.com                      │
│                                             │
└─────────────────────────────────────────────┘
```

**Specs:**
- Size: 1200x630px (Twitter/LinkedIn OG standard)
- Background: #0a0a0a with noise texture
- Font: JetBrains Mono
- Border: subtle 1px #1e1e1e
- Generated via: server-side rendering (Satori/Vercel OG or Puppeteer)
- Cached: regenerate only on project edit
- Also generate 1080x1920 variant for Instagram Stories

---

## CV Badge Specification

Embeddable badge for GitHub README files.

**Markdown:**
```markdown
[![My Dead Projects](https://mydeadprojects.com/@username/badge.svg)](https://mydeadprojects.com/@username)
```

**Badge design:**
```
┌────────────────────────────┬──────────┐
│ 🪦 dead projects           │    5     │
└────────────────────────────┴──────────┘
```

- Style: shields.io-compatible SVG
- Left: "dead projects" label with gravestone emoji
- Right: count of buried projects
- Colors: dark theme (#0a0a0a bg, #e0e0e0 text)
- Links to public graveyard

---

## Interaction Design

### Tombstone Card Hover
- Border color transitions from --border to --border-hover (200ms)
- Slight Y-translate up (-2px)
- Epitaph text fades to full opacity

### Bury Button Animation
- On click: button text changes "Bury It 🪦" → loading spinner → "Buried ✓" (green)
- Tombstone appears with rise-from-ground animation (translateY 20px → 0, opacity 0 → 1, 600ms ease-out)

### Flower Button
- On click: flower emoji floats up from button position (translateY 0 → -40px, opacity 1 → 0, 800ms)
- Counter increments
- Button briefly shows pressed state
- Rate limit: 1 flower per project per visitor per 24h

### Page Transitions
- Fade-in on scroll (existing pattern from landing page)
- Tombstone cards stagger-animate on page load (50ms delay between each)

### Empty State (no projects yet)
```
┌─────────────────────────────────────┐
│                                     │
│       Your graveyard is empty.      │
│    Every developer has dead code.   │
│      Time to give it a burial.      │
│                                     │
│        [Bury Your First Project]    │
│                                     │
└─────────────────────────────────────┘
```

---

## Responsive Breakpoints

| Breakpoint | Tombstone Grid | Layout |
|---|---|---|
| > 768px | 3 columns | Full sidebar nav |
| 540-768px | 2 columns | Collapsed nav |
| < 540px | 1 column | Mobile stack, hamburger menu |

---

## Technical Notes (Phase 1)

### Stack recommendation
- **Frontend:** Next.js (SSR for OG tags + SEO) or static SPA with Cloudflare Workers for OG
- **Auth:** Firebase Auth (GitHub OAuth + email)
- **Database:** Firestore (already have Firebase project "my-dead-projects")
- **OG Image Generation:** @vercel/og (Satori) or Cloudflare Workers with resvg
- **Hosting:** Firebase Hosting (already configured)
- **Badge:** SVG endpoint (serverless function)

### Data Model
```
users/
  {userId}/
    username: string
    displayName: string
    avatar: string (URL)
    bio: string (optional)
    createdAt: timestamp

projects/
  {projectId}/
    userId: string
    slug: string
    name: string
    startDate: string (YYYY or YYYY-MM)
    endDate: string (YYYY or YYYY-MM)
    status: "dead" | "zombie" | "buried" | "resurrectable"
    causeOfDeath: string
    epitaph: string (max 140)
    description: string (optional)
    websiteUrl: string (optional)
    repoUrl: string (optional)
    techStack: string[] (optional)
    flowersCount: number
    createdAt: timestamp
    updatedAt: timestamp

usernames/
  {username}/
    userId: string

flowers/
  {projectId}_{visitorHash}/
    createdAt: timestamp
```

### SEO & OG Strategy
- Every public page (/@user, /@user/project) has unique OG tags
- Dynamic OG image for each project (Death Certificate)
- Graveyard page OG: shows top 3 tombstones as visual grid
- Structured data (JSON-LD) for project pages
- Sitemap generation for public graveyards

---

## Priority Implementation Order

1. Auth (GitHub OAuth) + username selection
2. Bury form (create project)
3. Dashboard (list own projects)
4. Public graveyard page (/@username)
5. Project detail page (/@username/slug)
6. OG image generation (Death Certificate)
7. Share functionality
8. Flower reactions
9. CV Badge (SVG endpoint)
10. Landing page update (replace waitlist with "Start Burying" CTA)
