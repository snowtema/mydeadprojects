import Link from "next/link";
import { Terminal } from "@/components/landing/terminal";
import { StatsCounter } from "@/components/landing/stats-counter";
import { db } from "@/lib/db";
import { projects, users, flowers } from "@/lib/db/schema";
import { count, sql } from "drizzle-orm";
import { Skull, Sparkles, Github, Cross, Send } from "lucide-react";
import { type ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const features: { icon: ReactNode; title: string; desc: string; comingSoon?: boolean }[] = [
  {
    icon: <Skull className="w-5 h-5 text-text-muted" />,
    title: "Project Obituaries",
    desc: "Write a short epitaph for each project. What it was, why it died, and what you learned from the experience.",
  },
  {
    icon: <Cross className="w-5 h-5 text-text-muted" />,
    title: "Your Personal Graveyard",
    desc: "A public page showcasing all your abandoned projects. Wear your failures like badges of honor.",
  },
  {
    icon: <Sparkles className="w-5 h-5 text-text-muted" />,
    title: "Resurrect or Adopt",
    desc: "Someone might want to continue where you stopped. Let others adopt your dead projects and bring them back to life.",
    comingSoon: true,
  },
  {
    icon: <Github className="w-5 h-5 text-text-muted" />,
    title: "GitHub Integration",
    desc: "Connect your GitHub. We'll find the repos that haven't been touched in months and suggest them for burial.",
    comingSoon: true,
  },
];

export default async function Home() {
  const [projectsResult, usersResult, flowersResult, randomGraves] = await Promise.all([
    db.select({ value: count() }).from(projects),
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(flowers),
    db.query.projects.findMany({
      orderBy: sql`RANDOM()`,
      limit: 3,
      columns: { name: true, slug: true, startDate: true, endDate: true, epitaph: true },
      with: { user: { columns: { username: true } } },
    }),
  ]);

  const stats = {
    projectsBuried: projectsResult[0]?.value ?? 0,
    developers: usersResult[0]?.value ?? 0,
    respectsPaid: flowersResult[0]?.value ?? 0,
  };
  return (
    <div className="min-h-screen">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Header */}
      <header className="pt-12 text-center">
        <span className="text-5xl block mb-6" aria-hidden="true">
          🪦
        </span>
        <h1 className="text-[clamp(1.5rem,4vw,2.2rem)] font-bold tracking-tight mb-2">
          my<span className="text-text-dim font-light">dead</span>projects
        </h1>
        <p className="text-sm text-text-dim font-light tracking-wide">
          a graveyard for abandoned side projects
        </p>
      </header>

      <main>
        {/* Hero */}
        <section className="py-24 text-center">
          <div className="max-w-[720px] mx-auto px-6">
            <p className="text-[clamp(1.1rem,2.5vw,1.35rem)] font-light max-w-[540px] mx-auto mb-12 leading-relaxed">
              Every developer has a folder of{" "}
              <strong className="font-medium text-text-strong">
                unfinished projects
              </strong>
              . Half-built apps, abandoned repos, ideas that never shipped.
              <br />
              <br />
              It&apos;s time to give them a{" "}
              <strong className="font-medium text-text-strong">proper burial</strong>.
            </p>

            <Terminal />
          </div>
        </section>

        {/* Features */}
        <section className="pb-20">
          <div className="max-w-[720px] mx-auto px-6">
            <div className="text-[0.65rem] uppercase tracking-[0.15em] text-text-muted mb-8 pb-3 border-b border-border">
              // what is this
            </div>
            <div className="grid gap-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="grid grid-cols-[40px_1fr] gap-4 p-5 border border-border rounded-md bg-bg-card hover:border-border-hover hover:bg-bg-subtle transition-colors"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-bg rounded-md border border-border text-lg">
                    {feature.icon}
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">
                      {feature.title}
                      {feature.comingSoon && (
                        <span className="ml-2 text-[0.6rem] font-normal text-text-muted bg-bg-subtle border border-border rounded px-1.5 py-0.5 align-middle">
                          Coming soon
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-text-dim font-light leading-relaxed">
                      {feature.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Random Graveyard */}
        {randomGraves.length > 0 && (
          <section className="py-12">
            <div className="max-w-4xl mx-auto px-6">
              <div className="text-[0.65rem] uppercase tracking-[0.15em] text-text-muted mb-8 pb-3 border-b border-border">
                // random graves
              </div>
              <div className="flex justify-center gap-10 flex-wrap">
                {randomGraves.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/${t.user.username}/${t.slug}`}
                    className="w-48 group"
                  >
                    <div className="tombstone-card p-6 border border-border rounded-t-md text-center group-hover:border-border-hover transition-all duration-300">
                      <div className="tombstone-cross text-lg text-text-muted mb-3">
                        &#10013;
                      </div>
                      <div className="text-xs font-medium text-text-dim mb-1">
                        {t.name}
                      </div>
                      <div className="text-[0.6rem] text-text-muted font-light">
                        {t.startDate.slice(0, 4)} &ndash; {t.endDate.slice(0, 4)}
                      </div>
                      <div className="text-sm font-serif text-text-dim italic mt-2 leading-relaxed">
                        &ldquo;{t.epitaph}&rdquo;
                      </div>
                    </div>
                    <div className="tombstone-base mx-[10%] h-2 bg-bg border border-border border-t-0 rounded-b" />
                  </Link>
                ))}
              </div>
              <div className="mt-8 text-center">
                <Link
                  href="/explore"
                  className="text-sm text-text-muted hover:text-text-dim transition-colors"
                >
                  Explore all &rarr;
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Stats */}
        <section className="mb-16 bg-bg-subtle border-y border-border">
          <div className="max-w-5xl mx-auto px-6">
            <StatsCounter {...stats} />
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center">
          <div className="max-w-[720px] mx-auto px-6">
            <p className="text-sm text-text-dim font-light mb-8">
              Stop hoarding dead code. Start sharing your failures.
            </p>
            <Link
              href="/login"
              className="inline-block px-8 py-3 bg-cta text-bg rounded-md text-sm font-medium hover:bg-cta-hover transition-colors active:scale-[0.98]"
            >
              Start Burying
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 text-center border-t border-border">
        <div className="max-w-[720px] mx-auto px-6">
          <p className="text-[0.7rem] text-text-muted font-light leading-relaxed">
            Built with love for all the projects that never were.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3 text-[0.65rem] text-text-muted">
            <Link
              href="/privacy"
              className="hover:text-text-dim transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-border">·</span>
            <a
              href="https://t.me/mydeadprojects"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-text-dim transition-colors"
            >
              <Send size={10} />
              Telegram
            </a>
          </div>
          <pre
            className="mt-6 text-[0.6rem] text-text-muted leading-snug opacity-50"
            aria-hidden="true"
          >
            {`   _____
  |     |
  | RIP |
  |     |
  |_____|
  /|   |\\
 / |   | \\`}
          </pre>
        </div>
      </footer>
    </div>
  );
}
