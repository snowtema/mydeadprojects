"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateProfile, deleteAccount } from "@/actions/auth";
import { Github } from "lucide-react";

interface SettingsFormProps {
  initialDisplayName: string;
  initialBio: string;
  username: string;
  githubUsername: string | null;
  initialShowGithubLink: boolean;
}

export function SettingsForm({
  initialDisplayName,
  initialBio,
  username,
  githubUsername,
  initialShowGithubLink,
}: SettingsFormProps) {
  const router = useRouter();
  const supabase = createClient();

  // Profile form
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio);
  const [showGithubLink, setShowGithubLink] = useState(initialShowGithubLink);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Delete account
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmValue, setConfirmValue] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const hasChanges =
    displayName !== initialDisplayName ||
    bio !== initialBio ||
    showGithubLink !== initialShowGithubLink;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!hasChanges) return;
    setSaving(true);
    setProfileError("");
    setSaved(false);

    const result = await updateProfile({ displayName, bio, showGithubLink });

    if (result.error) {
      setProfileError(result.error);
      setSaving(false);
      return;
    }

    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleLinkGitHub() {
    await supabase.auth.linkIdentity({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/settings`,
      },
    });
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function handleDeleteAccount() {
    if (confirmValue !== username) return;
    setDeleting(true);
    setDeleteError("");

    try {
      const result = await deleteAccount();
      if (result.error) {
        setDeleteError(result.error);
        setDeleting(false);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setDeleteError("Something went wrong. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Profile */}
      <form onSubmit={handleSave} className="space-y-4">
        <h2 className="text-xs text-text-dim uppercase tracking-wider">
          Profile
        </h2>

        <div className="space-y-1.5">
          <label
            htmlFor="displayName"
            className="text-xs text-text-muted"
          >
            Display name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={100}
            placeholder="Your name"
            className="w-full py-2.5 px-3 bg-bg-card border border-border rounded-md text-sm text-text placeholder:text-text-muted outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="bio" className="text-xs text-text-muted">
            Bio
            <span className="ml-2 text-text-muted/60">
              {bio.length}/280
            </span>
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={280}
            rows={3}
            placeholder="A few words about yourself..."
            className="w-full py-2.5 px-3 bg-bg-card border border-border rounded-md text-sm text-text placeholder:text-text-muted outline-none focus:border-accent transition-colors resize-none"
          />
        </div>

        {/* GitHub link toggle */}
        {githubUsername && (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showGithubLink}
              onChange={(e) => setShowGithubLink(e.target.checked)}
              className="w-4 h-4 rounded border-border accent-accent cursor-pointer"
            />
            <span className="text-xs text-text-muted">
              Show GitHub link on profile
              <span className="ml-1.5 text-text-dim font-mono">
                @{githubUsername}
              </span>
            </span>
          </label>
        )}

        {profileError && (
          <p className="text-red text-xs">{profileError}</p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!hasChanges || saving}
            className="px-4 py-2 text-xs bg-bg-card border border-border rounded-md text-text-dim hover:border-border-hover transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          {saved && (
            <span className="text-xs text-green">Saved</span>
          )}
        </div>
      </form>

      {/* GitHub */}
      {!githubUsername && (
        <div className="space-y-4">
          <h2 className="text-xs text-text-dim uppercase tracking-wider">
            GitHub
          </h2>
          <button
            onClick={handleLinkGitHub}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs bg-bg-card border border-border rounded-md text-text-dim hover:border-border-hover transition-colors cursor-pointer"
          >
            <Github className="w-3.5 h-3.5" />
            Link GitHub Account
          </button>
          <p className="text-xs text-text-muted">
            Link your GitHub to show a profile link and enable future integrations.
          </p>
        </div>
      )}

      {/* Account */}
      <div className="space-y-4">
        <h2 className="text-xs text-text-dim uppercase tracking-wider">
          Account
        </h2>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-xs bg-bg-card border border-border rounded-md text-red hover:border-red transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      </div>

      {/* Danger zone */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => {
            const next = !deleteOpen;
            setDeleteOpen(next);
            if (!next) {
              setConfirmValue("");
              setDeleteError("");
            }
          }}
          className="text-xs text-text-muted hover:text-text-dim transition-colors cursor-pointer"
        >
          {deleteOpen ? "\u25BE" : "\u25B8"} Danger zone
        </button>

        {deleteOpen && (
          <div className="space-y-3 p-4 border border-red-dim rounded-md bg-bg-card">
            <p className="text-xs text-text-dim">
              This permanently deletes your account, all your projects, flowers,
              and condolences. This cannot be undone.
            </p>
            <p className="text-xs text-text-muted">
              Type{" "}
              <span className="font-mono text-text-dim">{username}</span>{" "}
              to confirm.
            </p>

            <input
              type="text"
              placeholder={username}
              value={confirmValue}
              onChange={(e) => setConfirmValue(e.target.value)}
              className="w-full py-3 px-4 bg-bg-card border border-border rounded-md text-sm text-text placeholder:text-text-muted outline-none focus:border-red transition-colors"
              autoComplete="off"
            />

            {deleteError && (
              <p className="text-red text-xs">{deleteError}</p>
            )}

            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={confirmValue !== username || deleting}
              className="px-4 py-2 text-xs bg-bg-card border border-border rounded-md text-red hover:border-red transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border"
            >
              {deleting ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
