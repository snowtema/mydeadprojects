"use client";

import { useState, useRef } from "react";
import { addFlower } from "@/actions/flowers";

interface FlowerButtonProps {
  projectId: string;
  initialCount: number;
}

export function FlowerButton({ projectId, initialCount }: FlowerButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [animating, setAnimating] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  async function handleClick() {
    if (disabled) return;

    // Optimistic update
    setCount((c) => c + 1);
    setAnimating(true);
    setDisabled(true);

    setTimeout(() => setAnimating(false), 800);

    const result = await addFlower(projectId);

    if (result.error) {
      // Revert optimistic update
      setCount((c) => c - 1);
      // Keep disabled if rate limited
      if (!result.error.includes("rate")) {
        setDisabled(false);
      }
    }
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled}
      className="relative inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-card border border-border rounded-md text-xs text-text-muted hover:border-border-hover hover:text-text-dim transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="relative">
        🌸
        {animating && (
          <span
            className="absolute inset-0 pointer-events-none"
            style={{
              animation: "float-up 0.8s ease forwards",
            }}
          >
            🌸
          </span>
        )}
      </span>
      <span>{count}</span>
    </button>
  );
}
