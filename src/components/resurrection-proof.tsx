"use client";

import { useState } from "react";
import { submitResurrectionProof } from "@/actions/resurrection";
import { ItLivesCelebration } from "@/components/it-lives-celebration";

interface ResurrectionProofProps {
  projectId: string;
  projectName: string;
  projectUrl: string;
  pageUrl: string;
}

export function ResurrectionProof({
  projectId,
  projectName,
  projectUrl,
  pageUrl,
}: ResurrectionProofProps) {
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await submitResurrectionProof(projectId, url);

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else {
      setCelebrating(true);
    }
  }

  // Celebration is a fullscreen overlay — stays until user navigates away
  if (celebrating) {
    return (
      <ItLivesCelebration
        projectName={projectName}
        projectUrl={projectUrl}
        pageUrl={pageUrl}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm text-text-muted">
        Submit proof that you&apos;ve brought this project back to life.
      </p>
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://your-resurrected-project.com"
        className="w-full bg-bg-card border border-border rounded-md px-3 py-2 text-sm text-text-dim placeholder:text-text-muted focus:outline-none focus:border-green/50"
        disabled={submitting}
      />
      {error && <p className="text-xs text-red">{error}</p>}
      <button
        type="submit"
        disabled={submitting || !url.startsWith("http")}
        className="text-sm px-4 py-1.5 bg-green-dim border border-green/30 rounded-md text-green hover:border-green/50 transition-colors disabled:opacity-50 cursor-pointer"
      >
        {submitting ? "Submitting..." : "Submit Proof"}
      </button>
    </form>
  );
}
