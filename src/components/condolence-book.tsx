"use client";

import { useState } from "react";
import { addCondolence } from "@/actions/condolences";
import { cn, timeAgo } from "@/lib/utils";
import type { Condolence } from "@/lib/db/schema";

interface CondolenceBookProps {
  projectId: string;
  initialCondolences: Condolence[];
}

export function CondolenceBook({
  projectId,
  initialCondolences,
}: CondolenceBookProps) {
  const [condolences, setCondolences] = useState(initialCondolences);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setError("");
    setSubmitting(true);

    const result = await addCondolence(projectId, message);

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    // Optimistic update
    setCondolences([
      {
        id: crypto.randomUUID(),
        projectId,
        visitorHash: "",
        message: message.trim(),
        createdAt: new Date(),
      },
      ...condolences,
    ]);
    setMessage("");
    setSubmitting(false);
  }

  return (
    <div className="space-y-4">
      <div className="text-[0.65rem] uppercase tracking-[0.15em] text-text-muted pb-3 border-b border-border">
        // condolence book
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Leave a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={280}
          className="flex-1 py-2 px-3 bg-bg-card border border-border rounded-md text-xs text-text placeholder:text-text-muted outline-none focus:border-accent transition-colors"
        />
        <button
          type="submit"
          disabled={submitting || !message.trim()}
          className="px-3 py-2 bg-bg-card border border-border rounded-md text-xs text-text-dim hover:border-border-hover transition-colors cursor-pointer disabled:opacity-50"
        >
          {submitting ? "..." : "Send"}
        </button>
      </form>

      {error && <p className="text-red text-[0.6rem]">{error}</p>}

      {condolences.length > 0 && (
        <div className="space-y-2">
          {condolences.map((c) => (
            <div
              key={c.id}
              className="py-2 px-3 bg-bg-card border border-border rounded-md"
            >
              <p className="text-xs text-text-muted font-light leading-relaxed">
                {c.message}
              </p>
              <p className="text-[0.55rem] text-text-muted mt-1">
                {timeAgo(new Date(c.createdAt))}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
