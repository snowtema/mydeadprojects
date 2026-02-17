"use client";

import { useRef, useState, useCallback } from "react";
import {
  TransformWrapper,
  TransformComponent,
  type ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import { type Project } from "@/lib/db/schema";
import { TombstoneCard } from "./tombstone-card";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";

// Canvas dimensions (virtual space)
const CANVAS_W = 2400;
const CANVAS_H = 1600;

// Tombstone dimensions for collision/placement
const TOMB_W = 200;
const TOMB_H = 240;

interface GraveyardCanvasProps {
  projects: Project[];
  username: string;
  showEdit?: boolean;
  onPlace?: (projectId: string, x: number, y: number) => void;
  placingProjectId?: string | null;
}

export function GraveyardCanvas({
  projects,
  username,
  showEdit,
  onPlace,
  placingProjectId,
}: GraveyardCanvasProps) {
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(
    null
  );

  // Check AABB collision with existing placed tombstones
  const checkCollision = useCallback(
    (x: number, y: number): boolean => {
      for (const p of projects) {
        if (p.positionX == null || p.positionY == null) continue;
        if (p.id === placingProjectId) continue;
        const ax = x,
          ay = y;
        const bx = p.positionX * CANVAS_W,
          by = p.positionY * CANVAS_H;
        if (
          ax < bx + TOMB_W &&
          ax + TOMB_W > bx &&
          ay < by + TOMB_H &&
          ay + TOMB_H > by
        ) {
          return true;
        }
      }
      return false;
    },
    [projects, placingProjectId]
  );

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      const wrapper = transformRef.current;
      if (!canvas || !wrapper) return null;

      const state = wrapper.instance.transformState;
      const rect = canvas.getBoundingClientRect();

      const x = (clientX - rect.left - state.positionX) / state.scale;
      const y = (clientY - rect.top - state.positionY) / state.scale;

      // Clamp to canvas bounds (with tombstone size margin)
      return {
        x: Math.max(0, Math.min(x - TOMB_W / 2, CANVAS_W - TOMB_W)),
        y: Math.max(0, Math.min(y - TOMB_H / 2, CANVAS_H - TOMB_H)),
      };
    },
    []
  );

  // Snap to a soft grid (20px) for aesthetic alignment
  const snap = (v: number) => Math.round(v / 20) * 20;

  const handleCanvasMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!placingProjectId) return;

      const clientX =
        "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY =
        "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

      const pos = screenToCanvas(clientX, clientY);
      if (pos) {
        setGhostPos({ x: snap(pos.x), y: snap(pos.y) });
      }
    },
    [placingProjectId, screenToCanvas]
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (!placingProjectId || !onPlace) return;

      const pos = screenToCanvas(e.clientX, e.clientY);
      if (!pos) return;

      const x = snap(pos.x);
      const y = snap(pos.y);

      if (checkCollision(x, y)) return;

      // Normalize to 0..1
      onPlace(placingProjectId, x / CANVAS_W, y / CANVAS_H);
      setGhostPos(null);
    },
    [placingProjectId, onPlace, screenToCanvas, checkCollision]
  );

  // Auto-assign positions for projects without coordinates
  const getAutoPosition = (index: number, total: number) => {
    const cols = Math.ceil(Math.sqrt(total));
    const row = Math.floor(index / cols);
    const col = index % cols;
    const spacingX = CANVAS_W / (cols + 1);
    const spacingY = CANVAS_H / (Math.ceil(total / cols) + 1);
    return {
      x: spacingX * (col + 1) - TOMB_W / 2,
      y: spacingY * (row + 1) - TOMB_H / 2,
    };
  };

  const hasCollision =
    ghostPos != null && checkCollision(ghostPos.x, ghostPos.y);

  return (
    <div className="relative w-full rounded-lg border border-border overflow-hidden bg-bg-subtle">
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1">
        <button
          onClick={() => transformRef.current?.zoomIn(0.3)}
          className="p-1.5 bg-bg-card/80 backdrop-blur border border-border rounded text-text-muted hover:text-text-dim hover:border-border-hover transition-colors"
          aria-label="Zoom in"
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={() => transformRef.current?.zoomOut(0.3)}
          className="p-1.5 bg-bg-card/80 backdrop-blur border border-border rounded text-text-muted hover:text-text-dim hover:border-border-hover transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut size={14} />
        </button>
        <button
          onClick={() => transformRef.current?.resetTransform()}
          className="p-1.5 bg-bg-card/80 backdrop-blur border border-border rounded text-text-muted hover:text-text-dim hover:border-border-hover transition-colors"
          aria-label="Reset view"
        >
          <Maximize size={14} />
        </button>
      </div>

      {/* Placement hint */}
      {placingProjectId && (
        <div className="absolute top-3 left-3 z-20 text-xs text-cta bg-bg-card/90 backdrop-blur border border-border rounded px-3 py-1.5">
          Click to place your tombstone
        </div>
      )}

      <TransformWrapper
        ref={transformRef}
        initialScale={0.5}
        minScale={0.2}
        maxScale={1.5}
        centerOnInit
        limitToBounds={false}
        panning={{ disabled: !!placingProjectId }}
        doubleClick={{ disabled: true }}
      >
        <TransformComponent
          wrapperStyle={{
            width: "100%",
            height: "70vh",
            cursor: placingProjectId ? "crosshair" : "grab",
          }}
          contentStyle={{
            width: CANVAS_W,
            height: CANVAS_H,
          }}
        >
          <div
            ref={canvasRef}
            className="graveyard-ground relative"
            style={{ width: CANVAS_W, height: CANVAS_H }}
            onMouseMove={handleCanvasMove}
            onTouchMove={handleCanvasMove}
            onClick={handleCanvasClick}
          >
            {/* Ground decorations */}
            <GroundDecorations />

            {/* Placed tombstones */}
            {projects.map((project, index) => {
              const hasPos =
                project.positionX != null && project.positionY != null;
              const pos = hasPos
                ? {
                    x: project.positionX! * CANVAS_W,
                    y: project.positionY! * CANVAS_H,
                  }
                : getAutoPosition(
                    index,
                    projects.length
                  );

              return (
                <div
                  key={project.id}
                  className="absolute transition-opacity duration-300"
                  style={{
                    left: pos.x,
                    top: pos.y,
                    width: TOMB_W,
                    opacity: project.id === placingProjectId ? 0.3 : 1,
                  }}
                >
                  <TombstoneCard
                    project={project}
                    username={username}
                    showEdit={showEdit}
                  />
                </div>
              );
            })}

            {/* Ghost preview during placement */}
            {ghostPos && placingProjectId && (
              <div
                className="absolute pointer-events-none transition-all duration-75"
                style={{
                  left: ghostPos.x,
                  top: ghostPos.y,
                  width: TOMB_W,
                  opacity: 0.6,
                }}
              >
                <div
                  className={`tombstone-card block p-6 border rounded-t-md text-center ${
                    hasCollision
                      ? "border-red/50 shadow-[0_0_20px_rgba(138,58,58,0.3)]"
                      : "border-cta/50 shadow-[0_0_20px_rgba(196,160,124,0.2)]"
                  }`}
                >
                  <div className="tombstone-cross text-text-muted text-lg mb-3">
                    &#10013;
                  </div>
                  <div className="text-xs text-text-muted">
                    {hasCollision ? "Too close!" : "Place here"}
                  </div>
                </div>
                <div className="tombstone-base mx-[10%] h-2 bg-bg border border-border border-t-0 rounded-b" />
              </div>
            )}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}

