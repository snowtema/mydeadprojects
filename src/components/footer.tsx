import Link from "next/link";
import { Send } from "lucide-react";

export function Footer() {
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
