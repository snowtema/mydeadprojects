"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { type Project } from "@/lib/db/schema";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  formatDate,
  formatDateRange,
  dateToDecimalYear,
  timeSinceDeath,
} from "@/lib/utils";
import { ResurrectionBadge } from "@/components/resurrection-badge";

interface GraveyardTimelineProps {
  projects: Project[];
  username: string;
}

const MIN_SPAN = 3;
const EDGE_PAD = 0.06;
const TRACK_HEIGHT = 200;
const AXIS_Y = 100;

export function GraveyardTimeline({
  projects,
  username,
}: GraveyardTimelineProps) {
  const reducedMotion = useReducedMotion();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const dotRefs = useRef<Map<string, HTMLElement>>(new Map());
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateTooltipPos = useCallback(
    (id: string) => {
      const el = dotRefs.current.get(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTooltipPos({
          x: rect.left + rect.width / 2,
          y: rect.top - 8,
        });
      }
    },
    []
  );

  const showTooltip = useCallback(
    (id: string) => {
      setHoveredId(id);
      updateTooltipPos(id);
    },
    [updateTooltipPos]
  );

  const hideTooltip = useCallback(() => {
    setHoveredId(null);
    setTooltipPos(null);
  }, []);

  // Update tooltip position on scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !hoveredId) return;
    const onScroll = () => updateTooltipPos(hoveredId);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [hoveredId, updateTooltipPos]);

  if (projects.length === 0) return null;

  // --- Date math ---
  const decimalYears = projects.map((p) => dateToDecimalYear(p.endDate));
  const rawMin = Math.min(...decimalYears);
  const rawMax = Math.max(...decimalYears);
  const span = Math.max(rawMax - rawMin, MIN_SPAN);
  const center = (rawMin + rawMax) / 2;
  const domainMin = center - span / 2;
  const domainMax = center + span / 2;

  function toPercent(decimal: number): number {
    const ratio = (decimal - domainMin) / (domainMax - domainMin);
    return (EDGE_PAD + ratio * (1 - EDGE_PAD * 2)) * 100;
  }

  // --- Year ticks ---
  const firstYear = Math.ceil(domainMin);
  const lastYear = Math.floor(domainMax);
  const yearTicks: number[] = [];
  for (let y = firstYear; y <= lastYear; y++) yearTicks.push(y);

  // --- Compute start dates too (for duration display on hover) ---
  const startDecimalYears = projects.map((p) =>
    dateToDecimalYear(p.startDate)
  );

  // --- Sort by death date ---
  const sorted = [...projects]
    .map((p, i) => ({
      p,
      decimal: decimalYears[i],
      startDecimal: startDecimalYears[i],
    }))
    .sort((a, b) => a.decimal - b.decimal);

  const hoveredProject = hoveredId
    ? projects.find((p) => p.id === hoveredId)
    : null;

  return (
    <div
      ref={scrollRef}
      className="w-full overflow-x-auto overscroll-x-contain pb-4"
      style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
    >
      <div
        className="relative min-w-[600px] mx-4"
        style={{ height: TRACK_HEIGHT }}
      >
        {/* Axis line */}
        <div
          className="absolute left-0 right-0 h-px bg-border"
          style={{ top: AXIS_Y }}
        />

        {/* Duration line on hover */}
        {hoveredId &&
          (() => {
            const item = sorted.find(({ p }) => p.id === hoveredId);
            if (!item) return null;
            const startLeft = toPercent(item.startDecimal);
            const endLeft = toPercent(item.decimal);
            const lineLeft = Math.min(startLeft, endLeft);
            const lineWidth = Math.abs(endLeft - startLeft);

            return (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  animation: reducedMotion
                    ? "none"
                    : "timeline-duration-in 0.3s ease both",
                }}
              >
                {/* Dashed duration line */}
                <div
                  className="absolute h-px"
                  style={{
                    top: AXIS_Y,
                    left: `${lineLeft}%`,
                    width: `${lineWidth}%`,
                    backgroundImage:
                      "repeating-linear-gradient(90deg, var(--color-accent) 0, var(--color-accent) 4px, transparent 4px, transparent 8px)",
                    opacity: 0.6,
                  }}
                />

                {/* Glow line underneath */}
                <div
                  className="absolute h-px blur-[2px]"
                  style={{
                    top: AXIS_Y,
                    left: `${lineLeft}%`,
                    width: `${lineWidth}%`,
                    backgroundColor: "var(--color-accent)",
                    opacity: 0.15,
                  }}
                />

                {/* Birth flag at startDate */}
                <div
                  className="absolute"
                  style={{
                    left: `${startLeft}%`,
                    top: AXIS_Y - 24,
                  }}
                >
                  {/* Pole (from flag down to axis) */}
                  <div
                    className="absolute w-px bg-accent/40"
                    style={{ left: 0, top: 0, height: 24 }}
                  />
                  {/* Flag pennant (top of pole, pointing right) */}
                  <div
                    className="absolute bg-accent/60"
                    style={{
                      left: 1,
                      top: 0,
                      width: 10,
                      height: 8,
                      clipPath:
                        "polygon(0 0, 100% 0, 65% 50%, 100% 100%, 0 100%)",
                      filter:
                        "drop-shadow(0 0 4px rgba(155,126,126,0.3))",
                    }}
                  />
                  {/* Birth date label */}
                  <span
                    className="absolute text-[8px] font-mono text-accent/50 whitespace-nowrap"
                    style={{ left: 10, top: -1 }}
                  >
                    {formatDate(item.p.startDate)}
                  </span>
                </div>
              </div>
            );
          })()}

        {/* Year tick marks */}
        {yearTicks.map((year) => (
          <div
            key={year}
            className="absolute flex flex-col items-center -translate-x-1/2"
            style={{ left: `${toPercent(year)}%`, top: AXIS_Y - 4 }}
          >
            <div className="w-px h-2 bg-border-hover" />
            <span className="text-[10px] font-mono text-text-muted mt-1 select-none">
              {year}
            </span>
          </div>
        ))}

        {/* Project dots */}
        {sorted.map(({ p, decimal }, idx) => {
          const left = toPercent(decimal);
          const isAbove = idx % 2 === 0;
          const isHovered = hoveredId === p.id;
          const isFaded = hoveredId !== null && !isHovered;

          return (
            <div
              key={p.id}
              className="absolute -translate-x-1/2"
              style={{
                left: `${left}%`,
                top: 0,
                height: "100%",
                opacity: isFaded ? 0.25 : 1,
                transition: reducedMotion ? "none" : "opacity 0.2s ease",
              }}
              onMouseEnter={() => showTooltip(p.id)}
              onMouseLeave={hideTooltip}
            >
              {/* Dot on the axis */}
              <Link
                href={`/${username}/${p.slug}`}
                ref={(el) => {
                  if (el) {
                    dotRefs.current.set(p.id, el);
                  } else {
                    dotRefs.current.delete(p.id);
                  }
                }}
                className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border ${
                  reducedMotion ? "" : "transition-all duration-200"
                } ${
                  isHovered
                    ? `bg-accent border-accent ${reducedMotion ? "" : "scale-150"} z-10`
                    : p.openForResurrection && p.status === "dead"
                      ? `bg-green border-green/50 resurrection-pulse ${reducedMotion ? "" : "hover:border-green hover:scale-125"}`
                      : `bg-bg-card border-border ${reducedMotion ? "" : "hover:border-accent hover:scale-125"}`
                }`}
                style={{ top: AXIS_Y }}
              />

              {/* Label */}
              <div
                className="absolute left-1/2 -translate-x-1/2 flex items-center w-24"
                style={
                  isAbove
                    ? {
                        bottom: TRACK_HEIGHT - AXIS_Y + 10,
                        flexDirection: "column",
                      }
                    : { top: AXIS_Y + 10, flexDirection: "column-reverse" }
                }
              >
                <span className="text-[10px] font-mono text-text-muted whitespace-nowrap max-w-[96px] truncate text-center leading-tight">
                  {p.name}
                </span>
                <span className="text-[9px] text-text-muted/50 font-mono whitespace-nowrap">
                  {formatDate(p.endDate)}
                </span>
                <div className="w-px h-3 bg-border" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Hint */}
      <p className="text-[10px] text-text-muted/40 font-mono mt-3 text-center select-none">
        scroll to explore &rarr;
      </p>

      {/* Tooltip portal */}
      {mounted &&
        hoveredProject &&
        tooltipPos &&
        createPortal(
          <div
            className="fixed z-[9990] w-56 p-3 bg-bg-card border border-border-hover rounded-md pointer-events-none"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y,
              transform: "translate(-50%, -100%)",
              boxShadow: "0 8px 32px rgba(0,0,0,var(--tooltip-shadow-opacity, 0.6))",
            }}
          >
            <div className="text-xs font-mono text-text-dim mb-1 truncate">
              {hoveredProject.name}
            </div>
            <div className="text-[10px] text-text-muted mb-2 font-mono">
              {formatDateRange(
                hoveredProject.startDate,
                hoveredProject.endDate
              )}
              <span className="ml-2 text-accent">
                dead for {timeSinceDeath(hoveredProject.endDate)}
              </span>
            </div>
            {hoveredProject.epitaph && (
              <div className="text-xs font-serif italic text-text-dim leading-snug mb-2">
                &ldquo;{hoveredProject.epitaph}&rdquo;
              </div>
            )}
            <ResurrectionBadge
              status={hoveredProject.status}
              openForResurrection={hoveredProject.openForResurrection}
            />
            <div className="flex items-center justify-between mt-1">
              {hoveredProject.causeOfDeath && (
                <span className="text-[10px] text-text-muted border border-border rounded px-1.5 py-0.5 truncate max-w-[60%]">
                  {hoveredProject.causeOfDeath}
                </span>
              )}
              <span className="text-[10px] text-accent ml-auto flex items-center gap-1">
                <kbd className="inline-flex items-center justify-center w-3.5 h-3.5 glass-kbd border border-border-hover border-b-2 rounded text-[0.5rem] text-text-dim font-mono">
                  F
                </kbd>
                {hoveredProject.flowersCount}
              </span>
            </div>
            {/* Arrow */}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-bg-card border-r border-b border-border-hover rotate-45"
              style={{ bottom: "-4px" }}
            />
          </div>,
          document.body
        )}
    </div>
  );
}
