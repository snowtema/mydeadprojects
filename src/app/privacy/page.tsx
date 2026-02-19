import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — mydeadprojects",
  description: "How mydeadprojects handles your data.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-[720px] mx-auto px-6 py-16 space-y-10">
      <div>
        <Link
          href="/"
          className="text-xs text-text-muted hover:text-text-dim transition-colors"
        >
          &larr; Back to home
        </Link>
        <h1 className="text-lg font-medium mt-4 mb-1">Privacy Policy</h1>
        <p className="text-xs text-text-muted">Last updated: February 2026</p>
        <div className="h-px bg-border mt-4" />
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-text-dim">What we collect</h2>
        <ul className="text-xs text-text-muted font-light leading-relaxed space-y-2 list-disc list-inside">
          <li>
            <strong className="text-text-dim font-normal">Account data</strong> — email address, display name, bio, and avatar. If you sign up via GitHub, we also store your GitHub username.
          </li>
          <li>
            <strong className="text-text-dim font-normal">Project data</strong> — project names, dates, descriptions, tech stacks, screenshots, and other information you provide when burying a project.
          </li>
          <li>
            <strong className="text-text-dim font-normal">Visitor interactions</strong> — flowers (reactions) and condolence messages. We use a one-way hash of your IP address to prevent spam. We do not store raw IP addresses.
          </li>
          <li>
            <strong className="text-text-dim font-normal">Cookies</strong> — session cookies for authentication only. No tracking cookies, no analytics cookies.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-text-dim">How we use it</h2>
        <ul className="text-xs text-text-muted font-light leading-relaxed space-y-2 list-disc list-inside">
          <li>To provide the service: display your profile, projects, and interactions.</li>
          <li>To prevent abuse: rate limiting based on hashed IP addresses.</li>
          <li>To send transactional emails: password resets and account confirmations.</li>
        </ul>
        <p className="text-xs text-text-muted font-light leading-relaxed">
          We do not sell your data. We do not run ads. We do not use third-party analytics or tracking scripts.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-text-dim">Third-party services</h2>
        <ul className="text-xs text-text-muted font-light leading-relaxed space-y-2 list-disc list-inside">
          <li><strong className="text-text-dim font-normal">Supabase</strong> — authentication and database hosting (EU).</li>
          <li><strong className="text-text-dim font-normal">Cloudflare R2</strong> — screenshot storage.</li>
          <li><strong className="text-text-dim font-normal">GitHub OAuth</strong> — optional sign-in provider.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-text-dim">Your rights</h2>
        <ul className="text-xs text-text-muted font-light leading-relaxed space-y-2 list-disc list-inside">
          <li><strong className="text-text-dim font-normal">Delete your account</strong> — go to Settings and delete your account. This permanently removes all your data including projects, flowers, and condolences.</li>
          <li><strong className="text-text-dim font-normal">Edit your data</strong> — you can update your profile and projects at any time.</li>
          <li><strong className="text-text-dim font-normal">Data portability</strong> — contact us if you need an export of your data.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-text-dim">Data retention</h2>
        <p className="text-xs text-text-muted font-light leading-relaxed">
          We keep your data for as long as your account exists. When you delete your account, all associated data is permanently removed from our databases and file storage.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-text-dim">Contact</h2>
        <p className="text-xs text-text-muted font-light leading-relaxed">
          Questions about your data? Reach out via GitHub issues on our repository.
        </p>
      </section>

      <div className="h-px bg-border" />
      <p className="text-[0.65rem] text-text-muted text-center">
        mydeadprojects &mdash; built with love for all the projects that never were.
      </p>
    </div>
  );
}
