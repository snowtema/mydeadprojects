import Link from "next/link";

export function EmptyGraveyard() {
  return (
    <div className="border border-dashed border-border rounded-md p-12 text-center space-y-4">
      <p className="text-text-dim text-sm">Your graveyard is empty.</p>
      <p className="text-text-muted text-sm font-light leading-relaxed">
        Every developer has dead code.
        <br />
        Time to give it a burial.
      </p>
      <Link
        href="/bury"
        className="inline-block px-6 py-3 bg-cta text-bg rounded-md text-sm font-medium hover:bg-cta-hover transition-colors"
      >
        Bury Your First Project
      </Link>
    </div>
  );
}
