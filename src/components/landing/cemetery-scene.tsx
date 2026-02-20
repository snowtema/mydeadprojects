"use client";

import { useState, useEffect } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useTheme } from "@/components/theme-provider";

// ── Types ────────────────────────────────────────────────────

interface Star {
  id: number;
  x: number;
  y: number;
  char: string;
  delay: number;
  duration: number;
  baseOpacity: number;
}

interface Bird {
  id: number;
  y: number;
  duration: number;
  delay: number;
  sx: string;
  sy: string;
  ex: string;
  ey: string;
}

// ── Constants ────────────────────────────────────────────────

const STAR_CHARS = [".", "·", ".", "*", "+", "·", "."];
const STAR_COUNT = 35;

const BIRDS: Bird[] = [
  {
    id: 0, y: 15, duration: 16, delay: 0,
    sx: "-60px", sy: "0px",
    ex: "calc(100vw + 60px)", ey: "-30px",
  },
  {
    id: 1, y: 8, duration: 20, delay: 6,
    sx: "calc(100vw + 80px)", sy: "0px",
    ex: "-80px", ey: "25px",
  },
  {
    id: 2, y: 28, duration: 18, delay: 12,
    sx: "-40px", sy: "0px",
    ex: "calc(100vw + 40px)", ey: "-55px",
  },
];

// ── Helpers ──────────────────────────────────────────────────

function padCenter(s: string, w: number): string {
  if (s.length >= w) return s.slice(0, w);
  const left = Math.floor((w - s.length) / 2);
  return s.padStart(s.length + left).padEnd(w);
}

function generateStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 92 + 4,
    y: Math.random() * 55 + 3,
    char: STAR_CHARS[Math.floor(Math.random() * STAR_CHARS.length)],
    delay: Math.random() * 5,
    duration: 2 + Math.random() * 4,
    baseOpacity: 0.3 + Math.random() * 0.6,
  }));
}

// ── ASCII Art (borderless tombstones) ────────────────────────

const CW = 18;
const CENTER_TOMBSTONE = [
  padCenter("†", CW),
  "─".repeat(CW),
  padCenter("R . I . P .", CW),
  padCenter("here lies", CW),
  padCenter("your code", CW),
  "─".repeat(CW),
  padCenter("│", CW),
].join("\n");

const SW = 12;
function makeSideTombstone(name: string): string {
  const n = name.length > SW - 2 ? name.slice(0, SW - 3) + "." : name;
  return [
    padCenter("†", SW),
    "─".repeat(SW),
    padCenter("R.I.P", SW),
    padCenter(n, SW),
    "─".repeat(SW),
    padCenter("│", SW),
  ].join("\n");
}

const LEFT_TOMBSTONE = makeSideTombstone("todo-app");
const RIGHT_TOMBSTONE = makeSideTombstone("saas-v2");
const GROUND = "▓".repeat(200);

// ── Component ────────────────────────────────────────────────

export function CemeteryScene() {
  const reducedMotion = useReducedMotion();
  const { resolved } = useTheme();
  const isLight = resolved === "light";
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    setStars(generateStars(STAR_COUNT));
  }, []);

  const mounted = stars.length > 0;
  const preBase =
    "font-mono leading-tight whitespace-pre select-none text-text-muted/80";
  const preSize = "text-[8px] sm:text-[10px] lg:text-xs";

  return (
    <div
      className="relative w-full max-w-[900px] mx-auto overflow-hidden select-none"
      style={{ height: "clamp(200px, 30vw, 360px)" }}
      aria-hidden="true"
      role="presentation"
    >
      {/* ── Stars (dark only) ── */}
      {!isLight &&
        stars.map((s) => (
          <span
            key={s.id}
            className="absolute text-text-muted pointer-events-none"
            style={
              reducedMotion
                ? {
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    fontSize:
                      s.char === "*" || s.char === "+"
                        ? "clamp(0.5rem, 1vw, 0.7rem)"
                        : "clamp(0.4rem, 0.8vw, 0.55rem)",
                    opacity: s.baseOpacity,
                  }
                : ({
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    fontSize:
                      s.char === "*" || s.char === "+"
                        ? "clamp(0.5rem, 1vw, 0.7rem)"
                        : "clamp(0.4rem, 0.8vw, 0.55rem)",
                    animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
                    "--twinkle-min": `${s.char === "." ? 0.1 : 0.15}`,
                    "--twinkle-max": `${s.char === "*" ? 1 : 0.85}`,
                  } as React.CSSProperties)
            }
          >
            {s.char}
          </span>
        ))}

      {/* ── Moon (dark) / Sun (light) ── */}
      {!isLight ? (
        <span
          className="absolute text-cta pointer-events-none"
          style={{
            top: "8%",
            right: "12%",
            fontSize: "clamp(1rem, 2.5vw, 1.6rem)",
            textShadow:
              "0 0 20px rgba(196,160,124,0.3), 0 0 40px rgba(196,160,124,0.15)",
          }}
        >
          ☽
        </span>
      ) : (
        <span
          className="absolute text-cta pointer-events-none"
          style={{
            top: "8%",
            left: "12%",
            fontSize: "clamp(1.2rem, 3vw, 2rem)",
            textShadow:
              "0 0 25px rgba(154,115,80,0.4), 0 0 50px rgba(154,115,80,0.15)",
          }}
        >
          ☀
        </span>
      )}

      {/* ── Birds (arbitrary directions) ── */}
      {!reducedMotion &&
        mounted &&
        BIRDS.map((b) => (
          <span
            key={b.id}
            className="absolute text-text-dim/60 pointer-events-none whitespace-nowrap font-mono"
            style={
              {
                top: `${b.y}%`,
                left: 0,
                fontSize: "clamp(0.45rem, 0.9vw, 0.7rem)",
                animation: `fly-bird ${b.duration}s linear ${b.delay}s infinite`,
                "--bird-sx": b.sx,
                "--bird-sy": b.sy,
                "--bird-ex": b.ex,
                "--bird-ey": b.ey,
              } as React.CSSProperties
            }
          >
            ~v~
          </span>
        ))}

      {/* ── Tombstones + Ground ── */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
        <div className="flex items-end gap-2 sm:gap-5 lg:gap-10">
          {/* Left grave — tilted */}
          <pre
            className={`${preBase} ${preSize} hidden sm:block text-center`}
            style={{
              transform: "rotate(-4deg)",
              transformOrigin: "bottom center",
            }}
          >
            {LEFT_TOMBSTONE}
          </pre>

          {/* Center grave */}
          <pre className={`${preBase} ${preSize} text-center`}>
            {CENTER_TOMBSTONE}
          </pre>

          {/* Right grave — tilted */}
          <pre
            className={`${preBase} ${preSize} hidden sm:block text-center`}
            style={{
              transform: "rotate(4deg)",
              transformOrigin: "bottom center",
            }}
          >
            {RIGHT_TOMBSTONE}
          </pre>
        </div>

        {/* Ground */}
        <pre
          className={`font-mono ${preSize} leading-none whitespace-pre select-none text-text-muted/20 w-full text-center overflow-hidden`}
        >
          {GROUND}
        </pre>
      </div>

      {/* ── Fog ── */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: "35%",
          background:
            "linear-gradient(to top, rgba(128,128,128,0.05) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
