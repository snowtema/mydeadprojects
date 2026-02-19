# Feature Gap Analysis — mydeadprojects

Generated: 2026-02-19

## 1. Broken / Not Working as Expected

| # | Problem | Where | Details |
|---|---------|-------|---------|
| 1 | **Settings — empty page** | `/settings` | Only Sign Out button. Bio, displayName, avatar cannot be changed after signup. Schema supports it — UI doesn't. |
| 2 | **Edit inaccessible on mobile** | `tombstone-card.tsx` | Edit button only appears on hover (`group-hover:opacity-100`). On touch devices, button is invisible. No alternative edit path. |
| 3 | **Email signup no feedback** | `/login` | After `signUp()` user stays on same form. No "Check your email" message. No "Forgot password?". |
| 4 | **Condolences not revalidated** | `condolences.ts` | `revalidatePath("/")` revalidates homepage but not the project page. New condolences only visible optimistically. |

## 2. Promised but Not Implemented ("Coming Soon")

| Feature | Description | State |
|---------|-------------|-------|
| **Resurrect or Adopt** | Others can "adopt" a dead project and revive it | Zero code. `status` field in schema is the only hook. |
| **GitHub Integration** | Connect GitHub, find abandoned repos, suggest for burial | `githubUsername` saved from OAuth but never used. No sync. |

## 3. Missing from Core Loop

| Feature | Impact | Details |
|---------|--------|---------|
| **Search** | High | No search by project name, tech stack, cause of death — neither in explore nor globally. Only discovery is sort + pagination. |
| **Explore filters** | High | Cannot filter by cause of death or tech stack despite both being stored fields. |
| **Notifications** | High | Project owner doesn't know when someone leaves a flower or condolence. Engagement loop completely broken. |
| **Condolence moderation** | Medium | Project owner cannot delete offensive messages. No report mechanism. |
| **Delete account** | Medium | Not available anywhere in UI. Cannot delete your own account. |
| **Data export** | Low | No way to download your data. |

## 4. Unused Schema Capabilities

| Field/Table | Status |
|-------------|--------|
| `users.bio` | Only filled from OAuth (often empty). No edit UI. |
| `users.displayName` | Same — write-once from GitHub metadata. |
| `users.githubUsername` | Stored but never displayed (no GitHub link in profile). |
| `projects.status` | Always `"dead"`. No UI to change. Potentially for "Resurrected"/"Adopted". |
| `projects.ogImageUrl` | Always `null`. OG generated dynamically. Dead field. |
| `causesOfDeath` table | Exists in DB but causes are hardcoded in `BuryForm`. Table never read. |
| `GraveyardCanvas` component | Fully functional canvas view with drag-and-drop, but removed from UI toggle. |

## 5. Growth & Engagement

| Feature | Category |
|---------|----------|
| **Explore by tech stack** | Discovery — show projects by technology |
| **Activity feed** | Engagement — "Recently buried", "Recently mourned" |
| **Follow users** | Social — subscriptions, update feed |
| **Remove reaction** | UX — currently can only switch type, not remove entirely |
| **Share on funeral via all platforms** | UX — FuneralAnimation only offers Twitter, but ShareMenu supports 4 channels |
| **Native Share API** | Mobile — `navigator.share()` for mobile users |
| **GitHub link in profile** | Profile — `githubUsername` stored but not displayed |

## Prioritization

**Quick wins:**
1. Settings — bio/displayName edit form
2. GitHub link in user profile
3. Fix mobile edit — add Edit link on project page for owner
4. Fix condolence revalidation

**Medium priority:**
5. Search in Explore
6. Filters by cause of death / tech stack
7. Condolence moderation (owner deletion)
8. Delete account in Settings

**Strategic (new mechanics):**
9. Notifications (email or in-app)
10. GitHub Integration (import abandoned repos)
11. Resurrect or Adopt
