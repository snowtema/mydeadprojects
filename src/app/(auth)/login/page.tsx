"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const supabase = createClient();

  async function handleGitHub() {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.href = "/dashboard";
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <span className="text-4xl block">🪦</span>
        <h1 className="text-xl font-bold">
          my<span className="text-text-dim font-light">dead</span>projects
        </h1>
      </div>

      <button
        onClick={handleGitHub}
        className="w-full py-3 px-4 bg-white text-bg rounded-md text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
      >
        Continue with GitHub
      </button>

      <div className="flex items-center gap-3 text-text-muted text-xs">
        <div className="flex-1 h-px bg-border" />
        <span>or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={handleEmailAuth} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full py-3 px-4 bg-bg-card border border-border rounded-md text-sm text-text placeholder:text-text-muted outline-none focus:border-accent transition-colors"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          {loading ? "..." : isSignUp ? "Sign Up" : "Sign In"}
        </button>
      </form>

      <p className="text-center text-text-muted text-xs">
        {isSignUp ? "Already have an account? " : "Don't have an account? "}
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-text-dim border-b border-border hover:border-text-dim transition-colors cursor-pointer"
        >
          {isSignUp ? "Sign In" : "Sign Up"}
        </button>
      </p>

      <Link
        href="/"
        className="block text-center text-text-muted text-xs hover:text-text-dim transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
