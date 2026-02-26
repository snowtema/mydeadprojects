# MyDeadProjects

**Make failure a standard part of a developer's portfolio.**

MyDeadProjects is a platform where developers create personal graveyards for their abandoned side projects. Write epitaphs, share "death certificates," and turn your pile of unfinished repos into a portfolio of experience.

> GitHub shows what you built. LinkedIn shows your career. **MDP shows the journey** — with all the dead ends, pivots, and burials.

## Why?

The average developer has 5-15 dead repos on GitHub. Yet there's no standardized way to document and share this experience. The industry declares "fail fast, learn faster" but has no infrastructure for it.

MyDeadProjects flips the attitude toward failure from shame to experience, humor, and community.

## Features

- **Project Obituaries** — Write epitaphs for each dead project. What it was, why it died, and what you learned.
- **Personal Graveyard** — A public page (`/username`) showcasing all your abandoned projects as tombstones.
- **Death Certificates** — Auto-generated OG images for sharing on Twitter/LinkedIn/Telegram.
- **Resurrection** — Community members can pledge to resurrect dead projects.
- **Pay Respects** — Leave flowers and condolences on other developers' projects.
- **Telegram Notifications** — Daily automated posts to a Telegram channel.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Server Actions) |
| Language | TypeScript |
| Database | PostgreSQL via [Supabase](https://supabase.com/) |
| ORM | [Drizzle ORM](https://orm.drizzle.team/) |
| Auth | Supabase Auth (GitHub OAuth) |
| CSS | [Tailwind CSS 4](https://tailwindcss.com/) |
| Cache | Redis ([Valkey](https://valkey.io/)) |
| Storage | [Cloudflare R2](https://www.cloudflare.com/r2/) |
| Workers | [Cloudflare Workers](https://workers.cloudflare.com/) (R2 proxy, Telegram cron) |
| Hosting | Self-hosted on [Hetzner](https://www.hetzner.com/) VPS via Docker |

## Getting Started

### Prerequisites

- Node.js 22+
- Docker (for Redis)
- Supabase project (free tier works)
- Cloudflare account (for R2 storage)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/snowtema/mydeadprojects.git
   cd mydeadprojects
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file and fill in your values:
   ```bash
   cp .env.local.example .env.local
   ```
   See [.env.local.example](.env.local.example) for all required variables.

4. Start Redis:
   ```bash
   docker compose up -d
   ```

5. Push the database schema:
   ```bash
   npm run db:push
   ```

6. Start the dev server:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

### Cloudflare Workers (optional)

The project uses two Cloudflare Workers:

- **R2 proxy** (`worker/`) — Handles image uploads to R2 with CORS
- **Telegram cron** (`workers/telegram-cron/`) — Posts daily updates to Telegram

Deploy them with [Wrangler](https://developers.cloudflare.com/workers/wrangler/):
```bash
cd worker && npx wrangler deploy
cd workers/telegram-cron && npx wrangler deploy
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages & API routes
│   ├── (app)/        # Authenticated routes (dashboard, settings)
│   ├── (auth)/       # Auth routes (login, callback)
│   ├── api/          # API endpoints (health, cron, OG images)
│   ├── [username]/   # Public user profiles
│   └── explore/      # Public project exploration
├── components/       # React components
├── actions/          # Server actions
├── hooks/            # Custom React hooks
└── lib/              # Database, auth, storage, utilities
    ├── db/           # Drizzle schema & queries
    └── supabase/     # Supabase client helpers
```

## Deployment

The project deploys via GitHub Actions (`.github/workflows/deploy.yml`):

1. Builds a Docker image
2. Pushes to GitHub Container Registry
3. Deploys to VPS via SSH

For manual deployment, see `deploy.sh` (requires `DEPLOY_HOST` env var).

## Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run lint: `npm run lint`
5. Commit: `git commit -m "Add my feature"`
6. Push: `git push origin feature/my-feature`
7. Open a Pull Request

Please check [TODO-FEATURES.md](TODO-FEATURES.md) and [GitHub Issues](https://github.com/snowtema/mydeadprojects/issues) for ideas on what to work on.

## Documentation

Detailed design and architecture docs are in the [docs/](docs/) directory:

- [Product Vision](docs/product-vision.md)
- [Technical Architecture](docs/architecture.md)
- [Phase 1 UX Design](docs/phase1-ux-design.md)
- [Resurrection UX Flow](docs/resurrection-ux-flow.md)

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).
