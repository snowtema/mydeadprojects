"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { ShareMenu } from "@/components/share-menu";

interface ItLivesCelebrationProps {
  projectName: string;
  projectUrl: string;
  pageUrl: string;
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

// Zombie hand — fingers + thumb + palm + arm
const HAND_LINES = [
  " |  |  |",
  " |  |  |  /",
  " |  |  | /",
  "  \\  | | /",
  "    ----",
  "     ||",
  "     ||",
];

// Ground crack progression (centered: 15+│+15 = 31)
const CRACK_STAGES = [
  "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓",
  "▓▓▓▓▓▓▓▓▓▓▓▓▓▓░╨░▓▓▓▓▓▓▓▓▓▓▓▓▓▓",
  "▓▓▓▓▓▓▓▓▓▓▓▓▓░ ╨ ░▓▓▓▓▓▓▓▓▓▓▓▓▓",
  "▓▓▓▓▓▓▓▓▓▓░░░     ░░░▓▓▓▓▓▓▓▓▓▓",
];

// Tombstone zigzag clip-paths — /\ crack pattern
const ZIGZAG_LEFT =
  "polygon(0 0, 53% 0, 47% 17%, 53% 33%, 47% 50%, 53% 67%, 47% 83%, 53% 100%, 0 100%)";
const ZIGZAG_RIGHT =
  "polygon(47% 0, 100% 0, 100% 100%, 47% 100%, 53% 83%, 47% 67%, 53% 50%, 47% 33%, 53% 17%)";

// Split intensity per crack stage
const SPLIT_GAP = [0, 1, 5, 18];
const SPLIT_TILT = [0, 0.3, 1.2, 4];

function padCenter(s: string, w: number) {
  if (s.length >= w) return s.slice(0, w);
  const left = Math.floor((w - s.length) / 2);
  return s.padStart(s.length + left).padEnd(w);
}

export function ItLivesCelebration({
  projectName,
  projectUrl,
  pageUrl,
}: ItLivesCelebrationProps) {
  const [phase, setPhase] = useState<"flash" | "grave" | "text">("flash");
  const [tombstoneIn, setTombstoneIn] = useState(false);
  const [crackStage, setCrackStage] = useState(0);
  const [hitFlash, setHitFlash] = useState(false);
  const [handRise, setHandRise] = useState(0);
  const [graveFading, setGraveFading] = useState(false);
  const [visibleLetters, setVisibleLetters] = useState(0);
  const [showActions, setShowActions] = useState(false);
  const [particles] = useState(generateParticles);
  const graveRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const animationDone = visibleLetters >= LETTERS.length;

  const displayName = useMemo(() => {
    const n =
      projectName.length <= 13
        ? projectName
        : projectName.slice(0, 11) + "..";
    return padCenter(n, 13);
  }, [projectName]);

  // Compact tombstone — 6 lines, perfectly centered ┬
  const tombstoneText = useMemo(
    () =>
      `  ┌───────────────────┐
  │                   │
  │   R . I . P .     │
  │   ${displayName}   │
  │                   │
  └─────────┬─────────┘`,
    [displayName]
  );

  const dirtParticles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 50,
        angle: -20 - Math.random() * 140,
        speed: 1 + Math.random() * 3,
        size: 2 + Math.random() * 4,
      })),
    []
  );

  const gap = SPLIT_GAP[crackStage];
  const tilt = SPLIT_TILT[crackStage];

  // Main animation timeline
  useEffect(() => {
    if (reducedMotion) {
      setPhase("text");
      setVisibleLetters(LETTERS.length);
      setShowActions(true);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    const t = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };
    let rafId: number;

    function shake(intensity: number) {
      if (!graveRef.current) return;
      const x = intensity;
      const r = intensity * 0.12;
      graveRef.current.animate(
        [
          { transform: "translate(0, 0) rotate(0)" },
          {
            transform: `translate(${-x}px, ${x * 0.3}px) rotate(${-r}deg)`,
          },
          {
            transform: `translate(${x * 1.2}px, ${-x * 0.25}px) rotate(${r}deg)`,
          },
          {
            transform: `translate(${-x * 0.7}px, ${x * 0.15}px) rotate(${-r * 0.6}deg)`,
          },
          {
            transform: `translate(${x * 0.35}px, 0) rotate(${r * 0.25}deg)`,
          },
          { transform: "translate(0, 0) rotate(0)" },
        ],
        { duration: 350 + intensity * 20, easing: "ease-out" }
      );
    }

    function hit(stage: number, intensity: number) {
      shake(intensity);
      setCrackStage(stage);
      setHitFlash(true);
      t(() => setHitFlash(false), 150);
    }

    t(() => setPhase("grave"), 400);
    t(() => setTombstoneIn(true), 700);

    // 3 hits with escalating force
    t(() => hit(1, 3), 1600);
    t(() => hit(2, 7), 2700);
    t(() => hit(3, 12), 3800);

    // Hand rises through the crack
    t(() => {
      const start = Date.now();
      const dur = 2400;
      function frame() {
        const p = Math.min((Date.now() - start) / dur, 1);
        setHandRise(1 - Math.pow(1 - p, 3));
        if (p < 1) rafId = requestAnimationFrame(frame);
      }
      rafId = requestAnimationFrame(frame);
    }, 4400);

    t(() => setGraveFading(true), 7200);
    t(() => setPhase("text"), 7700);

    return () => {
      timers.forEach(clearTimeout);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [reducedMotion]);

  // Letter-by-letter reveal
  useEffect(() => {
    if (phase !== "text" || reducedMotion) return;
    if (visibleLetters >= LETTERS.length) {
      const timer = setTimeout(() => setShowActions(true), 600);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setVisibleLetters((v) => v + 1), 120);
    return () => clearTimeout(timer);
  }, [phase, visibleLetters, reducedMotion]);

  function handleGoToProject() {
    window.location.href = pageUrl;
  }

  const preClasses =
    "absolute inset-0 font-mono text-[10px] sm:text-xs md:text-sm leading-tight text-text-muted/80 whitespace-pre select-none";

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          phase === "flash" ? "bg-green/20" : "bg-bg/95"
        }`}
      />

      {/* Initial flash */}
      {phase === "flash" && !reducedMotion && (
        <div className="absolute inset-0 bg-green/30 animate-[celebration-flash_0.4s_ease-out_forwards]" />
      )}

      {/* === GRAVE SCENE === */}
      {phase === "grave" && (
        <div
          ref={graveRef}
          className={`relative z-10 flex flex-col items-center transition-opacity duration-500 ${
            graveFading ? "opacity-0" : "opacity-100"
          }`}
        >
          {/* Tombstone — splits with zigzag /\ crack */}
          <div
            className="relative inline-block"
            style={{
              opacity: tombstoneIn ? 1 : 0,
              transform: tombstoneIn ? "none" : "translateY(12px)",
              transition: "opacity 0.7s, transform 0.7s",
            }}
          >
            {/* Invisible spacer to reserve dimensions */}
            <pre className="invisible font-mono text-[10px] sm:text-xs md:text-sm leading-tight whitespace-pre">
              {tombstoneText}
            </pre>

            {/* Crack glow behind the halves */}
            {crackStage >= 1 && (
              <div
                className="absolute left-1/2 top-0 h-full -translate-x-1/2 pointer-events-none"
                style={{
                  width: `${crackStage * 4}px`,
                  background: `rgba(90,154,90,${0.05 + crackStage * 0.05})`,
                  filter: `blur(${1 + crackStage * 2}px)`,
                }}
              />
            )}

            {/* Left half */}
            <pre
              className={preClasses}
              style={{
                clipPath: ZIGZAG_LEFT,
                transform: `rotate(${-tilt}deg) translateX(${-gap}px)`,
                transformOrigin: "50% 0%",
                transition: "transform 0.5s ease-out",
              }}
            >
              {tombstoneText}
            </pre>

            {/* Right half */}
            <pre
              className={preClasses}
              style={{
                clipPath: ZIGZAG_RIGHT,
                transform: `rotate(${tilt}deg) translateX(${gap}px)`,
                transformOrigin: "50% 0%",
                transition: "transform 0.5s ease-out",
              }}
            >
              {tombstoneText}
            </pre>
          </div>

          {/* Ground line + crack */}
          <div className="relative">
            <pre
              className={`font-mono text-[10px] sm:text-xs md:text-sm leading-tight whitespace-pre select-none transition-colors duration-200 ${
                crackStage >= 3
                  ? "text-green/40"
                  : crackStage > 0
                    ? "text-text-muted/50"
                    : "text-text-muted/30"
              }`}
            >
              {CRACK_STAGES[crackStage]}
            </pre>

            {/* Hit flash glow */}
            {hitFlash && (
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(90,154,90,0.7) 0%, transparent 70%)",
                  filter: "blur(4px)",
                }}
              />
            )}

            {/* Dirt debris */}
            {crackStage > 0 && (
              <div key={`dirt-${crackStage}`} className="absolute inset-0">
                {dirtParticles.slice(0, 4 + crackStage * 5).map((p) => (
                  <div
                    key={p.id}
                    className="absolute rounded-sm"
                    style={
                      {
                        left: `calc(50% + ${p.x}px)`,
                        top: "50%",
                        width: p.size * (0.4 + crackStage * 0.3),
                        height: p.size * (0.4 + crackStage * 0.3),
                        backgroundColor:
                          p.id % 3 === 0 ? "#5a4a2a" : "#3a3a2a",
                        animation: `celebration-burst ${0.6 + crackStage * 0.3}s ease-out ${p.id * 25}ms forwards`,
                        "--burst-x": `${Math.cos((p.angle * Math.PI) / 180) * p.speed * (6 + crackStage * 7)}px`,
                        "--burst-y": `${Math.sin((p.angle * Math.PI) / 180) * p.speed * (6 + crackStage * 7)}px`,
                        opacity: 0,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* Hand rising — taller container */}
          <div
            className="overflow-hidden"
            style={{
              height: handRise > 0 ? 130 : 0,
              transition: "height 0.3s ease-out",
            }}
          >
            <pre
              className="font-mono text-[10px] sm:text-xs md:text-sm leading-tight text-green whitespace-pre text-center select-none"
              style={{
                transform: `translateY(${(1 - handRise) * 100}%)`,
                textShadow:
                  handRise > 0.2
                    ? `0 0 12px rgba(90,154,90,${handRise * 0.6})`
                    : "none",
              }}
            >
              {HAND_LINES.join("\n")}
            </pre>
          </div>
        </div>
      )}

      {/* Transition flash */}
      {graveFading && phase === "grave" && (
        <div className="absolute inset-0 bg-green/15 animate-[celebration-flash_0.5s_ease-out_forwards]" />
      )}

      {/* Burst particles */}
      {!reducedMotion &&
        phase === "text" &&
        particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={
              {
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                animation: `celebration-burst 2s ease-out ${p.delay}ms forwards`,
                "--burst-x": `${Math.cos((p.angle * Math.PI) / 180) * p.speed * 60}px`,
                "--burst-y": `${Math.sin((p.angle * Math.PI) / 180) * p.speed * 60}px`,
                opacity: 0,
              } as React.CSSProperties
            }
          />
        ))}

      {/* === IT LIVES TEXT + ACTIONS === */}
      {phase === "text" && (
        <div className="relative z-10 text-center flex flex-col items-center gap-8">
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
            className={`text-sm text-text-muted transition-opacity duration-500 ${
              animationDone ? "opacity-100" : "opacity-0"
            }`}
          >
            {projectName} has risen from the dead
          </div>

          <div
            className={`flex flex-col items-center gap-5 transition-all duration-700 ${
              showActions
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6 pointer-events-none"
            }`}
          >
            <ShareMenu
              url={projectUrl}
              title={`${projectName} has been resurrected!`}
              text={`IT LIVES! ${projectName} was dead but has been resurrected. From grave to glory.`}
            />

            <button
              onClick={handleGoToProject}
              className="text-sm px-6 py-2.5 bg-green-dim border border-green/30 rounded-md text-green hover:border-green/50 transition-colors cursor-pointer"
            >
              View resurrected project &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
