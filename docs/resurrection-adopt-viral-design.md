# Resurrection/Adopt — Viral Feature Design (FPF Analysis)

## FPF Decomposition

| FPF Element | Mapping |
|---|---|
| **Holon** | Resurrection/Adopt as a subsystem of the MDP platform |
| **BoundedContext** | Viral mechanics of social products for the dev community |
| **MethodDescription** | Feature design (plan-time), NOT implementation |
| **Anomaly (B.5.2)** | The current viral loop is unidirectional (only "death"). No reverse cycle. |

---

## Anomaly Statement

**Current MDP viral loop:**
```
Create → Bury → Death Certificate → Share → "I want to do that too!" → Register → Bury → Share
```

**Problem:** One cycle, one emotion (humor + vulnerability). The user comes in once, buries projects, shares, and — that's it. No reason to come back. No second spiral.

**Anomaly:** How to create a SECOND viral loop (resurrection) that amplifies the first and transforms the platform from a "one-shot viral moment" into a "recurring viral engine"?

---

## Hypothesis Generation (B.5.2.1 NQD-Generate)

### CharacteristicSpace (Q-metrics):
- **Q1**: Viral coefficient (shareability)
- **Q2**: Implementation simplicity
- **Q3**: Engagement depth (retention)
- **Q4**: Network effect (does it create connections between people?)

### Candidates:

| ID | Hypothesis | Q1 | Q2 | Q3 | Q4 | N | D |
|---|---|---|---|---|---|---|---|
| **h1** | **Adopt with Public Pledge** — "Adoption" with Resurrection Certificate | HIGH | MED | HIGH | HIGH | MED | HIGH |
| **h2** | **Frankenstein Mode** — assemble a project from "organs" of dead ones | MED | LOW | MED | LOW | HIGH | LOW |
| **h3** | **Resurrection Bounty** — reward for resurrection | MED | MED | HIGH | MED | MED | MED |
| **h4** | **Necromancer Leaderboard** — badges and leaderboard | HIGH | HIGH | MED | LOW | MED | LOW |
| **h5** | **Ghost Mode** — anonymous "wishes" | LOW | HIGH | LOW | MED | MED | MED |
| **h6** | **Twin Flame** — matching "dead project <-> developer" | HIGH | LOW | MED | MED | HIGH | MED |
| **h7** | **Zombie Challenge** — events "resurrect in 48 hours" | HIGH | MED | HIGH | HIGH | HIGH | HIGH |

### Pareto front: **h1, h4, h7** dominate.

### Plausibility Filters:
- **h2** (Frankenstein): too complex, does not generate a shareable moment -> drop
- **h5** (Ghost): too passive, no share trigger -> drop
- **h6** (Twin Flame): requires a matching algorithm without a sufficient user base -> drop for MVP

### **Selected: Composite h1 + h4 + h7**

---

## The Resurrection System — Feature Design

### Actors & Roles

| Role | Who | Action |
|---|---|---|
| **Gravedigger** | Owner of a dead project | Opens the project for resurrection |
| **Necromancer** | The one who wants to resurrect | Adopts and resurrects |
| **Witnesses** | Community | Vote, react, share |

### Status Flow

```
dead  →  open_for_resurrection  →  adopted  →  resurrected
  ↑                                    ↓
  └──────────── dead_again ←──────────┘
```

---

## 6 Viral Share Triggers

Each trigger generates a unique shareable artifact (vs the current 2):

### Trigger 1: "Seeking Necromancer"
The owner marks a project as `resurrectable` -> an OG card is generated:
> *"My project [Name] is looking for a second chance. Will you be its Necromancer?"*

### Trigger 2: "Resurrection Pledge"
The Necromancer clicks Adopt -> writes a pledge (140 characters) -> **Resurrection Certificate**:
> Two sides: dark (epitaph) | light (pledge)

### Trigger 3: "Adoption Confirmed"
The owner approves -> shareable moment:
> *"@gravedigger passed the torch to @necromancer. The resurrection begins."*

### Trigger 4: "It Lives!"
The Necromancer links a new repo/URL -> status = `resurrected` -> **Resurrection Announcement**:
> Before/After: Death Certificate -> alive. Confetti animation.

### Trigger 5: Badge Earned
The Necromancer earns a badge -> shareable achievement card.