/** Ambient decorations on the ground — fences, crosses, fog */
function GroundDecorations() {
  return (
    <>
      {/* Ground gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(20,20,20,0) 30%, rgba(10,10,10,0.8) 100%)",
        }}
      />

      {/* Subtle ground texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "256px 256px",
        }}
      />

      {/* Fog patches */}
      {[
        { x: "15%", y: "20%", w: 300, h: 80 },
        { x: "60%", y: "70%", w: 400, h: 100 },
        { x: "80%", y: "30%", w: 250, h: 60 },
      ].map((fog, i) => (
        <div
          key={i}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: fog.x,
            top: fog.y,
            width: fog.w,
            height: fog.h,
            background:
              "radial-gradient(ellipse, rgba(128,128,128,0.04) 0%, transparent 70%)",
          }}
        />
      ))}

      {/* Scattered crosses */}
      {[
        { x: 120, y: 100 },
        { x: 800, y: 50 },
        { x: 1800, y: 200 },
        { x: 300, y: 1300 },
        { x: 2100, y: 1100 },
        { x: 1400, y: 1400 },
      ].map((pos, i) => (
        <div
          key={i}
          className="absolute text-text-muted/10 pointer-events-none select-none"
          style={{
            left: pos.x,
            top: pos.y,
            fontSize: 20 + (i % 3) * 8,
            transform: `rotate(${-5 + (i % 3) * 5}deg)`,
          }}
        >
          ✝
        </div>
      ))}

      {/* Fence along the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none flex items-end justify-center gap-3 opacity-[0.08]">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="w-px bg-text-muted"
            style={{ height: 16 + (i % 3) * 4 }}
          />
        ))}
      </div>
    </>
  );
}
