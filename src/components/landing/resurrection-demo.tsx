"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

// ── Demo projects (rotated on each replay) ───────────────────
const DEMO_PROJECTS = [
  { name: "focusflow",     dates: "2022 – 2023", epitaph: "Ironic, I know" },
  { name: "lynkr",         dates: "2023 – 2024", epitaph: "Like Linktree but worse" },
  { name: "midnight-mvp",  dates: "2023 – 2023", epitaph: "Built at 3am. Abandoned by sunrise" },
  { name: "shipfast",      dates: "2022 – 2023", epitaph: "The name was aspirational" },
  { name: "devfolio",      dates: "2021 – 2022", epitaph: "The cobbler's children have no shoes" },
  { name: "habit-streak",  dates: "2023 – 2024", epitaph: "Streak: 0 days" },
  { name: "notion-killer", dates: "2022 – 2023", epitaph: "Had 47 Jira tickets. Shipped 0" },
  { name: "ai-wrapper",    dates: "2024 – 2024", epitaph: "Just one more API call away" },
  { name: "budgetwise",    dates: "2021 – 2022", epitaph: "Couldn't budget the time to finish" },
  { name: "chattr",        dates: "2023 – 2024", epitaph: "Nobody was on the other end" },
];

const PLEDGE_TEXTS = [
  "I'll ship what you couldn't. Give me 30 days.",
  "This deserves a second chance. I have the skills.",
  "I've built worse things that actually launched. Let me try.",
  "Your loss is my opportunity. I'm finishing this.",
  "I already know how to fix the auth. Give it to me.",
  "30 days. No excuses. I'll make it live.",
  "I was building the same thing. Let me save us both.",
  "This is too good to stay dead. I'm resurrecting it.",
  "I see the vision. Let me bring it to life.",
  "The world needs this. Or at least my portfolio does.",
];

const CHAR_DELAY = 45;
const CHAR_JITTER = 25;

// ── ASCII art (self-contained, matching it-lives-celebration) ─
function padCenter(s: string, w: number) {
  if (s.length >= w) return s.slice(0, w);
  const left = Math.floor((w - s.length) / 2);
  return s.padStart(s.length + left).padEnd(w);
}

function makeTombstone(name: string) {
  const d = padCenter(name, 13);
  return `  ┌───────────────────┐
  │                   │
  │   R . I . P .     │
  │   ${d}   │
  │                   │
  └─────────┬─────────┘`;
}

const HAND_LINES = [
  "       |||  |",
  "    |  |||  /",
  "   |  ||| /",
  "   \\ |||/",
  "    ----",
  "    ||",
  "    ||",
];

const CRACK_STAGES = [
  "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓",
  "▓▓▓▓▓▓▓▓▓▓▓▓▓▓░╨░▓▓▓▓▓▓▓▓▓▓▓▓▓▓",
  "▓▓▓▓▓▓▓▓▓▓▓▓▓░ ╨ ░▓▓▓▓▓▓▓▓▓▓▓▓▓",
  "▓▓▓▓▓▓▓▓▓▓░░░     ░░░▓▓▓▓▓▓▓▓▓▓",
];

const ZIGZAG_LEFT =
  "polygon(0 0, 53% 0, 47% 17%, 53% 33%, 47% 50%, 53% 67%, 47% 83%, 53% 100%, 0 100%)";
const ZIGZAG_RIGHT =
  "polygon(47% 0, 100% 0, 100% 100%, 47% 100%, 53% 83%, 47% 67%, 53% 50%, 47% 33%, 53% 17%)";

const SPLIT_GAP = [0, 1, 5, 18];
const SPLIT_TILT = [0, 0.3, 1.2, 4];

const LETTERS = "IT LIVES!".split("");
const PARTICLE_COUNT = 30;

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
    x: 50 + (Math.random() - 0.5) * 30,
    y: 50 + (Math.random() - 0.5) * 30,
    angle: Math.random() * 360,
    speed: 1.5 + Math.random() * 3,
    size: 2 + Math.random() * 5,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 300,
  }));
}

