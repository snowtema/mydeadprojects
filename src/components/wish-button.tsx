"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { addResurrectionWish, getVisitorWish } from "@/actions/resurrection";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface WishButtonProps {
  projectId: string;
  initialCount: number;
}

const PARTICLE_COUNT = 5;
const PARTICLE_STAGGER = 80;

export function WishButton({ projectId, initialCount }: WishButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [wished, setWished] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const reducedMotion = useReducedMotion();
  const nextId = useRef(0);

  useEffect(() => {
    getVisitorWish(projectId).then((hasWished) => {
      setWished(hasWished);
      setLoading(false);
    });
  }, [projectId]);

  const spawnParticles = useCallback(() => {
    if (reducedMotion) return;
    const newParticles: { id: number; x: number }[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      newParticles.push({
        id: nextId.current++,
        x: Math.random() * 50 - 25,
      });
    }
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1200 + PARTICLE_STAGGER * PARTICLE_COUNT);
  }, [reducedMotion]);

  const handleWish = useCallback(async () => {
    if (loading || wished) return;

    // Optimistic update
    setWished(true);
    setCount((c) => c + 1);
    spawnParticles();

    const result = await addResurrectionWish(projectId);

    if (result.error) {
      setWished(false);
      setCount((c) => c - 1);
    }
  }, [loading, wished, projectId, spawnParticles]);

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
        {particles.map((p, i) => (
          <span
            key={p.id}
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
            style={{
              animation: `wish-float 1.2s ease-out ${i * PARTICLE_STAGGER}ms forwards`,
              opacity: 0,
              transform: `translateX(${p.x}px)`,
            }}
          >
            <span className="text-[0.7rem] text-cta">☽</span>
          </span>
        ))}
      </span>
      <span
        className={`tabular-nums ${wished ? "text-green" : "text-green/70"}`}
      >
        {count}
      </span>
    </button>
  );
}
