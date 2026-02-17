import Link from "next/link";
import { type User } from "@/lib/db/schema";

interface NavbarProps {
  user?: User | null;
}

export function Navbar({ user }: NavbarProps) {
  return (
    <nav className="border-b border-border px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg">🪦</span>
          <span className="text-sm font-bold">
            my<span className="text-text-dim font-light">dead</span>projects
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/bury"
                className="text-xs px-3 py-1.5 bg-accent text-bg rounded font-medium hover:opacity-90 transition-opacity"
              >
                + Bury Project
              </Link>
              <Link
                href="/dashboard"
                className="text-xs text-text-dim hover:text-text transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href={`/${user.username}`}
                className="text-xs text-text-muted hover:text-text-dim transition-colors"
              >
                @{user.username}
              </Link>
              <Link
                href="/settings"
                className="text-xs text-text-muted hover:text-text-dim transition-colors"
              >
                Settings
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="text-xs px-3 py-1.5 bg-accent text-bg rounded font-medium hover:opacity-90 transition-opacity"
            >
              Start Burying
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
