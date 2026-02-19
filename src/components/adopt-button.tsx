"use client";

import { useState } from "react";
import { submitPledge } from "@/actions/resurrection";
import { ShareMenu } from "@/components/share-menu";
import Link from "next/link";

interface AdoptButtonProps {
  projectId: string;
  projectName: string;
  projectUrl: string;
  isAuthenticated: boolean;
  hasPendingPledge?: boolean;
}

export function AdoptButton({
  projectId,
  projectName,
  projectUrl,
  isAuthenticated,
  hasPendingPledge = false,
}: AdoptButtonProps) {
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm px-4 py-2 bg-green-dim border border-green/30 rounded-md text-green hover:border-green/50 transition-colors"
      >
        Log in to adopt this project
      </Link>
    );
  }

  if (success) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-green">
          Pledge submitted! The owner will review your request.
        </p>
        <ShareMenu
          url={projectUrl}
          title={`I pledged to resurrect ${projectName}!`}
          text={`I just pledged to bring ${projectName} back to life on MyDeadProjects!`}
        />
      </div>
    );
  }

  if (hasPendingPledge) {
    return (
      <p className="text-sm text-text-muted italic">
        Your pledge is pending review by the owner.
      </p>
    );
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="inline-flex items-center gap-2 text-sm px-4 py-2 bg-green-dim border border-green/30 rounded-md text-green hover:border-green/50 transition-colors"
      >
        Adopt this project
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await submitPledge(projectId, message);

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else {
      setSuccess(true);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={140}
          rows={3}
          placeholder="Why do you want to resurrect this project?"
          className="w-full bg-bg-card border border-border rounded-md px-3 py-2 text-sm text-text-dim placeholder:text-text-muted focus:outline-none focus:border-green/50 resize-none"
          disabled={submitting}
        />
        <span className="absolute bottom-2 right-2 text-xs text-text-muted tabular-nums">
          {message.length}/140
        </span>
      </div>
      {error && <p className="text-xs text-red">{error}</p>}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={submitting || message.trim().length === 0}
          className="text-sm px-4 py-1.5 bg-green-dim border border-green/30 rounded-md text-green hover:border-green/50 transition-colors disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Pledge"}
        </button>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-sm px-3 py-1.5 text-text-muted hover:text-text-dim transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
