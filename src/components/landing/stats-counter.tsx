"use client";

import { useEffect, useRef, useState } from "react";

interface StatProps {
  target: number;
  label: string;
}

function AnimatedStat({ target, label }: StatProps) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animatedRef.current) {
            animatedRef.current = true;
            const duration = 1500;
            const start = performance.now();

            function step(now: number) {
              const elapsed = now - start;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              setValue(Math.floor(eased * target));
              if (progress < 1) requestAnimationFrame(step);
            }

            requestAnimationFrame(step);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl font-bold text-text leading-none mb-1">
        {value.toLocaleString()}
      </div>
      <div className="text-[0.65rem] text-text-muted uppercase tracking-widest">
        {label}
      </div>
    </div>
  );
}

export function StatsCounter() {
  return (
    <div className="flex justify-center gap-12 py-12 border-y border-border flex-wrap">
      <AnimatedStat target={12847} label="projects buried" />
      <AnimatedStat target={3201} label="developers" />
      <AnimatedStat target={42} label="resurrected" />
    </div>
  );
}
