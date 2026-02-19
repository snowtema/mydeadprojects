"use client";

import { useState } from "react";
import { Grid3X3, List } from "lucide-react";
import { type ProjectWithUser } from "./explore-grid";
import { ExploreGrid } from "./explore-grid";
import { ExploreTable } from "./explore-table";

type ViewMode = "grid" | "table";

interface ExploreViewToggleProps {
  projects: ProjectWithUser[];
}

export function ExploreViewToggle({ projects }: ExploreViewToggleProps) {
  const [view, setView] = useState<ViewMode>("table");

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <div className="flex items-center bg-bg-card border border-border rounded-md overflow-hidden">
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
          <button
            onClick={() => setView("table")}
            className={`p-1.5 transition-colors ${
              view === "table"
                ? "bg-border text-text-dim"
                : "text-text-muted hover:text-text-dim"
            }`}
            aria-label="Table view"
            title="Table view"
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <ExploreGrid projects={projects} />
      ) : (
        <ExploreTable projects={projects} />
      )}
    </div>
  );
}
