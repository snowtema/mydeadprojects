"use client";

import { useState } from "react";
import { resolvePledge } from "@/actions/resurrection";

interface PledgeReviewProps {
  pledge: {
    id: string;
    message: string;
    createdAt: Date;
    user: {
      username: string;
      displayName: string | null;
      avatarUrl: string | null;
    };
  };
}

export function PledgeReview({ pledge }: PledgeReviewProps) {
  const [resolving, setResolving] = useState(false);
  const [resolved, setResolved] = useState<"approve" | "decline" | null>(null);

  async function handleResolve(action: "approve" | "decline") {
    setResolving(true);
    const result = await resolvePledge(pledge.id, action);
    if (!result.error) {
      setResolved(action);
    }
    setResolving(false);
  }

  if (resolved === "approve") {
    return (
      <p className="text-sm text-green">
        Pledge approved! @{pledge.user.username} is now the necromancer.
      </p>
    );
  }

  if (resolved === "decline") {
    return (
      <p className="text-sm text-text-muted">Pledge declined.</p>
    );
  }

  return (
    <div className="border border-border rounded-md p-4 space-y-3">
      <div className="flex items-center gap-3">
        {pledge.user.avatarUrl ? (
          <img
            src={pledge.user.avatarUrl}
            alt=""
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-bg-card border border-border flex items-center justify-center text-xs text-text-muted">
            @
          </div>
        )}
        <div>
          <span className="text-sm text-text-dim font-medium">
            {pledge.user.displayName || `@${pledge.user.username}`}
          </span>
          <span className="text-xs text-text-muted ml-2">
            @{pledge.user.username}
          </span>
        </div>
      </div>
      <p className="text-sm text-text-dim leading-relaxed">
        &ldquo;{pledge.message}&rdquo;
      </p>
      <p className="text-xs text-text-muted">
        {new Date(pledge.createdAt).toLocaleDateString()}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleResolve("approve")}
          disabled={resolving}
          className="text-sm px-4 py-1.5 bg-green-dim border border-green/30 rounded-md text-green hover:border-green/50 transition-colors disabled:opacity-50 cursor-pointer"
        >
          Approve
        </button>
        <button
          onClick={() => handleResolve("decline")}
          disabled={resolving}
          className="text-sm px-4 py-1.5 bg-red-dim border border-red/30 rounded-md text-red hover:border-red/50 transition-colors disabled:opacity-50 cursor-pointer"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
