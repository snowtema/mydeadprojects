"use client";

import { useState } from "react";
import { type Project } from "@/lib/db/schema";
import { GraveyardGrid } from "./graveyard-grid";
import { GraveyardTimeline } from "./graveyard-timeline";
import { Grid3X3, GitCommitHorizontal } from "lucide-react";

interface GraveyardViewToggleProps {
  projects: Project[];
  username: string;
  showEdit?: boolean;
}

type ViewMode = "timeline" | "grid";

export function GraveyardViewToggle({
  projects,
  username,
  showEdit,
}: GraveyardViewToggleProps) {
  const [view, setView] = useState<ViewMode>("grid");

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-text-muted uppercase tracking-widest">
          The Graveyard
        </div>
        <div className="flex items-center bg-bg-card border border-border rounded-md overflow-hidden">
          <button
            onClick={() => setView("timeline")}
            className={`p-1.5 transition-colors ${
              view === "timeline"
                ? "bg-border text-text-dim"
                : "text-text-muted hover:text-text-dim"
            }`}
            aria-label="Timeline view"
            title="Timeline view"
          >
            <GitCommitHorizontal size={14} />
          </button>
          <button
            onClick={() => setView("grid")}
            className={`p-1.5 transition-colors ${
              view === "grid"
                ? "bg-border text-text-dim"
                : "text-text-muted hover:text-text-dim"
            }`}
            aria-label="Grid view"
            title="Grid view"
          >
            <Grid3X3 size={14} />
          </button>
        </div>
      </div>

      {/* View */}
      {view === "timeline" ? (
        <GraveyardTimeline projects={projects} username={username} />
      ) : (
        <GraveyardGrid
          projects={projects}
          username={username}
          showEdit={showEdit}
        />
      )}
    </div>
  );
}
