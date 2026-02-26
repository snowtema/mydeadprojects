# Research: Game-like Cemetery View (free grave placement)

**Date:** 2026-02-18
**Status:** Approved, moving to implementation
**Type:** Feature Research & Analysis (FPF)

---

## Context

The current cemetery is a static CSS grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`), identical for all users. The proposal is to replace it with a 2D field with free grave placement -- a game-like mechanic that gives the project charm and opens the door to monetization.

---

## Competitive Analysis

### Direct Analogues (product cemeteries)

| Project | Approach | Free placement? |
|---------|----------|-----------------|
| Killed by Google | Card grid (React/Gatsby) | No |
| Microsoft Graveyard | Card grid | No |
| Google Cemetery | Card grid | No |

**Conclusion:** none of the analogues use free 2D placement. An unoccupied niche.

### Inspiration from Other Domains

| Source | What we take |
|--------|-------------|
| **Graveyard Keeper** (game) | Decorations around graves (fences, candles, flowers) -> monetization. Grave quality affects rating |
| **r/place** (Reddit) | Collaborative 2D canvas with millions of users. Architecture: WebSocket + Redis + chunks |
| **Remember Metaverse** | NFT graves at 0.1 ETH. Virtual plots (LAND) as a tradable asset |
| **PlotBox / Chronicle** | Professional cemetery software: top-down view, click on a plot, zoom/pan |
| **WoW / FFXIV memorials** | Cemeteries as social hubs -- people return, leave reactions |

---

## Technical Assessment

### Implementation Approaches

| Approach | Technology | Complexity | Perf. limit | Mobile support |
|----------|-----------|------------|-------------|----------------|
| **A. DOM + CSS absolute** | `react-zoom-pan-pinch` + `position: absolute` | Low | ~200-300 elements | Out of the box |
| **B. Canvas 2D** | `react-konva` or `Konva` | Medium | ~2000-5000 elements | Built-in |
| **C. WebGL** | `PixiJS` | High | 10000+ sprites at 60fps | Requires work |
| **D. Infinite Canvas SDK** | `tldraw` | Medium | Depends on renderer | Built-in |

### Approach A (DOM + CSS) selected for MVP

**Why:**
- Works with the existing `TombstoneCard` without changes
- 1 new dependency (`react-zoom-pan-pinch`, 700K+ weekly downloads)
- Minimal DB schema changes (add `x`, `y` nullable fields)
- Sufficient for ~200-300 graves per cemetery
- Pan/zoom/pinch on mobile -- out of the box

**When to migrate to B/C:** only if the Explore page needs to display thousands of graves simultaneously.

### Collision detection

AABB (Axis-Aligned Bounding Box): `a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y`

### LOD (levels of detail on zoom)

- Far: dots with names
- Medium: tombstone shape + name + dates
- Close: full card with epitaph and reactions

---

## Monetization (groundwork)

### Short-term

| Model | Description | Effort |
|-------|-------------|--------|
| Tombstone styles | Gothic, marble, pixel art, neon, cyber | Medium |
| Decorations | Flowers, candles, fences, angels around the grave | Medium |
| Premium plots | Center of cemetery, under a tree, by a lake | Low |

### Mid-term

| Model | Description | Effort |
|-------|-------------|--------|
| Cemetery theme | Full visual overhaul: eerie, peaceful, pixel, cosmic | High |
| Animated tombstones | Ghosts, flickering candles, weather effects | Medium |
| Badges/achievements | "Serial Killer" (10+ projects), "Necromancer" (resurrected a project) | Low |

### Long-term

| Model | Description | Effort |
|-------|-------------|--------|
| Sponsored graves | Companies bury their killed products (paid listing) | Low |
| Cemetery landscape | Trees, paths, ponds -- purchasable environment elements | High |

---

## Risks

| Risk | Probability | Mitigation |
|------|-------------|------------|
| Mobile perf with >100 graves | Medium | LOD + viewport culling |
| UX complexity of placement on touch | Medium | Snap-to-grid (soft 20px grid) + ghost preview |
| Backward compatibility | Low | Nullable fields + Grid as fallback |
| Empty cemetery looks boring | High | Default decorative elements |
| Coordinates break on resize | Medium | Normalized coordinates (0-1) instead of pixels |

---

## Architecture Plan

### DB Schema Changes

```
projects: add
  - positionX: real (nullable)
  - positionY: real (nullable)
  - tombstoneStyle: varchar(50) (nullable, default "classic")
```

### New Components

```
graveyard-canvas.tsx      -- 2D field with pan/zoom
tombstone-placer.tsx      -- placement mode (ghost + collision)
graveyard-view-toggle.tsx -- Grid <-> Canvas toggle
```

### Phases

**Phase 1 -- MVP Canvas:** DB migration, react-zoom-pan-pinch, render via position:absolute, click-to-place, drag, toggle Grid/Canvas
**Phase 2 -- Polish:** LOD, mobile UX, collision detection, visual ground
**Phase 3 -- Monetization:** tombstoneStyle + variants, decorations, purchase system

---

## Sources

- [Killed by Google](https://killedbygoogle.com/) / [GitHub](https://github.com/codyogden/killedbygoogle)
- [tldraw SDK](https://tldraw.dev/)
- [react-zoom-pan-pinch](https://github.com/BetterTyped/react-zoom-pan-pinch)
- [Konva.js](https://konvajs.org/)
- [PixiJS](https://pixijs.com/)
- [Graveyard Keeper Wiki](https://graveyardkeeper.fandom.com/wiki/Graveyard_Keeper_Wiki)
- [r/place Engineering](https://saikumarchintada.medium.com/engineering-behind-r-place-a7eb53bcf5f1)
- [MDN 2D Collision Detection](https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection)
- [PlotBox](https://plotbox.com/) / [Chronicle](https://chronicle.rip/)
- [Remember Metaverse NFT](https://nftevening.com/remember-metaverse-launches-worlds-first-virtual-cemetery-with-memorial-stone-nfts/)
