# Resurrection/Adopt — UX Flow & Interaction Design

> Phase 1 MVP. Aligned with the existing design system and MDP UX patterns.

---

## Design System Extensions

### New Colors (palette extension)

```
--resurrection:       #5a9a5a     (reuse --green, "alive" signal)
--resurrection-dim:   #3d6b3d     (muted green for secondary elements)
--resurrection-glow:  rgba(90, 154, 90, 0.15)   (glow effect for resurrectable cards)
--seeking:            #C4A07C     (reuse --cta, warm "open/seeking" tone)
--seeking-glow:       rgba(196, 160, 124, 0.12)  (glow for seeking state)
```

### New Statuses (visual indicators)

| Status | Badge Color | Icon | Label |
|---|---|---|---|
| `dead` | `--red` / `#8a3a3a` | ✝ | Dead |
| `resurrectable` | `--seeking` / `#C4A07C` | ☽ | Seeking Necromancer |
| `adopted` | `--accent` / `#9B7E7E` | ⚗ | Adopted |
| `resurrected` | `--resurrection` / `#5a9a5a` | ✦ | Resurrected |

---

## Flow Map (all flows)

```
                    GRAVEDIGGER FLOWS                    NECROMANCER FLOWS
                    ════════════════                     ═════════════════

              ┌─────────────────────┐
              │  Project Detail     │
              │  (owner view)       │
              └────────┬────────────┘
                       │
                       ▼
          ┌────────────────────────┐         ┌──────────────────────────┐
          │ F1: Mark as            │         │  Explore Page            │
          │     Resurrectable      │         │  (filter: Seeking)       │
          └────────┬───────────────┘         └────────┬─────────────────┘
                   │                                  │
                   ▼                                  ▼
          ┌────────────────────────┐         ┌──────────────────────────┐
          │ Share: "Seeking        │         │  Project Detail          │
          │  Necromancer" card     │         │  (visitor view)          │
          └────────────────────────┘         └────────┬─────────────────┘
                                                      │
                                              ┌───────┴────────┐
                                              ▼                ▼
                                    ┌─────────────┐  ┌─────────────────┐
                                    │ F2: Press R  │  │ F3: Adopt       │
                                    │ (wish)       │  │ (pledge)        │
                                    └─────────────┘  └────────┬────────┘
                                                              │
                                                              ▼
                                                    ┌─────────────────┐
          ┌────────────────────────┐                │ Share:           │
          │ F4: Approve/Reject    │◄───────────────│ "Resurrection    │
          │     Adoption          │  notification   │  Pledge" card    │
          └────────┬──────────────┘                └─────────────────┘
                   │
                   ▼
          ┌────────────────────────┐         ┌──────────────────────────┐
          │ Share: "Adoption       │         │ F5: Submit Proof         │
          │  Confirmed" card       │         │ (repo URL / live link)   │
          └────────────────────────┘         └────────┬─────────────────┘
                                                      │
                                                      ▼
                                             ┌────────────────────────┐
                                             │ "It Lives!" celebration│
                                             │ + Resurrection Card    │
                                             └────────────────────────┘
```

---

## Flow 1: Mark as Resurrectable (Gravedigger)

### Entry Point
Project page (`/[username]/[slug]`) — the owner sees the button in edit controls.

### Screen: Project Detail (Owner View) — new element

```
┌─────────────────────────────────────────────────────┐
│  ← Back to graveyard                    [Edit] [⋯]  │
│                                                      │
│                      ✝                               │
│                 TodoApp v3                            │
│              2023 — 2024                             │
│                                                      │
│         "I mass promised it would be done            │
│          by Monday. Every Monday."                   │
│                                                      │
│              Lost motivation                         │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │   🌸 42    │    Copy  𝕏  Reddit  LinkedIn   │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐    │
│  │  ☽ Open for Resurrection                    │    │
│  │                                              │    │
│  │  Let someone adopt and revive this project.  │    │
│  │  ┌──────────────────────────────────────┐   │    │
│  │  │  ☽ Seek a Necromancer               │   │    │
│  │  └──────────────────────────────────────┘   │    │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘    │
│                                                      │
│  Died from: Lost motivation · Dead for 8 months      │
└─────────────────────────────────────────────────────┘
```

### Interaction

1. The owner clicks **"Seek a Necromancer"**
2. A confirmation dialog appears (inline, not modal):

