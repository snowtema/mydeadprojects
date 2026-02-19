"use client";

import { useState } from "react";
import { type Project } from "@/lib/db/schema";
import { GraveyardGrid } from "./graveyard-grid";
import { GraveyardTimeline } from "./graveyard-timeline";
import { GraveyardTable } from "./graveyard-table";
import { Grid3X3, GitCommitHorizontal, List } from "lucide-react";

interface GraveyardViewToggleProps {
  projects: Project[];
  username: string;
  showEdit?: boolean;
}

type ViewMode = "table" | "grid" | "timeline";

export function GraveyardViewToggle({
  projects,
  username,
  showEdit,
}: GraveyardViewToggleProps) {
  const [view, setView] = useState<ViewMode>("grid");

  const buttons: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: "table", icon: <List size={14} />, label: "Table view" },
    { mode: "grid", icon: <Grid3X3 size={14} />, label: "Grid view" },
    { mode: "timeline", icon: <GitCommitHorizontal size={14} />, label: "Timeline view" },
  ];

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-text-muted uppercase tracking-widest">
          The Graveyard
        </div>
        <div className="flex items-center bg-bg-card border border-border rounded-md overflow-hidden">
          {buttons.map((btn) => (
            <button
              key={btn.mode}
              onClick={() => setView(btn.mode)}
              className={`p-1.5 transition-colors ${
                view === btn.mode
                  ? "bg-border text-text-dim"
                  : "text-text-muted hover:text-text-dim"
              }`}
              aria-label={btn.label}
              title={btn.label}
            >
              {btn.icon}
            </button>
          ))}
        </div>
      </div>

      {/* View */}
      {view === "table" ? (
        <GraveyardTable
          projects={projects}
          username={username}
          showEdit={showEdit}
        />
      ) : view === "timeline" ? (
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
