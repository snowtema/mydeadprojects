# MyDeadProjects — Product Vision

## Mission

**"Make failure a standard part of a developer's portfolio."**

MDP is not a "dead project tracker." It's a **cultural tool** that flips the attitude toward failure from "shame" to "experience, humor, and community."

---

## FPF Decomposition

| FPF Element | Mapping |
|---|---|
| **Holon** | MDP platform (whole = ecosystem; parts = profiles, tombstones, social mechanics, viral loops) |
| **BoundedContext** | Side-project culture among developers and indie hackers |
| **Method vs Work** | MethodDescription (vision/plan) — NOT execution. Strict distinction A.7 |
| **Evidence** | Psychology of sharing failure, brain biochemistry, virality mechanics |

---

## Anomaly Statement (B.5.2)

Developers massively accumulate abandoned projects (average dev has 5-15 dead repos on GitHub). Yet:
- No standardized way to document and share this experience exists
- Shame of failure prevents open discussion, though failure is statistically the most common outcome
- CVs show only successes, creating a distorted picture (survivorship bias)
- Industry declares "fail fast, learn faster" but has no infrastructure for it

**Anomaly:** Development culture glorifies failure in words but lacks a tool to transform dead projects from a source of shame into a source of status, learning, and social connection.

---

## Psycho-Biochemical Model of Target Audience

| Neurotransmitter | Trigger | How MDP Uses It |
|---|---|---|
| **Dopamine** | Novelty, surprise, reward anticipation, social approval | Viral formats, unexpected epitaphs, counters, activity feed, "flowers" on graves |
| **Oxytocin** | Vulnerability, empathy, trust, belonging | Act of "admitting" a dead project = confession -> empathy from others -> they share theirs |
| **Serotonin** | Status, recognition, significance | "Graveyard veteran" badges, public profile, buried project count as experience measure |
| **Cortisol (reduction)** | Humor, catharsis, normalization | Funny epitaphs reduce anxiety. "Everyone buries projects" -> "I'm normal" -> relief |
| **Endorphins** | Laughter, creative self-expression | Writing epitaphs = creative act, browsing others' = entertainment |

**Key insight:** Sharing failure is counter-intuitively powerful because:
1. Vulnerability -> oxytocin -> stronger bonds (Brene Brown effect)
2. Failure normalization -> cortisol reduction -> relief
3. Humor in epitaphs -> dopamine + endorphins -> virality
4. "I've buried so many" -> serotonin -> experienced builder status

---

## Target Audience Profiles

| Segment | Motive | Fear | Trigger |
|---|---|---|---|
| **Indie hacker** (primary) | Show experience, be part of community | "I fail too often" | Seeing everyone fails -> relief -> "I'll share too" |
| **Employed developer** | Prove they do side projects | "I have nothing to show besides work" | Dead project = still a project = CV supplement |
| **Startup founder** | Reflection, lessons learned | "I wasted time/money" | Cataloging failures -> patterns -> growth |
| **Team lead/CTO** | Evaluate candidates by breadth of experience | "This candidate only tried one stack?" | MDP profile as GitHub supplement |

---

## Product Hypotheses (NQD-filtered)

### H1: Graveyard Profile (CORE)
Personal graveyard at `/username` with tombstones.

**Tombstone elements:**
- Project name
- Life dates (started — abandoned)
- Status: Dead / Zombie / Buried / Resurrectable
- Epitaph (up to 140 chars) — key viral element
- Cause of death (preset list + custom)
- Description (optional)
- Site/repo link (optional)
- Tech stack tags

### H2: Epitaph of the Day (CORE)
Daily best epitaphs curated by community. Card format optimized for sharing.

### H3: Death Certificate (CORE)
Visual "death certificate" card for each project — auto-generated OG-image optimized for Twitter/LinkedIn/Telegram.

### H4: Graveyard Stats / Wrapped (V2)
Personal analytics + annual "Your Year in Dead Projects" report.

### H5: Adopt a Project (V3)
Mechanism for others to "adopt" dead projects marked as Resurrectable.

### H6: Mourners / Reactions (CORE)
Thematic reactions instead of likes: Flowers, Candle, RIP, Resurrect, LOL.

### H7: GitHub Sync (V2)
Auto-import dead repos from GitHub.

### H8: Leaderboard & Badges (V2)
Rankings and achievement badges.

### H9: CV Integration (CORE)
Embeddable badge for GitHub README, positioning as portfolio supplement.

### H10: RIP Feed (V3)
Global activity feed.

---

## Pareto Front Analysis

| Hypothesis | Virality | Retention | Dev Effort | Pareto? |
|---|---|---|---|---|
| H1: Graveyard Profile | 5 | 4 | 3 (medium) | **YES — CORE** |
| H2: Epitaph of the Day | 5 | 5 | 2 (low) | **YES — CORE** |
| H3: Death Certificate | 5 | 3 | 2 (low) | **YES — CORE** |
| H4: Wrapped | 5 | 4 | 3 (medium) | **YES — V2** |
| H5: Adopt | 3 | 3 | 4 (high) | No (dominated) |
| H6: Mourners | 4 | 5 | 2 (low) | **YES — CORE** |
| H7: GitHub Sync | 3 | 4 | 4 (high) | **YES — V2** |
| H8: Leaderboard | 4 | 4 | 3 (medium) | **YES — V2** |
| H9: CV Integration | 5 | 5 | 2 (low) | **YES — CORE** |
| H10: RIP Feed | 3 | 4 | 3 (medium) | No (dominated) |

---

## Roadmap

### PHASE 1 — MVP (Viral Core)
1. Registration (GitHub OAuth / email)
2. Personal graveyard (`/username`)
3. Death Certificate OG-image cards
4. Epitaphs
5. Causes of death
6. Share buttons
7. CV Badge for GitHub README

### PHASE 2 — Community & Engagement
8. Mourners (reactions)
9. Leaderboard & badges
10. Epitaph of the Day/Week
11. GitHub Sync
12. Yearly Wrapped

### PHASE 3 — Industry Standard
13. Lessons Learned per project
14. Public API
15. Adopt/Resurrect
16. Company Graveyards
17. MDP Score

---

## Viral Formula

```
Virality = Humor (epitaphs) x Vulnerability (sharing failure) x Visuals (Death Certificates) x Identity ("I'm a dev who tries")
```

## Viral Loop (Phase 1)

```
User creates graveyard -> Gets Death Certificate ->
Posts to Twitter/LinkedIn -> Friends see -> "LOL I want one too" ->
Register -> Create theirs -> Post -> ...
```

---

## Monetization (future)

| Tier | Price | Includes |
|---|---|---|
| **Free** | $0 | Up to 10 projects, basic profile, Death Certificates |
| **Pro** | $5/mo | Unlimited projects, custom tombstone design, Wrapped, analytics |
| **Team** | $15/mo | Corporate graveyard, team stats, private graveyards |

---

## Key Metrics (Phase 1)

| Metric | Target | Why |
|---|---|---|
| Graveyards created | 1000 in first month | Adoption |
| Share rate | >30% share at least 1 card | Virality |
| K-factor | >1.0 | Organic growth |
| Epitaph creation rate | >80% projects have epitaphs | Content quality |
| Return rate (D7) | >15% | Retention |

---

## Positioning

> GitHub shows what you built. LinkedIn shows your career. **MDP shows the journey** — with all the dead ends, pivots, and burials.

> Every dead project is proof that you tried. MDP turns a graveyard of ideas into a portfolio of experience.
