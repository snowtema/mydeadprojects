"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type View = "login" | "signup" | "forgot";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>("login");
  const [emailSent, setEmailSent] = useState(false);

  const supabase = createClient();

  async function handleGitHub() {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/auth/callback`,
      },
    });
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (view === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password`,
        });
        if (error) throw error;
        setEmailSent(true);
      } else if (view === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          },
        });
        if (error) throw error;
        setEmailSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.href = "/graveyard";
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function switchView(next: View) {
    setView(next);
    setError("");
    setEmailSent(false);
  }

  if (emailSent) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <span className="text-4xl block">📧</span>
          <h1 className="text-xl font-bold">Check your email</h1>
          <p className="text-sm text-text-muted font-light">
            {view === "forgot"
              ? `We sent a password reset link to ${email}`
              : `We sent a confirmation link to ${email}`}
          </p>
        </div>

        <button
          onClick={() => switchView("login")}
          className="w-full py-3 px-4 bg-bg-card border border-border rounded-md text-sm text-text-dim font-medium hover:border-border-hover transition-colors cursor-pointer"
        >
          Back to Sign In
        </button>

        <Link
          href="/"
          className="block text-center text-text-muted text-xs hover:text-text-dim transition-colors"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <span className="text-4xl block">🪦</span>
        <h1 className="text-xl font-bold">
          my<span className="text-text-dim font-light">dead</span>projects
        </h1>
      </div>

      {view !== "forgot" && (
        <>
          <button
            onClick={handleGitHub}
            className="w-full py-3 px-4 bg-cta text-bg rounded-md text-sm font-medium hover:bg-cta-hover transition-colors cursor-pointer"
          >
            Continue with GitHub
          </button>

          <div className="flex items-center gap-3 text-text-muted text-xs">
            <div className="flex-1 h-px bg-border" />
            <span>or</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        </>
      )}

      {view === "forgot" && (
        <p className="text-sm text-text-muted font-light text-center">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      )}

      <form onSubmit={handleEmailAuth} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full py-3 px-4 bg-bg-card border border-border rounded-md text-sm text-text placeholder:text-text-muted outline-none focus:border-accent transition-colors"
          required
        />
        {view !== "forgot" && (
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full py-3 px-4 bg-bg-card border border-border rounded-md text-sm text-text placeholder:text-text-muted outline-none focus:border-accent transition-colors"
            required
            minLength={6}
          />
        )}

        {error && <p className="text-red text-xs">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-bg-card border border-border rounded-md text-sm text-text-dim font-medium hover:border-border-hover transition-colors cursor-pointer disabled:opacity-50"
        >
          {loading
            ? "..."
            : view === "forgot"
              ? "Send Reset Link"
              : view === "signup"
                ? "Sign Up"
                : "Sign In"}
        </button>
      </form>

      {view === "login" && (
        <div className="text-center space-y-2">
          <p className="text-text-muted text-xs">
            Don&apos;t have an account?{" "}
            <button
              onClick={() => switchView("signup")}
              className="text-text-dim border-b border-border hover:border-text-dim transition-colors cursor-pointer"
            >
              Sign Up
            </button>
          </p>
          <p>
            <button
              onClick={() => switchView("forgot")}
              className="text-text-muted text-xs border-b border-border hover:border-text-dim hover:text-text-dim transition-colors cursor-pointer"
            >
              Forgot password?
            </button>
          </p>
        </div>
      )}

      {view === "signup" && (
        <p className="text-center text-text-muted text-xs">
          Already have an account?{" "}
          <button
            onClick={() => switchView("login")}
            className="text-text-dim border-b border-border hover:border-text-dim transition-colors cursor-pointer"
          >
            Sign In
          </button>
        </p>
      )}

      {view === "forgot" && (
        <p className="text-center text-text-muted text-xs">
          Remember your password?{" "}
          <button
            onClick={() => switchView("login")}
            className="text-text-dim border-b border-border hover:border-text-dim transition-colors cursor-pointer"
          >
            Sign In
          </button>
        </p>
      )}

      <Link
        href="/"
        className="block text-center text-text-muted text-xs hover:text-text-dim transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
