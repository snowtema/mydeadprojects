"use client";

import { useState } from "react";
import { type Project } from "@/lib/db/schema";
import { GraveyardGrid } from "./graveyard-grid";
import { GraveyardCanvasWrapper } from "./graveyard-canvas-wrapper";
import { Grid3X3, Map } from "lucide-react";

interface GraveyardViewToggleProps {
  projects: Project[];
  username: string;
  showEdit?: boolean;
}

type ViewMode = "canvas" | "grid";

export function GraveyardViewToggle({
  projects,
  username,
  showEdit,
}: GraveyardViewToggleProps) {
  // Default to canvas if any project has position, otherwise grid
  const hasPositions = projects.some(
    (p) => p.positionX != null && p.positionY != null
  );
  // TODO: re-enable canvas as default when ready
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
            onClick={() => setView("canvas")}
            className={`p-1.5 transition-colors ${
              view === "canvas"
                ? "bg-border text-text-dim"
                : "text-text-muted hover:text-text-dim"
            }`}
            aria-label="Canvas view"
            title="Canvas view"
          >
            <Map size={14} />
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
      {view === "canvas" ? (
        <GraveyardCanvasWrapper
          projects={projects}
          username={username}
          showEdit={showEdit}
        />
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
