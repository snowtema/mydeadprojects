import Link from "next/link";
import { TombstoneIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <TombstoneIcon className="w-10 h-10 text-accent mx-auto" />
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