// ── Component ─────────────────────────────────────────────────
type Step = 1 | 2 | 3;
type Phase3 = "crack" | "text";

export function ResurrectionDemo() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const graveRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // Rotation index — start at 0 for SSR, randomize after hydration
  const [demoIndex, setDemoIndex] = useState(0);
  useEffect(() => {
    setDemoIndex(Math.floor(Math.random() * DEMO_PROJECTS.length));
  }, []);
  const project = DEMO_PROJECTS[demoIndex % DEMO_PROJECTS.length];
  const pledgeText = PLEDGE_TEXTS[demoIndex % PLEDGE_TEXTS.length];
  const tombstoneText = useMemo(() => makeTombstone(project.name), [project.name]);

  // Step state
  const [step, setStep] = useState<Step>(1);

  // Step 2: auto-typing
  const [typedText, setTypedText] = useState("");
  const [typingDone, setTypingDone] = useState(false);

  // Step 3: crack animation
  const [phase3, setPhase3] = useState<Phase3>("crack");
  const [crackStage, setCrackStage] = useState(0);
  const [hitFlash, setHitFlash] = useState(false);
  const [handRise, setHandRise] = useState(0);
  const [graveFading, setGraveFading] = useState(false);
  const [visibleLetters, setVisibleLetters] = useState(0);
  const [showReplay, setShowReplay] = useState(false);
  const [particles] = useState(generateParticles);

  const dirtParticles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 40,
        angle: -20 - Math.random() * 140,
        speed: 1 + Math.random() * 2.5,
        size: 2 + Math.random() * 3,
      })),
    []
  );

  const gap = SPLIT_GAP[crackStage];
  const tilt = SPLIT_TILT[crackStage];
  const animationDone = visibleLetters >= LETTERS.length;

  // Observe visibility
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Step 2: auto-type pledge text
  useEffect(() => {
    if (step !== 2 || typingDone) return;
    if (reducedMotion) {
      setTypedText(pledgeText);
      setTypingDone(true);
      return;
    }

    let i = 0;
    let timer: ReturnType<typeof setTimeout>;

    function next() {
      if (i < pledgeText.length) {
        i++;
        setTypedText(pledgeText.slice(0, i));
        const delay = CHAR_DELAY + Math.random() * CHAR_JITTER * 2 - CHAR_JITTER;
        timer = setTimeout(next, delay);
      } else {
        setTimeout(() => setTypingDone(true), 300);
      }
    }

    // Small pause before typing starts
    timer = setTimeout(next, 400);
    return () => clearTimeout(timer);
  }, [step, typingDone, reducedMotion, pledgeText]);

  // Step 3: crack animation timeline
  useEffect(() => {
    if (step !== 3) return;

    if (reducedMotion) {
      setPhase3("text");
      setVisibleLetters(LETTERS.length);
      setShowReplay(true);
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
          { transform: `translate(${-x}px, ${x * 0.3}px) rotate(${-r}deg)` },
          { transform: `translate(${x * 1.2}px, ${-x * 0.25}px) rotate(${r}deg)` },
          { transform: `translate(${-x * 0.7}px, ${x * 0.15}px) rotate(${-r * 0.6}deg)` },
          { transform: `translate(${x * 0.35}px, 0) rotate(${r * 0.25}deg)` },
          { transform: "translate(0, 0) rotate(0)" },
        ],
        { duration: 300 + intensity * 15, easing: "ease-out" }
      );
    }

    function hit(stage: number, intensity: number) {
      shake(intensity);
      setCrackStage(stage);
      setHitFlash(true);
      t(() => setHitFlash(false), 120);
    }

    // Compressed timeline
    t(() => hit(1, 3), 600);
    t(() => hit(2, 7), 1400);
    t(() => hit(3, 12), 2200);

    // Hand rises
    t(() => {
      const start = Date.now();
      const dur = 1500;
      function frame() {
        const p = Math.min((Date.now() - start) / dur, 1);
        setHandRise(1 - Math.pow(1 - p, 3));
        if (p < 1) rafId = requestAnimationFrame(frame);
      }
      rafId = requestAnimationFrame(frame);
    }, 2800);

    // Transition to text
    t(() => setGraveFading(true), 4500);
    t(() => setPhase3("text"), 5000);

    return () => {
      timers.forEach(clearTimeout);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [step, reducedMotion]);

  // Letter-by-letter reveal
  useEffect(() => {
    if (step !== 3 || phase3 !== "text" || reducedMotion) return;
    if (visibleLetters >= LETTERS.length) {
      const timer = setTimeout(() => setShowReplay(true), 500);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setVisibleLetters((v) => v + 1), 100);
    return () => clearTimeout(timer);
  }, [step, phase3, visibleLetters, reducedMotion]);

  // Reset — advance to next project
  const reset = useCallback(() => {
    setDemoIndex((i) => i + 1);
    setStep(1);
    setTypedText("");
    setTypingDone(false);
    setPhase3("crack");
    setCrackStage(0);
    setHitFlash(false);
    setHandRise(0);
    setGraveFading(false);
    setVisibleLetters(0);
    setShowReplay(false);
  }, []);

  const preClasses =
    "absolute inset-0 font-mono text-[10px] sm:text-xs md:text-sm leading-tight text-text-muted/80 whitespace-pre select-none";

  return (
    <section ref={sectionRef} className="py-16">
      <div className="max-w-[720px] mx-auto px-6">
        <div className="text-[0.65rem] uppercase tracking-[0.15em] text-text-muted mb-10 pb-3 border-b border-border">
          // resurrection
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-8 mb-10">
          {[
            { n: 1, label: "Discover" },
            { n: 2, label: "Pledge" },
            { n: 3, label: "IT LIVES!" },
          ].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded-full border text-[0.6rem] flex items-center justify-center font-mono transition-all duration-500 ${
                  step >= n
                    ? "border-green/60 text-green bg-green-dim"
                    : "border-border text-text-muted"
                }`}
              >
                {n}
              </div>
              <span
                className={`text-[0.7rem] tracking-wide transition-colors duration-500 ${
                  step >= n ? "text-text-dim" : "text-text-muted"
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Stage */}
        <div
          className="relative bg-bg-card border border-border rounded-lg overflow-hidden"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "none" : "translateY(20px)",
            transition: reducedMotion ? "none" : "all 0.6s ease",
            minHeight: 340,
          }}
        >
          {/* ═══ STEP 1: Discover ═══ */}
          {step === 1 && (
            <div
              className="flex flex-col items-center justify-center py-10 px-6"
              style={{
                animation: reducedMotion ? "none" : "fade-in 0.4s ease both",
              }}
            >
              {/* Seeking badge */}
              <div className="flex items-center gap-2 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-cta resurrection-pulse" />
                <span className="text-[0.65rem] uppercase tracking-[0.15em] text-cta/80">
                  Seeking Necromancer
                </span>
              </div>

              {/* Tombstone card */}
              <div className="tombstone-card tombstone-seeking p-6 rounded-t-md text-center w-52 mb-1">
                <div className="tombstone-cross text-lg text-text-muted mb-2">
                  &#10013;
                </div>
                <div className="text-[0.75rem] font-medium text-text-dim mb-0.5">
                  {project.name}
                </div>
                <div className="text-[0.6rem] text-text-muted font-light">
                  {project.dates}
                </div>
                <div className="text-xs font-serif text-text-dim italic mt-2 leading-relaxed">
                  &ldquo;{project.epitaph}&rdquo;
                </div>
              </div>
              <div className="tombstone-base w-[calc(13rem*0.8)] h-1.5 bg-bg border border-border border-t-0 rounded-b mb-8" />

              <p className="text-xs text-text-muted font-light mb-5">
                This project is open for resurrection. Someone could bring it back.
              </p>

              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-green/30 rounded-md bg-green-dim text-green text-sm hover:border-green/50 hover:shadow-[0_0_20px_rgba(90,154,90,0.1)] transition-all duration-300 cursor-pointer active:scale-[0.97]"
              >
                I&apos;ll bring it back
              </button>
            </div>
          )}

          {/* ═══ STEP 2: Pledge ═══ */}
          {step === 2 && (
            <div
              className="flex flex-col items-center justify-center py-10 px-6"
              style={{
                animation: reducedMotion ? "none" : "fade-in 0.4s ease both",
              }}
            >
              {/* Mini tombstone */}
              <div className="tombstone-card tombstone-adopted p-4 rounded-t-md text-center w-40 mb-1 scale-90 opacity-70">
                <div className="tombstone-cross text-base text-text-muted mb-1">
                  &#10013;
                </div>
                <div className="text-[0.65rem] font-medium text-text-dim">
                  {project.name}
                </div>
              </div>
              <div className="tombstone-base w-[calc(10rem*0.72)] h-1 bg-bg border border-border border-t-0 rounded-b mb-6 opacity-70" />

              {/* Pledge form */}
              <div className="w-full max-w-sm">
                <label className="block text-[0.65rem] uppercase tracking-[0.15em] text-text-muted mb-2">
                  Your pledge
                </label>
                <div className="relative bg-bg border border-border rounded-md p-3 min-h-[60px]">
                  <span className="text-sm text-text-dim font-light leading-relaxed">
                    {typedText}
                  </span>
                  {!typingDone && (
                    <span className="text-text animate-[cursor-blink_1s_step-end_infinite]">
                      {"\u2588"}
                    </span>
                  )}
                </div>

                {/* Character count */}
                <div className="flex justify-end mt-1.5">
                  <span className="text-[0.6rem] text-text-muted tabular-nums">
                    {typedText.length}/140
                  </span>
                </div>

                {/* Submit button */}
                <div
                  className="mt-4 text-center"
                  style={{
                    opacity: typingDone ? 1 : 0,
                    transform: typingDone ? "none" : "translateY(8px)",
                    transition: reducedMotion ? "none" : "all 0.4s ease",
                  }}
                >
                  <button
                    onClick={() => setStep(3)}
                    disabled={!typingDone}
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-green/30 rounded-md bg-green-dim text-green text-sm hover:border-green/50 hover:shadow-[0_0_20px_rgba(90,154,90,0.1)] transition-all duration-300 cursor-pointer active:scale-[0.97] disabled:opacity-40 disabled:cursor-default"
                  >
                    Submit Pledge
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══ STEP 3: IT LIVES! ═══ */}
          {step === 3 && (
            <div className="relative flex items-center justify-center py-10 px-6" style={{ minHeight: 320 }}>
              {/* Crack scene */}
              {phase3 === "crack" && (
                <div
                  ref={graveRef}
                  className={`relative z-10 flex flex-col items-center transition-opacity duration-500 ${
                    graveFading ? "opacity-0" : "opacity-100"
                  }`}
                  style={{
                    animation: reducedMotion ? "none" : "fade-in 0.3s ease both",
                  }}
                >
                  {/* Tombstone — zigzag split */}
                  <div className="relative inline-block">
                    <pre className="invisible font-mono text-[10px] sm:text-xs md:text-sm leading-tight whitespace-pre">
                      {tombstoneText}
                    </pre>

                    {/* Crack glow */}
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
                          background: "radial-gradient(circle, rgba(90,154,90,0.7) 0%, transparent 70%)",
                          filter: "blur(4px)",
                        }}
                      />
                    )}

                    {/* Dirt debris */}
                    {crackStage > 0 && (
                      <div key={`dirt-${crackStage}`} className="absolute inset-0">
                        {dirtParticles.slice(0, 3 + crackStage * 4).map((p) => (
                          <div
                            key={p.id}
                            className="absolute rounded-sm"
                            style={
                              {
                                left: `calc(50% + ${p.x}px)`,
                                top: "50%",
                                width: p.size * (0.4 + crackStage * 0.3),
                                height: p.size * (0.4 + crackStage * 0.3),
                                backgroundColor: p.id % 3 === 0 ? "#5a4a2a" : "#3a3a2a",
                                animation: `celebration-burst ${0.5 + crackStage * 0.25}s ease-out ${p.id * 20}ms forwards`,
                                "--burst-x": `${Math.cos((p.angle * Math.PI) / 180) * p.speed * (5 + crackStage * 6)}px`,
                                "--burst-y": `${Math.sin((p.angle * Math.PI) / 180) * p.speed * (5 + crackStage * 6)}px`,
                                opacity: 0,
                              } as React.CSSProperties
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Hand rising */}
                  <div
                    className="overflow-hidden"
                    style={{
                      height: handRise > 0 ? 110 : 0,
                      transition: "height 0.3s ease-out",
                    }}
                  >
                    <pre
                      className="font-mono text-[10px] sm:text-xs md:text-sm leading-tight text-green whitespace-pre text-center select-none"
                      style={{
                        transform: `translateY(${(1 - handRise) * 100}%)`,
                        textShadow:
                          handRise > 0.2
                            ? `0 0 10px rgba(90,154,90,${handRise * 0.5})`
                            : "none",
                      }}
                    >
                      {HAND_LINES.join("\n")}
                    </pre>
                  </div>
                </div>
              )}

              {/* Transition flash */}
              {graveFading && phase3 === "crack" && (
                <div className="absolute inset-0 bg-green/10 animate-[celebration-flash_0.5s_ease-out_forwards] rounded-lg" />
              )}

              {/* Burst particles */}
              {!reducedMotion &&
                phase3 === "text" &&
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
                        animation: `celebration-burst 1.5s ease-out ${p.delay}ms forwards`,
                        "--burst-x": `${Math.cos((p.angle * Math.PI) / 180) * p.speed * 40}px`,
                        "--burst-y": `${Math.sin((p.angle * Math.PI) / 180) * p.speed * 40}px`,
                        opacity: 0,
                      } as React.CSSProperties
                    }
                  />
                ))}

              {/* IT LIVES text */}
              {phase3 === "text" && (
                <div className="relative z-10 text-center flex flex-col items-center gap-5">
                  <div className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-widest">
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
                              ? `0 0 30px ${letter === "!" ? "rgba(196,160,124,0.4)" : "rgba(90,154,90,0.4)"}`
                              : "none",
                        }}
                      >
                        {letter === " " ? "\u00A0" : letter}
                      </span>
                    ))}
                  </div>

                  <div
                    className={`text-xs text-text-muted font-light transition-opacity duration-500 ${
                      animationDone ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {project.name} has risen from the dead
                  </div>

                  {/* Actions */}
                  <div
                    className={`flex items-center gap-4 transition-all duration-500 ${
                      showReplay
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4 pointer-events-none"
                    }`}
                  >
                    <button
                      onClick={reset}
                      className="text-xs text-text-muted hover:text-text-dim transition-colors cursor-pointer"
                    >
                      Try again
                    </button>
                    <span className="text-border">·</span>
                    <a
                      href="/explore"
                      className="text-xs text-text-muted hover:text-text-dim transition-colors"
                    >
                      Explore projects &rarr;
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section description */}
        <p className="text-center text-xs text-text-muted font-light mt-6">
          Dead projects can find new life. Open yours for resurrection and let someone pick up where you left off.
        </p>
      </div>
    </section>
  );
}
