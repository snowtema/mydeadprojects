"use client";

import { useState } from "react";
import { toggleOpenForResurrection } from "@/actions/resurrection";
import { ShareMenu } from "@/components/share-menu";

interface ResurrectionToggleProps {
  projectId: string;
  projectName: string;
  projectUrl: string;
  initialOpen: boolean;
}

export function ResurrectionToggle({
  projectId,
  projectName,
  projectUrl,
  initialOpen,
}: ResurrectionToggleProps) {
  const [open, setOpen] = useState(initialOpen);
  const [toggling, setToggling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showShare, setShowShare] = useState(false);

  async function handleConfirm() {
    setToggling(true);
    const result = await toggleOpenForResurrection(projectId);
    if (!result.error && result.open !== undefined) {
      setOpen(result.open);
      setShowConfirm(false);
      if (result.open) {
        setShowShare(true);
      } else {
        setShowShare(false);
      }
    }
    setToggling(false);
  }

  async function handleClose() {
    setToggling(true);
    const result = await toggleOpenForResurrection(projectId);
    if (!result.error && result.open !== undefined) {
      setOpen(result.open);
      setShowShare(false);
    }
    setToggling(false);
  }

  if (open) {
    return (
      <div className="space-y-3">
        <button
          onClick={handleClose}
          disabled={toggling}
          className="text-sm px-4 py-1.5 bg-green-dim border border-green/30 text-green hover:border-green/50 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
        >
          {toggling ? "Updating..." : "Close for Resurrection"}
        </button>
        {showShare && (
          <div className="space-y-2">
            <p className="text-xs text-text-muted">
              Share to find a necromancer:
            </p>
            <ShareMenu
              url={projectUrl}
              title={`${projectName} needs a necromancer!`}
              text={`My project ${projectName} is looking for a second chance. Will you be its Necromancer? ${projectUrl}`}
            />
          </div>
        )}
      </div>
    );
  }

  if (showConfirm) {
    return (
      <div className="border border-border rounded-md p-4 space-y-3">
        <p className="text-sm text-text-dim font-medium">
          ☽ Open for Resurrection
        </p>
        <div className="text-xs text-text-muted space-y-1">
          <p>This will:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-1">
            <li>Mark your project as available for adoption</li>
            <li>Show it in the &ldquo;Seeking Revival&rdquo; feed</li>
            <li>Allow other devs to submit adoption pledges</li>
          </ul>
          <p className="mt-2">You&apos;ll approve or reject any adoption requests.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfirm(false)}
            className="text-sm px-4 py-1.5 bg-bg-card border border-border rounded-md text-text-muted hover:border-border-hover hover:text-text-dim transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={toggling}
            className="text-sm px-4 py-1.5 bg-green-dim border border-green/30 text-green hover:border-green/50 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
          >
            {toggling ? "Opening..." : "☽ Open for Adoption"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-sm px-4 py-1.5 bg-bg-card border border-border text-text-muted hover:border-border-hover hover:text-text-dim rounded-md transition-colors cursor-pointer"
    >
      ☽ Seek a Necromancer
    </button>
  );
}