```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
│  ☽ Open for Resurrection                           │
│                                                     │
│  This will:                                         │
│  · Mark your project as available for adoption      │
│  · Show it in the "Seeking Necromancer" feed        │
│  · Allow other devs to submit adoption pledges      │
│                                                     │
│  You'll approve or reject any adoption requests.    │
│                                                     │
│  ┌────────────────┐  ┌─────────────────────────┐   │
│  │    Cancel       │  │  ☽ Open for Adoption   │   │
│  └────────────────┘  └─────────────────────────┘   │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

3. After confirmation:
   - `status` changes from `dead` to `resurrectable`
   - The project card gets a seeking-glow effect
   - A share prompt appears with the "Seeking Necromancer" OG card
   - The button changes to "Close for Resurrection" (toggle)

### Post-Action: Share Prompt

```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
│  ✓ Project is now seeking a Necromancer             │
│                                                     │
│  Share to find your hero:                           │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │    Copy  𝕏  Reddit  LinkedIn  Telegram      │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  "My project TodoApp v3 is looking for a second     │
│   chance. Will you be its Necromancer?              │
│   mydeadprojects.com/@artem/todoapp-v3"             │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

---

## Flow 2: Press R — Resurrection Wish (Visitor, lightweight)

### Location
On the project page with `resurrectable` status, next to the flower button.

### Screen: Project Detail (Visitor View, Resurrectable)

```
┌─────────────────────────────────────────────────────┐
│  ← Back                                             │
│                                                      │
│            ☽ Seeking Necromancer                     │
│  ┌──────────────────────────────────────────┐       │
│  │           ✝                               │       │
│  │      TodoApp v3                           │       │
│  │    2023 — 2024                            │       │
│  │                                           │       │
│  │  "I promised it would be done             │       │
│  │   by Monday. Every Monday."               │       │
│  │                                           │       │
│  │       Lost motivation                     │       │
│  │                                           │       │
│  │   ·····seeking-glow border·····           │       │
│  └──────────────────────────────────────────┘       │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  🌸 42  │  ☽ 7 wishes  │  R   │  Share ▾   │   │
│  │   F     │              │      │             │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │         ⚗ Adopt This Project                 │   │
│  │                                               │   │
│  │  Think you can bring it back to life?         │   │
│  │  Write your resurrection pledge.              │   │
│  │  ┌──────────────────────────────────────┐    │   │
│  │  │       ⚗ I'll Resurrect This          │    │   │
│  │  └──────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  Died from: Lost motivation · Dead for 8 months      │
└─────────────────────────────────────────────────────┘
```

### Press R Interaction

