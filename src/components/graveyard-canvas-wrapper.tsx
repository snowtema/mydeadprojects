"use client";

import { useState, useTransition, useCallback } from "react";
import { type Project } from "@/lib/db/schema";
import { GraveyardCanvas } from "./graveyard-canvas";
import { updateProjectPosition } from "@/actions/projects";

interface GraveyardCanvasWrapperProps {
  projects: Project[];
  username: string;
  showEdit?: boolean;
}

export function GraveyardCanvasWrapper({
  projects,
  username,
  showEdit,
}: GraveyardCanvasWrapperProps) {
  const [placingId, setPlacingId] = useState<string | null>(null);
  const [localProjects, setLocalProjects] = useState(projects);
  const [isPending, startTransition] = useTransition();

  // Find projects without positions (need placement)
  const unplaced = localProjects.filter(
    (p) => p.positionX == null || p.positionY == null
  );

  const handlePlace = useCallback(
    (projectId: string, x: number, y: number) => {
      // Optimistic update
      setLocalProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, positionX: x, positionY: y } : p
        )
      );
      setPlacingId(null);

      // Persist to DB
      startTransition(async () => {
        await updateProjectPosition(projectId, x, y);
      });
    },
    []
  );

  return (
    <div className="space-y-4">
      {/* Unplaced projects banner */}
      {showEdit && unplaced.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-bg-card border border-border rounded-lg">
          <span className="text-xs text-text-muted flex-1">
            {unplaced.length} project{unplaced.length > 1 ? "s" : ""} need
            placement on the map
          </span>
          <div className="flex gap-2 flex-wrap">
            {unplaced.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlacingId(p.id)}
                disabled={isPending}
                className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                  placingId === p.id
                    ? "bg-cta/10 border-cta/30 text-cta"
                    : "bg-bg border-border text-text-dim hover:border-border-hover"
                }`}
              >
                Place &ldquo;{p.name}&rdquo;
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Canvas */}
      <GraveyardCanvas
        projects={localProjects}
        username={username}
        showEdit={showEdit}
        onPlace={handlePlace}
        placingProjectId={placingId}
      />

      {/* Cancel placement */}
      {placingId && (
        <div className="flex justify-center">
          <button
            onClick={() => setPlacingId(null)}
            className="text-xs text-text-muted hover:text-text-dim transition-colors"
          >
            Cancel placement
          </button>
        </div>
      )}
    </div>
  );
}
