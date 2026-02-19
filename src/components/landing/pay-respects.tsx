"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface PayRespectsProject {
  name: string;
  slug: string;
  startDate: string;
  endDate: string;
  epitaph: string;
  flowersCount: number;
  username: string;
}

interface PayRespectsProps {
  projects: PayRespectsProject[];
}

export function PayRespects({ projects }: PayRespectsProps) {
  const reducedMotion = useReducedMotion();
  const [selected, setSelected] = useState<number | null>(null);
  const [pressed, setPressed] = useState(false);
  const [floats, setFloats] = useState<{ id: number; x: number; delay: number }[]>([]);
  const floatIdRef = useRef(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // Observe visibility
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const doPress = useCallback(() => {
    if (selected === null || pressed) return;
    setPressed(true);

    if (!reducedMotion) {
      // Spawn floating F particles
      const newFloats = Array.from({ length: 7 }, (_, i) => ({
        id: floatIdRef.current++,
        x: Math.random() * 60 - 30,
        delay: i * 80,
      }));
      setFloats(newFloats);
      setTimeout(() => setFloats([]), 1800);
    }
  }, [selected, pressed, reducedMotion]);

  // Listen for F keypress
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === "KeyF" && selected !== null && !pressed) {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag === "input" || tag === "textarea" || tag === "select") return;
        e.preventDefault();
        doPress();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected, pressed, doPress]);

  const reset = useCallback(() => {
    setSelected(null);
    setPressed(false);
    setFloats([]);
  }, []);

  if (projects.length === 0) return null;

  const step = pressed ? 3 : selected !== null ? 2 : 1;

  return (
    <section ref={sectionRef} className="py-16">
      <div className="max-w-[720px] mx-auto px-6">
        <div className="text-[0.65rem] uppercase tracking-[0.15em] text-text-muted mb-10 pb-3 border-b border-border">
          // the ritual
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-8 mb-12">
          {[
            { n: 1, label: "Find a grave" },
            { n: 2, label: "Press F" },
            { n: 3, label: "Respect paid" },
          ].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded-full border text-[0.6rem] flex items-center justify-center font-mono transition-all duration-500 ${
                  step >= n
                    ? "border-accent text-accent bg-accent/10"
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

        {/* Tombstone cards */}
        <div className="flex justify-center gap-6 flex-wrap mb-10">
          {projects.map((p, i) => {
            const isSelected = selected === i;
            const isFaded = selected !== null && !isSelected;

            return (
              <button
                key={p.slug}
                onClick={() => { if (!pressed) setSelected(i); }}
                disabled={pressed && !isSelected}
                className="w-44 text-left group cursor-pointer disabled:cursor-default"
                style={{
                  opacity: inView ? (isFaded ? 0.3 : 1) : 0,
                  transform: inView
                    ? isFaded ? "scale(0.95)" : "scale(1)"
                    : "translateY(20px)",
                  transition: reducedMotion
                    ? "none"
                    : `all 0.4s ease ${i * 100}ms`,
                }}
              >
                <div
                  className={`tombstone-card p-5 border rounded-t-md text-center transition-all duration-300 ${
                    isSelected
                      ? "border-accent/50 shadow-[0_0_24px_rgba(155,126,126,0.12)]"
                      : "border-border group-hover:border-border-hover"
                  }`}
                >
                  <div className="tombstone-cross text-lg text-text-muted mb-2">
                    &#10013;
                  </div>
                  <div className="text-[0.7rem] font-medium text-text-dim mb-0.5">
                    {p.name}
                  </div>
                  <div className="text-[0.55rem] text-text-muted font-light">
                    {p.startDate.slice(0, 4)} &ndash; {p.endDate.slice(0, 4)}
                  </div>
                  <div className="text-xs font-serif text-text-dim italic mt-2 leading-relaxed">
                    &ldquo;{p.epitaph}&rdquo;
                  </div>

                  {/* Flower counter */}
                  <div className="mt-3 relative inline-flex items-center gap-1">
                    <kbd
                      className={`inline-flex items-center justify-center w-4 h-4 glass-kbd border border-b-2 rounded text-[0.55rem] font-mono transition-all duration-300 ${
                        isSelected && pressed
                          ? "border-accent/40 text-accent bg-accent/10"
                          : "border-border-hover text-text-dim"
                      }`}
                    >
                      F
                    </kbd>
                    <span
                      className={`text-[0.7rem] tabular-nums transition-colors duration-300 ${
                        isSelected && pressed ? "text-accent" : "text-accent/60"
                      }`}
                    >
                      {isSelected && pressed ? p.flowersCount + 1 : p.flowersCount}
                    </span>

                    {/* Float-up particles */}
                    {isSelected &&
                      floats.map((f) => (
                        <span
                          key={f.id}
                          className="absolute pointer-events-none text-[0.55rem] font-mono font-bold text-accent"
                          style={{
                            left: `calc(50% + ${f.x}px)`,
                            top: 0,
                            animation: `ritual-float 1.2s ease ${f.delay}ms forwards`,
                          }}
                        >
                          F
                        </span>
                      ))}
                  </div>
                </div>
                <div
                  className={`tombstone-base mx-[10%] h-1.5 bg-bg border border-t-0 rounded-b transition-colors duration-300 ${
                    isSelected ? "border-accent/30" : "border-border"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Action area */}
        <div className="text-center min-h-[80px] flex flex-col items-center justify-center">
          {step === 1 && (
            <p
              className="text-sm text-text-muted font-light"
              style={{
                animation: reducedMotion ? "none" : "fade-in 0.4s ease both",
              }}
            >
              Choose a project to pay your respects.
            </p>
          )}

          {step === 2 && (
            <div
              style={{
                animation: reducedMotion ? "none" : "fade-in 0.3s ease both",
              }}
            >
              <button
                onClick={doPress}
                className="group inline-flex items-center gap-3 px-6 py-3 border border-border rounded-md bg-bg-card hover:border-accent/40 hover:shadow-[0_0_20px_rgba(155,126,126,0.08)] transition-all duration-300 cursor-pointer"
              >
                <kbd className="inline-flex items-center justify-center w-8 h-8 glass-kbd border border-border-hover border-b-[3px] rounded text-sm font-mono text-text-dim group-hover:border-accent/40 group-hover:text-accent transition-all duration-300 animate-[cursor-blink_2s_ease-in-out_infinite]">
                  F
                </kbd>
                <span className="text-sm text-text-muted group-hover:text-text-dim transition-colors">
                  Press <span className="font-medium text-text-dim">F</span> to pay respects
                </span>
              </button>
            </div>
          )}

          {step === 3 && (
            <div
              className="space-y-4"
              style={{
                animation: reducedMotion ? "none" : "fade-in 0.5s ease 0.3s both",
              }}
            >
              <p className="text-sm text-accent font-light tracking-wide">
                Respect paid. They won&apos;t be forgotten.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link
                  href={`/${projects[selected!].username}/${projects[selected!].slug}`}
                  className="text-xs text-text-muted hover:text-text-dim transition-colors"
                >
                  Visit grave &rarr;
                </Link>
                <span className="text-border">·</span>
                <button
                  onClick={reset}
                  className="text-xs text-text-muted hover:text-text-dim transition-colors cursor-pointer"
                >
                  Pay more respects
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