1. The visitor presses **R** on the keyboard (or clicks the ☽ wish button)
2. Animation: floating "R" particles (parallel to "F" particles)
   - 5 particles, staggered 80ms
   - Color: `--seeking` (#C4A07C)
   - Same `ritual-float` animation 1.2s
3. Wish counter increments: `☽ 7 wishes` to `☽ 8 wishes`
4. The button changes to `☽ Wished` (disabled state, same as flower after click)
5. Deduplication: 1 wish per visitor per project (cookie/hash, same as flowers)

### Ghost Ping (async, backend)
When a project reaches **5 / 10 / 25 / 50 wishes**:
- The owner receives a notification (email or in-app, Phase 2)
- "12 developers wish TodoApp v3 was resurrected!"

---

## Flow 3: Adopt — Resurrection Pledge (Necromancer)

### Entry Point
The **"I'll Resurrect This"** button on the resurrectable project page.

### Prerequisite
- The visitor must be logged in (if not, redirect to login with return URL)
- The visitor is NOT the project owner
- The project has `resurrectable` status (no active adoption)

### Step 1: Pledge Form (inline expand, not a separate page)

Clicking "I'll Resurrect This" expands the form BELOW the button:

```
┌──────────────────────────────────────────────────┐
│  ⚗ Your Resurrection Pledge                      │
│                                                   │
│  What will you do with this project?              │
│  ┌───────────────────────────────────────────┐   │
│  │ I'll rebuild it in Rust with a proper     │   │
│  │ CLI interface and ship it on crates.io    │   │
│  │                                    98/140 │   │
│  └───────────────────────────────────────────┘   │
│                                                   │
│  Your repo or project URL (optional):             │
│  ┌───────────────────────────────────────────┐   │
│  │ https://github.com/necro/todoapp-rs       │   │
│  └───────────────────────────────────────────┘   │
│                                                   │
│  ┌────────────┐  ┌───────────────────────────┐   │
│  │   Cancel    │  │  ⚗ Submit Pledge          │   │
│  └────────────┘  └───────────────────────────┘   │
│                                                   │
│  The project owner will review your pledge.       │
└──────────────────────────────────────────────────┘
```

### Pledge Form Spec

| Field | Type | Limit | Required |
|---|---|---|---|
| Pledge text | textarea | 140 characters (same as epitaph) | Yes |
| Repo / URL | url input | — | No |

### Step 2: Confirmation + Share

After submit:

```
┌──────────────────────────────────────────────────┐
│                                                   │
│  ⚗ Pledge Submitted                              │
│                                                   │
│  @artem will review your resurrection pledge.     │
│  You'll be notified when they respond.            │
│                                                   │
│  ┌────────────────────────────────────────────┐  │
│  │                                             │  │
│  │   ┌─────────┐    ┌──────────┐              │  │
│  │   │  DEATH  │    │   LIFE   │              │  │
│  │   │         │    │          │              │  │
│  │   │ TodoApp │    │ TodoApp  │              │  │
│  │   │  v3     │    │   RS     │              │  │
│  │   │         │    │          │              │  │
│  │   │"Monday" │    │"Rust +   │              │  │
│  │   │         │    │ CLI"     │              │  │
│  │   │ ✝ Dead  │    │ ⚗ Pledge │              │  │
│  │   └─────────┘    └──────────┘              │  │
│  │                                             │  │
│  │   Resurrection Pledge by @necromancer       │  │
│  │   mydeadprojects.com/@artem/todoapp-v3      │  │
│  └────────────────────────────────────────────┘  │
│                                                   │
│  Share your pledge:                               │
│  ┌─────────────────────────────────────────────┐ │
│  │   Copy  𝕏  Reddit  LinkedIn  Telegram       │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  Pre-filled tweet:                                │
│  "I just pledged to resurrect TodoApp v3 ⚗       │
│   Dead since 2024. I'll rebuild it in Rust.       │
│   Press F to pay respects or adopt your own:      │
│   mydeadprojects.com/@artem/todoapp-v3"           │
│                                                   │
└──────────────────────────────────────────────────┘
```

### Resurrection Certificate (OG Image)

Dual-sided card for social sharing:

```
┌──────────────────────────────────────────────┐
│                                               │
│   ┌──────────────┐  ┌──────────────┐         │
│   │  ☠ DEATH     │  │  ✦ LIFE      │         │
│   │              │  │              │         │
│   │  TodoApp v3  │  │  TodoApp RS  │         │
│   │  2023-2024   │  │  2025-       │         │
│   │              │  │              │         │
│   │  "Monday     │  │  "Rust +     │         │
│   │   promise"   │  │   proper     │         │
│   │              │  │   CLI"       │         │
│   │  Lost        │  │              │         │
│   │  motivation  │  │  @necro      │         │
│   │              │  │              │         │
│   │  ✝           │  │  ⚗           │         │
│   └──────────────┘  └──────────────┘         │
│                                               │
│   Resurrection Pledge · mydeadprojects.com    │
│                                               │
└──────────────────────────────────────────────┘
```

Left side: dark (#0a0a0a), border `--red`
Right side: slightly lighter (#111111), border `--resurrection`

---

## Flow 4: Approve/Reject Adoption (Gravedigger)

### Notification (Phase 1: in-app banner)

The owner sees a banner on their project page:

```
┌──────────────────────────────────────────────────┐
│  ⚗ Adoption Request                              │
│                                                   │
│  @necromancer wants to resurrect TodoApp v3:      │
│  "I'll rebuild it in Rust with a proper CLI       │
│   interface and ship it on crates.io"             │
│                                                   │
│  github.com/necro/todoapp-rs                      │
│                                                   │
│  ┌────────────┐  ┌───────────────────────────┐   │
│  │  ✗ Decline  │  │  ⚗ Approve Adoption      │   │
│  └────────────┘  └───────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

### Approve Action

1. The owner clicks **"Approve Adoption"**
2. `status` changes: `resurrectable` to `adopted`
3. `adoptedBy` = necromancer's user ID
4. Celebration: confetti animation (similar to funeral-animation)
5. Share prompt for the owner:

```
  Pre-filled tweet:
  "Someone adopted my dead project! 🧟
   @necromancer pledged to resurrect TodoApp v3.
   The dead shall rise: mydeadprojects.com/@artem/todoapp-v3"
```

### Decline Action

1. The owner clicks **"Decline"**
2. The pledge is deleted
3. The project remains `resurrectable`
4. The necromancer receives a notification (Phase 2): "Your pledge was not accepted"

### Multiple Pledges (Policy)

**Phase 1 (MVP):** One pledge at a time. If there is a pending pledge, the "Adopt" button is disabled with the text: "Someone already submitted a pledge. Waiting for owner's decision."

**Phase 2:** Queue of pledges. The owner sees a list and picks the best one.

---

## Flow 5: Resurrection Proof (Necromancer)

### When
After adoption is approved, the project has `adopted` status. The necromancer sees a prompt to confirm resurrection.

### Screen: Project Detail (Adopted, Necromancer View)

```
┌──────────────────────────────────────────────────┐
│  ← Back                                          │
│                                                   │
│            ⚗ Adopted by @necromancer              │
│  ┌──────────────────────────────────────────┐    │
│  │           ✝                               │    │
│  │      TodoApp v3                           │    │
│  │    2023 — 2024                            │    │
│  │                                           │    │
│  │  "I promised it would be done             │    │
│  │   by Monday. Every Monday."               │    │
│  │                                           │    │
│  │       Lost motivation                     │    │
│  │                                           │    │
│  │  ⚗ "I'll rebuild it in Rust with a       │    │
│  │     proper CLI" — @necromancer            │    │
│  └──────────────────────────────────────────┘    │
│                                                   │
│  ┌──────────────────────────────────────────────┐│
│  │  ✦ Submit Resurrection Proof                  ││
│  │                                               ││
│  │  Show the world your project lives!           ││
│  │                                               ││
│  │  Live URL or repo:                            ││
│  │  ┌───────────────────────────────────────┐   ││
│  │  │ https://github.com/necro/todoapp-rs   │   ││
│  │  └───────────────────────────────────────┘   ││
│  │                                               ││
│  │  ┌──────────────────────────────────────┐    ││
│  │  │     ✦ Confirm Resurrection           │    ││
│  │  └──────────────────────────────────────┘    ││
│  └──────────────────────────────────────────────┘│
│                                                   │
└──────────────────────────────────────────────────┘
```

### Submit Proof Action

1. The necromancer pastes the repo or live site URL
2. Clicks **"Confirm Resurrection"**
3. `status` changes: `adopted` to `resurrected`
4. **"IT LIVES!" celebration screen:**

```
┌──────────────────────────────────────────────────┐
│                                                   │
│                    ✦                              │
│                                                   │
│              I T   L I V E S !                    │
│                                                   │
│              TodoApp v3 → TodoApp RS              │
│                                                   │
│         Dead for 347 days. Resurrected by         │
│                  @necromancer                      │
│                                                   │
│  ┌────────────────────────────────────────────┐  │
│  │  ☠ DEATH           →        ✦ ALIVE        │  │
│  │  "Monday promise"      "Rust + proper CLI"  │  │
│  │  Lost motivation          @necromancer      │  │
│  │  🌸 42 flowers           ⚗ Resurrected     │  │
│  └────────────────────────────────────────────┘  │
│                                                   │
│  Share the miracle:                               │
│  ┌─────────────────────────────────────────────┐ │
│  │   Copy  𝕏  Reddit  LinkedIn  Telegram       │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  Pre-filled tweet:                                │
│  "IT LIVES! ✦ TodoApp v3 was dead for 347 days.  │
│   I resurrected it as TodoApp RS.                 │
│   From grave to glory: [link]"                    │
│                                                   │
└──────────────────────────────────────────────────┘
```

Animation: reverse-funeral (particles float UP, green glow, screen shake).

---

## Explore Page: Resurrection Filters

### New elements on Explore

```
┌──────────────────────────────────────────────────┐
│  Explore                                          │
│                                                   │
│  ┌──────┐ ┌────────┐ ┌──────────────────┐       │
│  │Graves│ │ People │ │☽ Seeking Revival │       │
│  └──────┘ └────────┘ └──────────────────┘       │
│                                                   │
│  Sort: Recent · Most Respected                    │
│                                                   │
│  Cause: All  Lost motivation  Scope creep  ...    │
│                                                   │
│  ┌──────────────────────────────────────────────┐│
│  │                                               ││
│  │ ☽  TodoApp v3          @artem                 ││
│  │    "Monday promise"    🌸 42  ☽ 8 wishes     ││
│  │    Lost motivation     Seeking Necromancer    ││
│  │                                               ││
│  ├───────────────────────────────────────────────┤│
│  │                                               ││
│  │ ☽  WeatherBot          @jane                  ││
│  │    "API key expired,   🌸 17  ☽ 3 wishes     ││
│  │     so did my will"    Seeking Necromancer    ││
│  │                                               ││
│  └──────────────────────────────────────────────┘│
└──────────────────────────────────────────────────┘
```

### "Seeking Revival" Tab
- Third tab next to "Graves" and "People"
- Shows ONLY projects with `resurrectable` status
- Sorting: Recent | Most Wished (by wish count)
- Each card shows wish count alongside flowers

### Tombstone Card Variants

**Resurrectable card** (in lists):
```
┌───────────────────────────────────┐
│  ☽                                │  ← seeking indicator instead of ✝
│  TodoApp v3                       │
│  2023 — 2024                      │
│  "Monday promise"                 │
│  Lost motivation                  │
│                                   │
│  🌸 42    ☽ 8 wishes              │  ← wish count added
│                                   │
│  ·····seeking-glow border·····    │  ← #C4A07C border glow
└───────────────────────────────────┘
```

**Adopted card**:
```
┌───────────────────────────────────┐
│  ⚗                                │  ← adopted indicator
│  TodoApp v3                       │
│  2023 — 2024                      │
│  "Monday promise"                 │
│  Lost motivation                  │
│                                   │
│  ⚗ Adopted by @necromancer        │
│  🌸 42                            │
│                                   │
│  ·····accent border·····          │  ← #9B7E7E border
└───────────────────────────────────┘
```

**Resurrected card**:
```
┌───────────────────────────────────┐
│  ✦                                │  ← resurrected indicator
│  TodoApp v3 → TodoApp RS          │
│  2023 — 2024 · Resurrected 2025   │
│  "Monday promise"                 │
│  Lost motivation → @necromancer   │
│                                   │
│  🌸 42   ✦ Resurrected            │
│                                   │
│  ·····resurrection-glow border··· │  ← #5a9a5a border glow
└───────────────────────────────────┘
```

---

## Component Architecture

### New Components

```
src/components/
├── resurrection/
│   ├── resurrection-toggle.tsx      # Owner: mark as resurrectable
│   ├── resurrection-wish.tsx        # Visitor: Press R wish button
│   ├── adoption-form.tsx            # Necromancer: pledge form
│   ├── adoption-request.tsx         # Owner: approve/reject banner
│   ├── resurrection-proof.tsx       # Necromancer: submit proof
│   ├── resurrection-celebration.tsx # "It Lives!" screen
│   ├── resurrection-certificate.tsx # Dual-card OG preview
│   └── status-badge.tsx             # Visual status indicator
```

### Modifications to Existing Components

| Component | What Changes |
|---|---|
| `tombstone-card.tsx` | Add status variants (glow, icon, wish count) |
| `flower-button.tsx` | Extend: add "R" wish button alongside |
| `share-menu.tsx` | New pre-filled texts for resurrection events |
| `explore-*.tsx` | New "Seeking Revival" tab, wish count in cards |

---

## Keyboard Shortcuts

| Key | Action | Context |
|---|---|---|
| `F` | Pay respects (flower) | Any project (existing) |
| `R` | Resurrection wish | Resurrectable projects only |

**Implementation:** `e.code === "KeyR"` (same approach as `KeyF` for non-English layouts).

**Conflict:** R does not conflict with F — different actions on different statuses. Both work on resurrectable projects (F = flowers, R = wish).

---

## Animations & Micro-interactions

### Press R Particles
```css
@keyframes wish-float {
  0%   { opacity: 1; transform: translateY(0) rotate(0deg); }
  100% { opacity: 0; transform: translateY(-60px) rotate(15deg); }
}
```
- 5 particles of the "☽" symbol
- Color: `--seeking` (#C4A07C)
- Duration: 1.2s ease-out
- Stagger: 80ms between particles
- Random X offset: -25px to +25px

### Seeking Glow (resurrectable project card)
```css
.tombstone-seeking {
  border-color: var(--seeking);
  box-shadow: 0 0 20px var(--seeking-glow), inset 0 0 20px var(--seeking-glow);
  animation: pulse-seek 3s ease-in-out infinite;
}

@keyframes pulse-seek {
  0%, 100% { box-shadow: 0 0 20px var(--seeking-glow); }
  50%      { box-shadow: 0 0 35px var(--seeking-glow); }
}
```

### Resurrection Celebration ("It Lives!")
- Reverse funeral-animation: particles float UP (not down)
- Color: `--resurrection` (#5a9a5a)
- Screen flash: brief white overlay 200ms
- Text reveal: letter-by-letter "I T  L I V E S !" with 50ms stagger
- Confetti: green + gold particles

### Adoption Confirmed
- Subtle pulse on the project card
- Status badge transition: `☽ Seeking` to `⚗ Adopted` with morph animation

---

## DB Schema Changes (Phase 1)

```sql
-- projects table: activate existing status field + add adoption fields
ALTER TABLE projects
  ADD COLUMN adopted_by UUID REFERENCES users(id),
  ADD COLUMN adopted_at TIMESTAMPTZ,
  ADD COLUMN adoption_pledge TEXT,
  ADD COLUMN adoption_pledge_url TEXT,
  ADD COLUMN resurrection_url TEXT,
  ADD COLUMN resurrected_at TIMESTAMPTZ;

-- resurrection_wishes table (parallel to flowers)
CREATE TABLE resurrection_wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  visitor_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, visitor_hash)
);

CREATE INDEX idx_wishes_project ON resurrection_wishes(project_id);

-- users table: add resurrection counters
ALTER TABLE users
  ADD COLUMN resurrections_count INTEGER NOT NULL DEFAULT 0;
```

### Drizzle Schema Addition

```typescript
// In schema.ts, projects extension:
adoptedBy: uuid("adopted_by").references(() => users.id),
adoptedAt: timestamp("adopted_at", { withTimezone: true }),
adoptionPledge: text("adoption_pledge"),
adoptionPledgeUrl: text("adoption_pledge_url"),
resurrectionUrl: text("resurrection_url"),
resurrectedAt: timestamp("resurrected_at", { withTimezone: true }),

// New table:
export const resurrectionWishes = pgTable("resurrection_wishes", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  visitorHash: varchar("visitor_hash", { length: 64 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  uniqueWish: unique().on(table.projectId, table.visitorHash),
  projectIdx: index("idx_wishes_project").on(table.projectId),
}));
```

---

## Server Actions (Phase 1)

```
src/actions/
├── resurrection.ts
│   ├── toggleResurrectable(projectId)     # Owner: dead ↔ resurrectable
│   ├── submitAdoptionPledge(projectId, pledge, url?)  # Necromancer
│   ├── approveAdoption(projectId)         # Owner
│   ├── declineAdoption(projectId)         # Owner
│   ├── submitResurrectionProof(projectId, url)  # Necromancer
│   └── addResurrectionWish(projectId)     # Visitor (anonymous)
```

---

## OG Images (Cloudflare Worker extension)

### "Seeking Necromancer" Card
- Dark background
- Large ☽ symbol
- Project name + epitaph
- "Seeking Necromancer" badge
- CTA: "Will you be its hero?"

### "Resurrection Pledge" Card (Dual)
- Split layout: left dark (death), right lighter (life)
- Left: name, dates, epitaph, cause of death
- Right: pledge text, necromancer username
- Footer: "Resurrection Pledge · mydeadprojects.com"

### "It Lives!" Card
- Green accent
- Before / After layout
- "Dead for N days. Resurrected."
- Celebratory tone

---

## Edge Cases & Guards

| Case | Handling |
|---|---|
| Owner tries to adopt own project | Button is not shown. (Phase 2: Phoenix badge if you resurrect your own) |
| Unauth user clicks Adopt | Redirect to `/login?redirect=/[username]/[slug]` |
| Project already has pending pledge | "Adopt" disabled: "Pledge pending review" |
| Project adopted, necromancer goes silent | Phase 2: 30-day timeout, auto-revert to `resurrectable` |
| Owner deletes project while adopted | Cascade delete, necromancer notified (Phase 2) |
| Multiple wishes from same visitor | Deduplicate via visitor_hash (same as flowers) |
| Necromancer submits proof without real URL | Phase 1: trust system. Phase 2: community verification |
