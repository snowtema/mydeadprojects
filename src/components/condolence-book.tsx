"use client";

import { useState } from "react";
import { addCondolence, deleteCondolence } from "@/actions/condolences";
import { timeAgo } from "@/lib/utils";
import type { Condolence } from "@/lib/db/schema";

interface CondolenceBookProps {
  projectId: string;
  initialCondolences: Condolence[];
  isOwner?: boolean;
}

export function CondolenceBook({
  projectId,
  initialCondolences,
  isOwner,
}: CondolenceBookProps) {
  const [condolences, setCondolences] = useState(initialCondolences);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  async function handleDelete(condolenceId: string) {
    setDeletingId(condolenceId);
    const result = await deleteCondolence(condolenceId, projectId);

    if (result.error) {
      setDeletingId(null);
      return;
    }

    setCondolences((prev) => prev.filter((c) => c.id !== condolenceId));
    setDeletingId(null);
  }

  return (
    <div className="space-y-4">
      <div className="text-xs uppercase tracking-widest text-text-muted pb-3 border-b border-border">
        // condolence book
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Leave a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={280}
          className="flex-1 py-2 px-3 bg-bg-card border border-border rounded-md text-sm text-text placeholder:text-text-muted outline-none focus:border-accent transition-colors"
        />
        <button
          type="submit"
          disabled={submitting || !message.trim()}
          className="px-4 py-2 bg-bg-card border border-border rounded-md text-sm text-text-dim hover:border-border-hover transition-colors cursor-pointer disabled:opacity-50"
        >
          {submitting ? "..." : "Send"}
        </button>
      </form>

      {error && <p className="text-red text-xs">{error}</p>}

      {condolences.length > 0 && (
        <div className="space-y-2">
          {condolences.map((c) => (
            <div
              key={c.id}
              className="group py-2.5 px-3 bg-bg-card border border-border rounded-md"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-text-muted font-light leading-relaxed flex-1">
                  {c.message}
                </p>
                {isOwner && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    disabled={deletingId === c.id}
                    className="shrink-0 text-xs text-text-muted/40 hover:text-red opacity-0 group-hover:opacity-100 transition-all cursor-pointer disabled:opacity-50"
                    title="Delete condolence"
                  >
                    {deletingId === c.id ? "..." : "\u00d7"}
                  </button>
                )}
              </div>
              <p className="text-xs text-text-muted/60 mt-1">
                {timeAgo(new Date(c.createdAt))}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
