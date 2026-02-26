"use client";

import Link from "next/link";
import { Send } from "lucide-react";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  // Landing page has its own custom footer
  if (pathname === "/") return null;

  return (
    <footer className="py-8 text-center border-t border-border mt-16">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-center gap-4 text-[0.65rem] text-text-muted">
        <Link
          href="/privacy"
          className="hover:text-text-dim transition-colors"
        >
          Privacy
        </Link>
        <span className="text-border">·</span>
        <a
          href="https://x.com/mydeadprojects"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-text-dim transition-colors"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          X
        </a>
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
    </footer>
  );
}