### Trigger 6: "Press R to Resurrect"
Lightweight wish mechanic. N wishes -> "Most Wanted" -> Ghost Ping to the owner.

---

## Triple Viral Loop

### LOOP A (existing) — Death Loop:
```
Bury → Death Certificate → Share → "I want to do that too!" → Register → Bury → Share
```

### LOOP B (new) — Resurrection Loop:
```
Browse graves → Find project → Adopt → Resurrection Certificate → Share
  ↕ original owner shares too: "Someone resurrected my project!"
  → followers: "I want mine resurrected!" OR "I want to resurrect one!"
  → Register → either bury OR adopt
```

### LOOP C (amplifier) — Challenge Loop:
```
Weekly featured dead project → "Resurrect this in one week!"
→ Participants share progress → Winner announced → Share results
→ "I want to participate!" → Register
```

**Key Insight:** Loop B creates two-sided motivation — both the Gravedigger and the Necromancer want to share. One adoption = two share events from different people to different audiences.

---

## Necromancer Identity System

### Badges

| Badge | Condition | GitHub Badge |
|---|---|---|
| **Apprentice** | 1 adoption (in progress) | `🪦→🧟 Apprentice Necromancer` |
| **Necromancer** | 1 successful resurrection | `🧟 Necromancer: 1 revived` |
| **Dark Mage** | 3 resurrections | `🧙 Dark Mage: 3 revived` |
| **Lich King** | 10 resurrections | `👑 Lich King: 10 revived` |
| **Phoenix** | Resurrected your OWN project | `🔥 Phoenix: Self-resurrected` |

### Profile
- New "Resurrections" tab next to "Graveyard"
- Leaderboard: "Top Necromancers" on Explore

---

## Psychological Triggers

| Trigger | Mechanic | Why it works |
|---|---|---|
| **Hero Narrative** | "I saved a dead project" | Identity: I am a Necromancer |
| **Gratitude** | The owner thanks the adopter | Emotional bond -> both share |
| **Competition** | Necromancer leaderboard | Status seeking -> motivation |
| **FOMO** | "This project is already adopted!" | Scarcity -> must act faster |
| **Reciprocity** | "My project was adopted -> I'll do the same" | Chain reaction |
| **Surprise** | "Someone wants MY dead project?!" | Unexpected validation |
| **Social Proof** | "347 projects already resurrected" | Normalization + trust |

---

## Virality Formula

**Current:**
```
Virality = Humor × Vulnerability × Visual (Death Certificate) × 1 loop
```

**With Resurrection:**
```
Virality = (Humor × Vulnerability × Visual) × (Hero Narrative × Gratitude × Competition)
         × 3 loops × 6 share triggers × 2-sided sharing
```

Estimated amplification: **x3-5 viral surface**.

---

## Implementation Phases

### Phase 1 — MVP (minimum viral loop):
- [ ] Toggle "Open for Resurrection" in project settings
- [ ] "Adopt" button with pledge text
- [ ] Resurrection Certificate (OG card)
- [ ] Notification to the owner
- [ ] Activate `status` field in the DB
- [ ] "Seeking Resurrection" filter on Explore
- [ ] "Press R" for resurrection wish

### Phase 2 — Engagement (depth):
- [ ] Necromancer badges and profile section
- [ ] Resurrection Proof (link to repo/URL)
- [ ] "Recently Resurrected" feed
- [ ] Ghost Ping notifications
- [ ] Owner approval flow

### Phase 3 — Viral Amplifiers:
- [ ] Necromancer Leaderboard
- [ ] Weekly Resurrection Challenge
- [ ] Telegram: daily resurrection updates
- [ ] GitHub badge: Necromancer variant
- [ ] "Most Wanted" — projects with the most wishes

---

## Success Metrics

| Metric | Target | How to measure |
|---|---|---|
| **Resurrection Rate** | >5% of projects marked as resurrectable | DB query |
| **Adoption Rate** | >2% of views on resurrectable projects | clicks / views |
| **Dual-Share Rate** | >40% of adoptions where BOTH participants share | share events |
| **Necromancer Retention** | D7 >30% for adopters | user activity tracking |
| **K-factor boost** | +0.3 to the current K-factor | viral attribution |
