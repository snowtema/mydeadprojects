"use client";

import { useState, useEffect, useCallback } from "react";
import { addResurrectionWish, getVisitorWish } from "@/actions/resurrection";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface WishButtonProps {
  projectId: string;
  initialCount: number;
}

export function WishButton({ projectId, initialCount }: WishButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [wished, setWished] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(true);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    getVisitorWish(projectId).then((hasWished) => {
      setWished(hasWished);
      setLoading(false);
    });
  }, [projectId]);

  const handleWish = useCallback(async () => {
    if (loading || wished) return;

    // Optimistic update
    setWished(true);
    setCount((c) => c + 1);
    setAnimating(true);

    if (!reducedMotion) {
      setTimeout(() => setAnimating(false), 800);
    } else {
      setAnimating(false);
    }

    const result = await addResurrectionWish(projectId);

    if (result.error) {
      // Revert
      setWished(false);
      setCount((c) => c - 1);
    }
  }, [loading, wished, projectId, reducedMotion]);

  // Keyboard shortcut: R
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === "KeyR") {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag === "input" || tag === "textarea" || tag === "select") return;
        e.preventDefault();
        handleWish();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [handleWish]);

  return (
    <button
      onClick={handleWish}
      disabled={loading || wished}
      className={`
        reaction-btn reaction-btn-primary
        ${wished ? "reaction-wish-active" : ""}
        ${loading ? "opacity-40" : ""}
      `}
    >
      <span className="relative">
        <kbd
          className={`
            reaction-kbd
            ${wished ? "reaction-wish-active" : ""}
          `}
        >
          R
        </kbd>
        {animating && !reducedMotion && (
          <span
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
            style={{ animation: "float-up 0.8s ease forwards" }}
          >
            <span className="text-[0.6rem] font-mono font-bold text-green">
              R
            </span>
          </span>
        )}
      </span>
      <span
        className={`tabular-nums ${wished ? "text-green" : "text-green/70"}`}
      >
        {count}
      </span>
    </button>
  );
}
