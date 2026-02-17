"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { claimUsername } from "@/actions/auth";

export default function UsernamePage() {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const checkAvailability = useCallback(async (value: string) => {
    if (value.length < 3) {
      setStatus("idle");
      return;
    }

    setStatus("checking");
    try {
      const res = await fetch(
        `/api/username/check?username=${encodeURIComponent(value)}`
      );
      const data = await res.json();
      setStatus(data.available ? "available" : "taken");
      if (!data.available && data.reason) {
        setError(data.reason);
      } else {
        setError("");
      }
    } catch {
      setStatus("idle");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (username.length >= 3) {
        checkAvailability(username);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [username, checkAvailability]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status !== "available") return;

    setSubmitting(true);
    setError("");

    const result = await claimUsername(username);

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    router.push("/graveyard");
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-lg font-medium">Choose your graveyard URL</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="text-text-dim text-xs mb-2">
            mydeadprojects.com/@
          </div>
          <input
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            className="w-full py-3 px-4 bg-bg-card border border-border rounded-md text-sm text-text placeholder:text-text-muted outline-none focus:border-accent transition-colors"
            maxLength={20}
            autoFocus
          />
        </div>

        <div className="text-xs h-5">
          {status === "checking" && (
            <span className="text-text-muted">Checking...</span>
          )}
          {status === "available" && (
            <span className="text-green">Available</span>
          )}
          {status === "taken" && (
            <span className="text-red">{error || "Already taken"}</span>
          )}
          {status === "invalid" && (
            <span className="text-red">{error}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={status !== "available" || submitting}
          className="w-full py-3 px-4 bg-cta text-bg rounded-md text-sm font-medium hover:bg-cta-hover transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {submitting ? "Claiming..." : "Claim My Graveyard"}
        </button>
      </form>
    </div>
  );
}
