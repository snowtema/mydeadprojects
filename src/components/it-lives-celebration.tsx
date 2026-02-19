"use client";

import { useState, useEffect, useCallback } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface ItLivesCelebrationProps {
  onComplete: () => void;
}

const LETTERS = "IT LIVES!".split("");
const PARTICLE_COUNT = 40;

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  size: number;
  color: string;
  delay: number;
}

function generateParticles(): Particle[] {
  const colors = ["#5a9a5a", "#7aba7a", "#C4A07C", "#D4B08C", "#e8e8e8"];
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: 50 + (Math.random() - 0.5) * 20,
    y: 50 + (Math.random() - 0.5) * 20,
    angle: Math.random() * 360,
    speed: 2 + Math.random() * 4,
    size: 3 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 400,
  }));
}

export function ItLivesCelebration({ onComplete }: ItLivesCelebrationProps) {
  const [phase, setPhase] = useState<"flash" | "text" | "done">("flash");
  const [visibleLetters, setVisibleLetters] = useState(0);
  const [particles] = useState(generateParticles);
  const reducedMotion = useReducedMotion();

  const finish = useCallback(() => {
    setPhase("done");
    setTimeout(onComplete, 300);
  }, [onComplete]);

  useEffect(() => {
    if (reducedMotion) {
      setPhase("text");
      setVisibleLetters(LETTERS.length);
      const t = setTimeout(finish, 2000);
      return () => clearTimeout(t);
    }

    // Flash phase: 400ms
    const flashTimer = setTimeout(() => setPhase("text"), 400);
    return () => clearTimeout(flashTimer);
  }, [reducedMotion, finish]);

  // Letter-by-letter reveal
  useEffect(() => {
    if (phase !== "text" || reducedMotion) return;
    if (visibleLetters >= LETTERS.length) {
      const doneTimer = setTimeout(finish, 2500);
      return () => clearTimeout(doneTimer);
    }
    const letterTimer = setTimeout(
      () => setVisibleLetters((v) => v + 1),
      120
    );
    return () => clearTimeout(letterTimer);
  }, [phase, visibleLetters, reducedMotion, finish]);

  return (
    <div
      className={`fixed inset-0 z-[10000] flex items-center justify-center cursor-pointer transition-opacity duration-300 ${
        phase === "done" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      onClick={finish}
    >
      {/* Background */}
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          phase === "flash" ? "bg-green/20" : "bg-bg/95"
        }`}
      />

      {/* Flash */}
      {phase === "flash" && !reducedMotion && (
        <div className="absolute inset-0 bg-green/30 animate-[celebration-flash_0.4s_ease-out_forwards]" />
      )}

      {/* Particles */}
      {!reducedMotion &&
        particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              animation: `celebration-burst 2s ease-out ${p.delay}ms forwards`,
              "--burst-x": `${Math.cos((p.angle * Math.PI) / 180) * p.speed * 60}px`,
              "--burst-y": `${Math.sin((p.angle * Math.PI) / 180) * p.speed * 60}px`,
              opacity: 0,
            } as React.CSSProperties}
          />
        ))}

      {/* Text */}
      {phase === "text" && (
        <div className="relative z-10 text-center">
          <div className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-widest">
            {LETTERS.map((letter, i) => (
              <span
                key={i}
                className={`inline-block transition-all duration-300 ${
                  i < visibleLetters
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
                style={{
                  color: letter === "!" ? "#C4A07C" : "#5a9a5a",
                  textShadow:
                    i < visibleLetters
                      ? `0 0 40px ${letter === "!" ? "rgba(196,160,124,0.4)" : "rgba(90,154,90,0.4)"}`
                      : "none",
                }}
              >
                {letter === " " ? "\u00A0" : letter}
              </span>
            ))}
          </div>
          <div
            className={`mt-6 text-sm text-text-muted transition-opacity duration-500 ${
              visibleLetters >= LETTERS.length ? "opacity-100" : "opacity-0"
            }`}
          >
            From grave to glory
          </div>
        </div>
      )}

      {/* Click to dismiss hint */}
      <div
        className={`absolute bottom-8 text-xs text-text-muted/50 transition-opacity duration-500 ${
          visibleLetters >= LETTERS.length ? "opacity-100" : "opacity-0"
        }`}
      >
        click to continue
      </div>
    </div>
  );
}
