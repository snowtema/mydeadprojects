# FPF Analysis: Project Page and Hidden Audience Needs

**Date**: 2026-02-18
**Method**: FPF (A.7 Strict Distinction, B.5 Reasoning Cycle, A.10 Evidence Graph)
**Subject**: Web application "My Dead Projects" — a graveyard for abandoned side projects
**Target audience**: Developers with unfinished projects seeking social acceptance and humor

---

## 1. CRITICAL GAPS (promised but not implemented)

### 1.1 "Resurrect or Adopt" — false promise on the landing page

**Evidence**: `src/app/page.tsx:26-27` — the feature is described in the features block on the homepage, but there is no UI, API, or even a database schema field for adoption anywhere in the code.

**Why critical**: This is the most viral mechanic in the concept. A visitor sees a dead project, wants to adopt it, finds no button, and leaves. The landing page promises, but the product does not deliver. Violation of A.7 (plan != implementation).

### 1.2 "GitHub Integration" — another promise without implementation

**Evidence**: `src/app/page.tsx:31-33` — described as a feature, but there is no mechanism for repo import, inactive project scanning, or form auto-fill from GitHub.

**Why critical**: GitHub OAuth exists but is used **only for authentication**. The user logs in via GitHub, expects "we'll find your dead repos" — gets nothing.

**Recommendation**: Either remove both items from the landing page immediately (honesty > marketing), or add a "Coming soon" label.

---

## 2. WHAT IS MISSING (hidden audience needs)

### 2.1 Lessons and reflection — the main value, hidden behind a toggle

**Current state**: The `description` field is hidden behind a "More details (optional)" collapse (`bury-form.tsx:249-254`). On the project page it appears as plain text under the "Description" heading.

**Hidden need**: People come not for the tombstone image, but for the **story**. "What went wrong" is the most shareable content. The current UX makes users skip right past it.

**Recommendation**: Add a separate field "What did you learn?" / "Lessons from the grave" — make it prominent on both the form and the project page. This transforms the product from a meme into valuable content.

### 2.2 Comments / "Condolence Book" — completely absent

**Current state**: A visitor can only press F / candle / rip / lol. It is a one-time action with no return.

**Hidden need**: A memorial without a guest book is incomplete. Developers want to write "I had the same idea lol" or "This is literally my life". Comments = content = SEO = virality = retention.

### 2.3 "Time since death" — missing

**Current state**: The dates `startDate – endDate` are shown. No relative time.

**Hidden need**: "Dead for 3 years" or "Buried 2 weeks ago" is an emotional anchor. A fresh grave evokes sympathy, an old one — respect. A timer exists on the landing page (countdown in funeral animation), but not on the project page itself.

### 2.4 Related / similar projects — no section

**Current state**: The project page ends with a link to the author's graveyard. No navigation to other projects.

**Hidden need**: "Yet another todo-app died" — the user wants to see they are not alone. A "Others who died young" or "Similar graves" section increases time-on-site and creates a sense of community.

### 2.5 Conversion CTA after reaction — missing

**Current state**: Visitor presses F — nothing happens. Counter +1, that is all.

**Hidden need**: The moment after a reaction is peak engagement. The ideal moment for "You pressed F. Now bury your own dead projects ->". On the `/[username]` page there is a CTA in the footer; on `/[username]/[slug]` there is none.

### 2.6 OG image is not auto-generated

**Current state**: The `ogImageUrl` field exists in the schema, the route `/api/og/[projectId]` exists, but the `createProject` action has no auto-generation. The OG image only appears if the user manually does something (or the logic is hidden).

**Hidden need**: When sharing on Twitter without a nice OG card, click-through rate drops significantly. Every project should automatically receive a generated tombstone image.

---

## 3. WHAT IS REDUNDANT / OVERWEIGHT

### 3.1 LinkedIn sharing — cultural mismatch

**Evidence**: `share-menu.tsx:24` — LinkedIn share button.

**Problem**: The target audience shares memes and failures on Twitter/X, Reddit, Discord. LinkedIn is a platform for professional achievements. Nobody posts "RIP my failed startup" on LinkedIn (well, almost nobody). It takes up space and dilutes focus.

