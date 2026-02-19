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
  const [showShare, setShowShare] = useState(false);

  async function handleToggle() {
    setToggling(true);
    const result = await toggleOpenForResurrection(projectId);
    if (!result.error && result.open !== undefined) {
      setOpen(result.open);
      if (result.open) {
        setShowShare(true);
      } else {
        setShowShare(false);
      }
    }
    setToggling(false);
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleToggle}
        disabled={toggling}
        className={`text-sm px-4 py-1.5 border rounded-md transition-colors disabled:opacity-50 ${
          open
            ? "bg-green-dim border-green/30 text-green hover:border-green/50"
            : "bg-bg-card border-border text-text-muted hover:border-border-hover hover:text-text-dim"
        }`}
      >
        {toggling
          ? "Updating..."
          : open
            ? "Close for Resurrection"
            : "Open for Resurrection"}
      </button>
      {showShare && (
        <div className="space-y-2">
          <p className="text-xs text-text-muted">
            Share to find a necromancer:
          </p>
          <ShareMenu
            url={projectUrl}
            title={`${projectName} needs a necromancer!`}
            text={`${projectName} is looking for someone to bring it back to life! Can you resurrect it?`}
          />
        </div>
      )}
    </div>
  );
}
