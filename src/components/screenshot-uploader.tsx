"use client";

import { useState, useRef, useEffect } from "react";
import { validateImageFile, optimizeImage } from "@/lib/image-utils";

interface ScreenshotUploaderProps {
  urls: string[];
  onChange: (urls: string[]) => void;
  maxCount?: number;
}

type SlotState =
  | { status: "uploading" }
  | { status: "done"; url: string }
  | { status: "error"; message: string };

function urlsFromSlots(slots: SlotState[]): string[] {
  return slots
    .filter((s): s is { status: "done"; url: string } => s.status === "done")
    .map((s) => s.url);
}

export function ScreenshotUploader({
  urls,
  onChange,
  maxCount = 4,
}: ScreenshotUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadingRef = useRef(false);
  const [slots, setSlots] = useState<SlotState[]>(() =>
    urls.map((url) => ({ status: "done" as const, url }))
  );
  const [globalError, setGlobalError] = useState("");

  // Sync done URLs to parent whenever slots change
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const prevUrlsRef = useRef<string>(JSON.stringify(urls));

  useEffect(() => {
    const currentUrls = JSON.stringify(urlsFromSlots(slots));
    if (currentUrls !== prevUrlsRef.current) {
      prevUrlsRef.current = currentUrls;
      onChangeRef.current(JSON.parse(currentUrls));
    }
  }, [slots]);

  async function handleFiles(files: FileList) {
    if (uploadingRef.current) return;
    setGlobalError("");

    const activeCount = slots.filter((s) => s.status !== "error").length;
    const available = maxCount - activeCount;
    const fileArray = Array.from(files).slice(0, available);

    if (fileArray.length === 0) {
      setGlobalError(`Maximum ${maxCount} screenshots allowed`);
      return;
    }

    for (const file of fileArray) {
      const err = validateImageFile(file);
      if (err) {
        setGlobalError(err);
        return;
      }
    }

    const startIndex = slots.length;

    setSlots((prev) => [
      ...prev,
      ...fileArray.map(() => ({ status: "uploading" as const })),
    ]);

    uploadingRef.current = true;

    const results = await Promise.allSettled(
      fileArray.map(async (file, i) => {
        const slotIndex = startIndex + i;

        const blob = await optimizeImage(file);

        const res = await fetch("/api/screenshots/upload", {
          method: "POST",
          body: blob,
          headers: { "Content-Type": "image/webp" },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Upload failed");
        }
        const { publicUrl } = await res.json();

        setSlots((prev) => {
          const next = [...prev];
          if (next[slotIndex]) {
            next[slotIndex] = { status: "done", url: publicUrl };
          }
          return next;
        });

        return publicUrl;
      })
    );

    // Mark failed uploads as error
    setSlots((prev) =>
      prev.map((slot, i) => {
        if (i >= startIndex && i < startIndex + results.length) {
          const result = results[i - startIndex];
          if (result.status === "rejected") {
            return {
              status: "error" as const,
              message: result.reason?.message ?? "Upload failed",
            };
          }
        }
        return slot;
      })
    );

    uploadingRef.current = false;
  }

  function removeSlot(index: number) {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  }

  const activeCount = slots.filter((s) => s.status !== "error").length;
  const canAdd = activeCount < maxCount && !uploadingRef.current;

  return (
    <div className="space-y-2">
      <label className="text-xs text-text-dim">
        Screenshots (max {maxCount})
      </label>

      <div className="flex flex-wrap gap-2">
        {slots.map((slot, i) => (
          <div
            key={i}
            className="relative w-24 h-16 border border-border rounded-md overflow-hidden bg-bg-card"
          >
            {slot.status === "done" && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slot.url}
                  alt={`Screenshot ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeSlot(i)}
                  className="absolute top-0.5 right-0.5 w-4 h-4 bg-bg border border-border rounded-sm text-text-muted text-[0.5rem] leading-none flex items-center justify-center hover:text-red hover:border-red transition-colors cursor-pointer"
                >
                  &times;
                </button>
              </>
            )}
            {slot.status === "uploading" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-text-muted text-[0.6rem] animate-pulse">
                  uploading...
                </span>
              </div>
            )}
            {slot.status === "error" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-1 gap-1">
                <span className="text-red text-[0.55rem] text-center leading-tight">
                  {slot.message}
                </span>
                <button
                  type="button"
                  onClick={() => removeSlot(i)}
                  className="text-[0.5rem] text-text-muted hover:text-text-dim cursor-pointer"
                >
                  dismiss
                </button>
              </div>
            )}
          </div>
        ))}

        {canAdd && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-16 border border-dashed border-border rounded-md bg-bg-card text-text-muted hover:border-border-hover hover:text-text-dim transition-colors cursor-pointer flex items-center justify-center text-xs"
          >
            + add
          </button>
        )}
      </div>

      {globalError && <p className="text-red text-xs">{globalError}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) {
            handleFiles(e.target.files);
            e.target.value = "";
          }
        }}
      />
    </div>
  );
}