**Recommendation**: Replace with Reddit or remove entirely. Alternatively, add "Share to Bluesky" — closer to the dev community.

### 3.2 Keyboard shortcut (F key) — overengineered for a share landing page

**Evidence**: `flower-button.tsx:115-126` — global keydown listener on "F".

**Problem**: 95% of visitors arrive via a shared link in a mobile Twitter client. They have no keyboard. For desktop visitors, the shortcut is undiscoverable — no onboarding or tooltip. Effort is disproportionate to impact.

**Nuance**: This is more of a "nice easter egg bonus" than a problem. Do not remove, but do not consider it a core feature either.

### 3.3 Four reaction types — more complex than needed at launch

**Current state**: flower, candle, rip, lol — four reactions with different icons, counts, and styles.

**Problem**: For an MVP this is overweight. "Press F" is the only mechanic that is meme-worthy and shareable. Candle, RIP, LOL dilute the focus and complicate the UI. The user hesitates: "what should I press?" instead of "press F".

**Recommendation**: Keep F as primary (already the case), but consider removing the rest until a real community forms and there is a need for nuance.

### 3.4 Tech stack chips on the project page — noise for the casual visitor

**Current state**: `[username]/[slug]/page.tsx:113-124` — technology chips.

**Problem**: The person arrived via a link from Twitter. They care about the story and epitaph, not that the project was built with "React, Node.js, MongoDB". Tech stack is only interesting to other developers who are deliberately exploring — roughly 5% of the page audience.

**Recommendation**: Do not remove, but move below the description and reaction buttons. Currently tech stack is shown before description — this is the wrong hierarchy.

---

## 4. STRUCTURAL ISSUES ON THE PROJECT PAGE

### 4.1 Information hierarchy is broken

Current order on `/[username]/[slug]`:

1. Tombstone (name, dates, epitaph)
2. Cause of death
3. **Tech stack** — out of place
4. **Description** — the most valuable content, but third in order
5. Reactions + Share
6. Links (website/repo)

**Correct hierarchy** (based on visitor needs):

1. Tombstone (hook)
2. Cause of death (context)
3. Description / "What I learned" (value)
4. **Reactions + Share** (action at peak engagement)
5. Links (for those who want to go deeper)
6. Tech stack (supplementary)
7. Related projects (retention)
8. CTA "Bury your own" (conversion)

### 4.2 No navigation between projects by the same author

Currently: `<- @username's graveyard` at the top and "View full graveyard" at the bottom. Both lead to the grid.

**Hidden need**: Simple "<- Previous / Next ->" arrows between projects by the same author. A person visits one project and wants to see the rest without going back to the grid.

---

## 5. RECOMMENDATION SUMMARY MATRIX

| # | What | Type | Priority | Effort |
|---|------|------|----------|--------|
| 1 | Remove/label "Coming soon" on Adopt + GitHub Integration | False promise fix | **P0** | Min. |
| 2 | Auto-generate OG images on project creation | Missing core | **P0** | Med. |
| 3 | Move Description above Tech Stack | UX fix | **P1** | Min. |
| 4 | Add CTA "Bury your own" after reaction | Conversion | **P1** | Min. |
| 5 | "Lessons learned" / "What I learned" field (separate from description) | Content value | **P1** | Med. |
| 6 | "Dead for X years/months" on project page | Emotional hook | **P2** | Min. |
| 7 | "Similar graves" / related projects section | Retention | **P2** | Med. |
| 8 | Replace LinkedIn with Reddit/Bluesky in share menu | Cultural fit | **P2** | Min. |
| 9 | Prev/next navigation between author's projects | UX | **P3** | Low |
| 10 | Comments system / "Condolence book" | Community | **P3** | High |
| 11 | Remove/simplify candle+rip+lol reactions | Simplify | **P3** | Low |

---

## Key Takeaway

The product has an **excellent visual concept and tone** — dark humor, graveyard aesthetic, "Press F" — all of this works. The main problem: **imbalance between form and substance**. The tombstone is beautiful, but the content inside is thin. The product sells a "meme image for Twitter" but does not provide enough value for people to come back or spend time on thoughtful submissions.

The two false promises on the landing page (Adopt, GitHub) are a trust debt that needs to be addressed immediately.
