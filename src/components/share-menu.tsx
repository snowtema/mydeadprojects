"use client";

import { useState } from "react";

interface ShareMenuProps {
  url: string;
  title: string;
  text?: string;
}

export function ShareMenu({ url, title, text }: ShareMenuProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text || title
  )}&url=${encodeURIComponent(url)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={copyLink}
        className="text-[0.6rem] px-2 py-1 bg-bg-card border border-border rounded text-text-muted hover:border-border-hover hover:text-text-dim transition-colors cursor-pointer"
        title="Copy link"
      >
        {copied ? "Copied!" : "🔗 Copy"}
      </button>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[0.6rem] px-2 py-1 bg-bg-card border border-border rounded text-text-muted hover:border-border-hover hover:text-text-dim transition-colors"
        title="Share on Twitter"
      >
        𝕏
      </a>
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[0.6rem] px-2 py-1 bg-bg-card border border-border rounded text-text-muted hover:border-border-hover hover:text-text-dim transition-colors"
        title="Share on LinkedIn"
      >
        in
      </a>
    </div>
  );
}
