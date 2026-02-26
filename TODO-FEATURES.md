# Feature Gap Analysis — mydeadprojects

Updated: 2026-02-26

## 1. Broken / Not Working as Expected

| # | Problem | Where | Details |
|---|---------|-------|---------|
| — | All previously tracked bugs have been resolved. | | |

### Resolved since last audit (2026-02-19):
- ~~Settings — empty page~~ → Full settings form with bio, displayName, showGithubLink, delete account
- ~~Edit inaccessible on mobile~~ → Button always visible on mobile (`opacity-100 sm:opacity-0 sm:group-hover:opacity-100`)
- ~~Email signup no feedback~~ → "Check your email" message + "Forgot password?" link
- ~~Condolences not revalidated~~ → Proper `revalidatePath` for project page

## 2. Promised but Not Implemented ("Coming Soon")

| Feature | Description | State |
|---------|-------------|-------|
| **GitHub Integration** | Connect GitHub, find abandoned repos, suggest for burial | `githubUsername` saved from OAuth, link shown in profile — but no repo sync or discovery. |

### Resolved:
- ~~Resurrect or Adopt~~ → Fully implemented: adoption pledges, resurrection flow, notifications, "IT LIVES" celebration

## 3. Missing from Core Loop

| Feature | Impact | Details |
|---------|--------|---------|
| **Search** | High | No search by project name, tech stack, or cause of death — neither in explore nor globally. |
| **Explore by tech stack** | Medium | Cause-of-death filter works; tech stack filter still missing despite `techStack` array being stored. |
| **Notifications for flowers/condolences** | Medium | Notification system works (milestones, pledges, resurrections) but doesn't cover individual flowers or condolences. |
| **Data export** | Low | No way to download your data. |

### Resolved:
- ~~Condolence moderation~~ → Owners can delete condolences
- ~~Delete account~~ → Available in Settings "Danger zone" with username confirmation
- ~~Explore filters~~ → Cause of death filter implemented

## 4. Unused Schema Capabilities

| Field/Table | Status |
|-------------|--------|
| `projects.ogImageUrl` | Always `null`. OG generated dynamically. Dead field. |
| `causesOfDeath` table | Exists in DB but causes are hardcoded in `BuryForm`. Table never read. |
| `GraveyardCanvas` component | Fully functional canvas view with drag-and-drop, but not exposed in UI toggle. Only table/grid/timeline views active. |

### Resolved:
- ~~`users.bio`~~ → Editable in Settings
- ~~`users.displayName`~~ → Editable in Settings
- ~~`users.githubUsername`~~ → Displayed in profile when `showGithubLink` enabled
- ~~`projects.status`~~ → Used by adoption/resurrection flow (dead → adopted → resurrected)

## 5. Growth & Engagement

| Feature | Category |
|---------|----------|
| **Explore by tech stack** | Discovery — show projects by technology |
| **Activity feed** | Engagement — "Recently buried", "Recently mourned" |
| **Follow users** | Social — subscriptions, update feed |
| **Remove reaction** | UX — currently can only switch type, not remove entirely |
| **Native Share API** | Mobile — `navigator.share()` for mobile users |

### Resolved:
- ~~GitHub link in profile~~ → Displayed when enabled in settings

## Prioritization

**Quick wins:**
1. Expose `GraveyardCanvas` as a view option
2. Tech stack filter in Explore

**Medium priority:**
3. Search in Explore (project name, tech stack)
4. Notifications for flowers and condolences
5. Activity feed

**Strategic (new mechanics):**
6. GitHub Integration (import abandoned repos)
7. Follow users
