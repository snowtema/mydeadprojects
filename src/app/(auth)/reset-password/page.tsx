"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <span className="text-4xl block">🔐</span>
          <h1 className="text-xl font-bold">Password updated</h1>
          <p className="text-sm text-text-muted font-light">
            Your password has been reset successfully.
          </p>
        </div>
        <Link
          href="/graveyard"
          className="block w-full py-3 px-4 bg-cta text-bg rounded-md text-sm font-medium hover:bg-cta-hover transition-colors text-center"
        >
          Go to your graveyard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <span className="text-4xl block">🔐</span>
        <h1 className="text-xl font-bold">Set new password</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full py-3 px-4 bg-bg-card border border-border rounded-md text-sm text-text placeholder:text-text-muted outline-none focus:border-accent transition-colors"
          required
          minLength={6}
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full py-3 px-4 bg-bg-card border border-border rounded-md text-sm text-text placeholder:text-text-muted outline-none focus:border-accent transition-colors"
          required
          minLength={6}
        />

        {error && <p className="text-red text-xs">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-bg-card border border-border rounded-md text-sm text-text-dim font-medium hover:border-border-hover transition-colors cursor-pointer disabled:opacity-50"
        >
          {loading ? "..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
