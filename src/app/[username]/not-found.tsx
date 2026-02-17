import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <span className="text-4xl block">🪦</span>
        <h1 className="text-lg font-medium">Graveyard Not Found</h1>
        <p className="text-xs text-text-muted font-light">
          This graveyard doesn&apos;t exist yet.
          <br />
          Maybe it died before it was born.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-bg-card border border-border rounded-md text-sm text-text-dim hover:border-border-hover transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
