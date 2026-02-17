import Link from "next/link";
import { Terminal } from "@/components/landing/terminal";
import { StatsCounter } from "@/components/landing/stats-counter";

const features = [
  {
    icon: "\u2620",
    title: "Project Obituaries",
    desc: "Write a short epitaph for each project. What it was, why it died, and what you learned from the experience.",
  },
  {
    icon: "🪦",
    title: "Your Personal Graveyard",
    desc: "A public page showcasing all your abandoned projects. Wear your failures like badges of honor.",
  },
  {
    icon: "\u2606",
    title: "Resurrect or Adopt",
    desc: "Someone might want to continue where you stopped. Let others adopt your dead projects and bring them back to life.",
  },
  {
    icon: "\u2318",
    title: "GitHub Integration",
    desc: "Connect your GitHub. We'll find the repos that haven't been touched in months and suggest them for burial.",
  },
];

const tombstones = [
  {
    name: "todo-app-v3",
    dates: "2023 \u2013 2023",
    epitaph: "This time it\u2019ll be different",
  },
  {
    name: "crypto-tracker",
    dates: "2021 \u2013 2021",
    epitaph: "Lost interest before losing money",
  },
  {
    name: "dating-for-dogs",
    dates: "2024 \u2013 2024",
    epitaph: "Good boy. Bad idea.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
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
        <section className="py-20 text-center">
          <div className="max-w-[720px] mx-auto px-6">
            <p className="text-[clamp(1.1rem,2.5vw,1.35rem)] font-light max-w-[540px] mx-auto mb-12 leading-relaxed">
              Every developer has a folder of{" "}
              <strong className="font-medium text-white">
                unfinished projects
              </strong>
              . Half-built apps, abandoned repos, ideas that never shipped.
              <br />
              <br />
              It&apos;s time to give them a{" "}
              <strong className="font-medium text-white">proper burial</strong>.
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

        {/* Graveyard Preview */}
        <section className="py-12">
          <div className="max-w-[720px] mx-auto px-6">
            <div className="text-[0.65rem] uppercase tracking-[0.15em] text-text-muted mb-8 pb-3 border-b border-border">
              // preview: someone&apos;s graveyard
            </div>
            <div className="flex justify-center gap-8 flex-wrap">
              {tombstones.map((t) => (
                <div key={t.name} className="w-40">
                  <div className="p-6 bg-bg-card border border-border rounded-t-md text-center hover:border-border-hover transition-colors">
                    <div className="text-lg text-text-muted mb-3">
                      &#10013;
                    </div>
                    <div className="text-xs font-medium text-text-dim mb-1">
                      {t.name}
                    </div>
                    <div className="text-[0.6rem] text-text-muted font-light">
                      {t.dates}
                    </div>
                    <div className="text-[0.6rem] text-text-muted italic mt-2 leading-relaxed">
                      &ldquo;{t.epitaph}&rdquo;
                    </div>
                  </div>
                  <div className="mx-[10%] h-2 bg-bg-subtle border border-border border-t-0 rounded-b" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-16">
          <div className="max-w-[720px] mx-auto px-6">
            <StatsCounter />
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
              className="inline-block px-8 py-3 bg-white text-bg rounded-md text-sm font-medium hover:opacity-90 transition-opacity active:scale-[0.98]"
            >
              Start Burying
            </Link>
            <p className="text-[0.65rem] text-text-muted mt-4 font-light">
              Free forever. No credit card needed.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 text-center border-t border-border">
        <div className="max-w-[720px] mx-auto px-6">
          <p className="text-[0.7rem] text-text-muted font-light leading-relaxed">
            Built with love for all the projects that never were.
          </p>
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
