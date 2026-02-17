"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { type Project, type User } from "@/lib/db/schema";
import { TombstoneCard } from "./tombstone-card";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export type ProjectWithUser = Project & {
  user: Pick<User, "username" | "avatarUrl">;
};

interface ExploreGridProps {
  projects: ProjectWithUser[];
}

export function ExploreGrid({ projects }: ExploreGridProps) {
  const reducedMotion = useReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);
  const [visibleSet, setVisibleSet] = useState<Set<number>>(new Set());
  const observedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(
              (entry.target as HTMLElement).dataset.index
            );
            if (!observedRef.current.has(index)) {
              observedRef.current.add(index);
              setVisibleSet((prev) => new Set(prev).add(index));
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    const items = grid.querySelectorAll("[data-index]");
    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [projects]);

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {projects.map((project, index) => (
        <div
          key={project.id}
          data-index={index}
          style={
            reducedMotion
              ? { opacity: 1 }
              : {
                  opacity: visibleSet.has(index) ? 1 : 0,
                  transform: visibleSet.has(index)
                    ? "translateY(0)"
                    : "translateY(16px)",
                  animation: visibleSet.has(index)
                    ? `fade-in 0.4s ease ${index * 80}ms both`
                    : "none",
                }
          }
        >
          <TombstoneCard
            project={project}
            username={project.user.username}
          />
          <div className="mt-1 text-center">
            <Link
              href={`/${project.user.username}`}
              className="text-[0.6rem] text-text-muted hover:text-text-dim transition-colors"
            >
              buried by @{project.user.username}
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
