"use client";

import { useState, useEffect, useCallback } from "react";
import { addFlower, getVisitorReaction } from "@/actions/flowers";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Flame, Skull } from "lucide-react";

type ReactionType = "flower" | "candle" | "rip" | "lol";

export interface ReactionCounts {
  flower: number;
  candle: number;
  rip: number;
  lol: number;
}

interface FlowerButtonProps {
  projectId: string;
  reactionCounts: ReactionCounts;
}

const SECONDARY_REACTIONS: {
  type: ReactionType;
  icon: React.ReactNode;
  label: string;
  activeClass: string;
  floatIcon: React.ReactNode;
}[] = [
  {
    type: "candle",
    icon: <Flame size={12} strokeWidth={1.5} />,
    label: "Light a candle",
    activeClass: "reaction-candle-active",
    floatIcon: <Flame size={10} strokeWidth={2} />,
  },
  {
    type: "rip",
    icon: <span className="text-[0.65rem] leading-none font-serif">&#10013;</span>,
    label: "Rest in peace",
    activeClass: "reaction-rip-active",
    floatIcon: <span className="text-[0.55rem] font-serif">&#10013;</span>,
  },
  {
    type: "lol",
    icon: <Skull size={12} strokeWidth={1.5} />,
    label: "Worth it",
    activeClass: "reaction-lol-active",
    floatIcon: <Skull size={10} strokeWidth={2} />,
  },
];

export function FlowerButton({
  projectId,
  reactionCounts,
}: FlowerButtonProps) {
  const [counts, setCounts] = useState<ReactionCounts>(reactionCounts);
  const [selectedType, setSelectedType] = useState<ReactionType | null>(null);
  const [animatingType, setAnimatingType] = useState<ReactionType | null>(null);
  const [loading, setLoading] = useState(true);
  const reducedMotion = useReducedMotion();

  // Check visitor's existing reaction on mount
  useEffect(() => {
    getVisitorReaction(projectId).then((type) => {
      setSelectedType(type as ReactionType | null);
      setLoading(false);
    });
  }, [projectId]);

  const handleReaction = useCallback(
    async (type: ReactionType) => {
      if (loading) return;
      if (selectedType === type) return;

      const previousType = selectedType;
      const previousCounts = { ...counts };

      // Optimistic update
      setSelectedType(type);
      setAnimatingType(type);

      if (previousType) {
        // Changing type: decrement old, increment new
        setCounts((prev) => ({
          ...prev,
          [previousType]: Math.max(0, prev[previousType] - 1),
          [type]: prev[type] + 1,
        }));
      } else {
        // New reaction
        setCounts((prev) => ({
          ...prev,
          [type]: prev[type] + 1,
        }));
      }

      if (!reducedMotion) {
        setTimeout(() => setAnimatingType(null), 800);
      } else {
        setAnimatingType(null);
      }

      const result = await addFlower(projectId, type);

      if (result.error && result.error !== "same_type") {
        // Revert on real errors
        setSelectedType(previousType);
        setCounts(previousCounts);
      }
    },
    [loading, selectedType, counts, projectId, reducedMotion]
  );

  // Keyboard shortcut: F → flower reaction
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "f" || e.key === "F") {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag === "input" || tag === "textarea" || tag === "select") return;
        e.preventDefault();
        handleReaction("flower");
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [handleReaction]);

  const isFlowerSelected = selectedType === "flower";

  return (
    <div className="inline-flex items-center gap-1.5">
      {/* Primary: Press F to pay respects */}
      <button
        onClick={() => handleReaction("flower")}
        disabled={loading}
        className={`
          reaction-btn reaction-btn-primary
          ${isFlowerSelected ? "reaction-flower-active" : ""}
          ${loading ? "opacity-40" : ""}
        `}
      >
        <span className="relative">
          <kbd
            className={`
              reaction-kbd
              ${isFlowerSelected ? "reaction-kbd-active" : ""}
            `}
          >
            F
          </kbd>
          {animatingType === "flower" && !reducedMotion && (
            <span
              className="absolute inset-0 pointer-events-none flex items-center justify-center"
              style={{ animation: "float-up 0.8s ease forwards" }}
            >
              <span className="text-[0.6rem] font-mono font-bold text-accent">
                F
              </span>
            </span>
          )}
        </span>
        <span
          className={`tabular-nums ${isFlowerSelected ? "text-accent" : "text-accent/70"}`}
        >
          {counts.flower}
        </span>
      </button>

      {/* Separator */}
      <div className="w-px h-4 bg-border/40 mx-0.5" />

      {/* Secondary reactions */}
      {SECONDARY_REACTIONS.map(
        ({ type, icon, label, activeClass, floatIcon }) => {
          const isSelected = selectedType === type;
          const count = counts[type];

          return (
            <button
              key={type}
              onClick={() => handleReaction(type)}
              disabled={loading}
              title={label}
              className={`
                reaction-btn reaction-btn-secondary
                ${isSelected ? activeClass : ""}
                ${loading ? "opacity-40" : ""}
              `}
            >
              <span className="relative inline-flex">
                {icon}
                {animatingType === type && !reducedMotion && (
                  <span
                    className="absolute inset-0 pointer-events-none flex items-center justify-center"
                    style={{ animation: "float-up 0.8s ease forwards" }}
                  >
                    {floatIcon}
                  </span>
                )}
              </span>
              {count > 0 && (
                <span className="tabular-nums">{count}</span>
              )}
            </button>
          );
        }
      )}
    </div>
  );
}
