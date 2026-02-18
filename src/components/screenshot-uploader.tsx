"use client";

import { useState, useRef } from "react";
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

  async function handleFiles(files: FileList) {
    if (uploadingRef.current) return;
    setGlobalError("");

    // Use functional updater to get current slot count
    let startIndex = 0;
    setSlots((prev) => {
      const activeCount = prev.filter((s) => s.status !== "error").length;
      const available = maxCount - activeCount;
      const toAdd = Math.min(files.length, available);
      startIndex = prev.length;

      if (toAdd === 0) {
        setGlobalError(`Maximum ${maxCount} screenshots allowed`);
        return prev;
      }

      return [
        ...prev,
        ...Array.from({ length: toAdd }, () => ({
          status: "uploading" as const,
        })),
      ];
    });

    // Validate files
    const toProcess = Array.from(files).slice(0, maxCount);
    for (const file of toProcess) {
      const err = validateImageFile(file);
      if (err) {
        setGlobalError(err);
        // Remove the uploading slots we just added
        setSlots((prev) => prev.filter((s) => s.status !== "uploading"));
        return;
      }
    }

    uploadingRef.current = true;

    // Get actual count of files to process from the slots we added
    let actualCount = 0;
    setSlots((prev) => {
      actualCount = prev.filter((s) => s.status === "uploading").length;
      return prev;
    });

    const filesToUpload = Array.from(files).slice(0, actualCount);

    const results = await Promise.allSettled(
      filesToUpload.map(async (file, i) => {
        const slotIndex = startIndex + i;

        const blob = await optimizeImage(file);

        const res = await fetch(
          "/api/screenshots/presign?contentType=image/webp"
        );
        if (!res.ok) throw new Error("Failed to get upload URL");
        const { uploadUrl, publicUrl } = await res.json();

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          body: blob,
          headers: { "Content-Type": "image/webp" },
        });
        if (!uploadRes.ok) throw new Error("Upload failed");

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

    setSlots((prev) => {
      const final = prev.map((slot, i) => {
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
      });

      const finalUrls = final
        .filter(
          (s): s is { status: "done"; url: string } => s.status === "done"
        )
        .map((s) => s.url);
      onChange(finalUrls);
      return final;
    });

    uploadingRef.current = false;
  }

  function removeSlot(index: number) {
    setSlots((prev) => {
      const next = prev.filter((_, i) => i !== index);
      const nextUrls = next
        .filter(
          (s): s is { status: "done"; url: string } => s.status === "done"
        )
        .map((s) => s.url);
      onChange(nextUrls);
      return next;
    });
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
