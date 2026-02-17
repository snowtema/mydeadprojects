"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { addFlower } from "@/actions/flowers";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface FlowerButtonProps {
  projectId: string;
  initialCount: number;
}

export function FlowerButton({ projectId, initialCount }: FlowerButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [animating, setAnimating] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const reducedMotion = useReducedMotion();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback(async () => {
    if (disabled) return;

    setCount((c) => c + 1);
    setAnimating(true);
    setDisabled(true);

    if (!reducedMotion) {
      setTimeout(() => setAnimating(false), 800);
    } else {
      setAnimating(false);
    }

    const result = await addFlower(projectId);

    if (result.error) {
      setCount((c) => c - 1);
      if (!result.error.includes("rate")) {
        setDisabled(false);
      }
    }
  }, [disabled, projectId, reducedMotion]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "f" || e.key === "F") {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag === "input" || tag === "textarea" || tag === "select") return;
        e.preventDefault();
        handleClick();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [handleClick]);

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled}
      className="relative inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-card border border-border rounded-md text-xs text-text-muted hover:border-border-hover hover:text-text-dim transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="relative">
        <kbd className="inline-flex items-center justify-center w-5 h-5 bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-border-hover border-b-2 rounded text-[0.6rem] text-text-dim font-mono">
          F
        </kbd>
        {animating && !reducedMotion && (
          <span
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
            style={{
              animation: "float-up 0.8s ease forwards",
            }}
          >
            <span className="text-[0.6rem] font-mono font-bold text-accent">F</span>
          </span>
        )}
      </span>
      <span className="text-accent">{count}</span>
    </button>
  );
}
