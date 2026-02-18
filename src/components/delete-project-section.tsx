"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProject } from "@/actions/projects";

interface DeleteProjectSectionProps {
  projectId: string;
  projectName: string;
}

export function DeleteProjectSection({
  projectId,
  projectName,
}: DeleteProjectSectionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmValue, setConfirmValue] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const canDelete = confirmValue === projectName;

  async function handleDelete() {
    if (!canDelete) return;
    setDeleting(true);
    setError("");

    try {
      const result = await deleteProject(projectId);

      if (result.error) {
        setError(result.error);
        return;
      }

      router.push("/graveyard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4 max-w-lg">
      <button
        type="button"
        onClick={() => {
          const nextOpen = !open;
          setOpen(nextOpen);
          if (!nextOpen) {
            setConfirmValue("");
            setError("");
          }
        }}
        className="text-xs text-text-muted hover:text-text-dim transition-colors cursor-pointer"
      >
        {open ? "▾" : "▸"} Danger zone
      </button>

      {open && (
        <div className="space-y-3 p-4 border border-red-dim rounded-md bg-bg-card">
          <p className="text-xs text-text-dim">
            This permanently deletes{" "}
            <span className="text-text font-medium">{projectName}</span> and all
            its flowers and condolences. This cannot be undone.
          </p>
          <p className="text-xs text-text-muted">
            Type{" "}
            <span className="font-mono text-text-dim">{projectName}</span> to
            confirm.
          </p>

          <input
            type="text"
            placeholder={projectName}
            value={confirmValue}
            onChange={(e) => setConfirmValue(e.target.value)}
            className="w-full py-3 px-4 bg-bg-card border border-border rounded-md text-sm text-text placeholder:text-text-muted outline-none focus:border-red transition-colors"
            autoComplete="off"
          />

          {error && <p className="text-red text-xs">{error}</p>}

          <button
            type="button"
            onClick={handleDelete}
            disabled={!canDelete || deleting}
            className="px-4 py-2 text-xs bg-bg-card border border-border rounded-md text-red hover:border-red transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border"
          >
            {deleting ? "Deleting..." : "Delete Project"}
          </button>
        </div>
      )}
    </div>
  );
}
