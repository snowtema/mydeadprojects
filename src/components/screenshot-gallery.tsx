"use client";

import { useState, useEffect, useCallback } from "react";

interface ScreenshotGalleryProps {
  urls: string[];
}

export function ScreenshotGallery({ urls }: ScreenshotGalleryProps) {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const prev = useCallback(
    () => setOpen((i) => (i !== null && i > 0 ? i - 1 : i)),
    []
  );
  const next = useCallback(
    () => setOpen((i) => (i !== null && i < urls.length - 1 ? i + 1 : i)),
    [urls.length]
  );

  useEffect(() => {
    if (open === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close, prev, next]);

  if (urls.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        {urls.map((url, i) => (
          <button
            key={url}
            type="button"
            onClick={() => setOpen(i)}
            className="relative aspect-video border border-border rounded-md overflow-hidden bg-bg-card hover:border-border-hover transition-colors cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Screenshot ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {open !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg/90 backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="relative max-w-4xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={urls[open]}
              alt={`Screenshot ${open + 1}`}
              className="w-full rounded-md border border-border"
            />

            {open > 0 && (
              <button
                type="button"
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-bg-card border border-border rounded-md text-text-muted hover:text-text-dim hover:border-border-hover transition-colors cursor-pointer flex items-center justify-center text-xs"
              >
                &larr;
              </button>
            )}
            {open < urls.length - 1 && (
              <button
                type="button"
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-bg-card border border-border rounded-md text-text-muted hover:text-text-dim hover:border-border-hover transition-colors cursor-pointer flex items-center justify-center text-xs"
              >
                &rarr;
              </button>
            )}

            <button
              type="button"
              onClick={close}
              className="absolute top-2 right-2 w-7 h-7 bg-bg-card border border-border rounded-md text-text-muted hover:text-red hover:border-red transition-colors cursor-pointer flex items-center justify-center text-xs"
            >
              &times;
            </button>

            <p className="text-center text-xs text-text-muted mt-2">
              {open + 1} / {urls.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
